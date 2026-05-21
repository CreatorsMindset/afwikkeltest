// run.ts
// Startpunt van de levenssimulatie.
//
// Gebruik:
//   npm run sim                      Monte Carlo: elke strategie speelt vele levens,
//                                    en de uitkomst is een verdeling, geen belofte.
//   npm run sim -- --runs 1000       aantal levens per strategie
//   npm run sim -- --trace           één gedetailleerd leven per strategie tonen
//   npm run sim -- --trace --seed 7  dat ene leven met een gekozen lot
//
// De simulatie is geen voorspelling. Het is een denkmodel: harde vs. zachte
// grenzen, hefbomen, bewezen systemen (protocollen) — en de ongekozen hand van
// startpositie en schokken. Een goede strategie verschuift de kansen; ze
// garandeert geen enkele uitkomst.

import { STRATEGIES } from "./model.ts";
import { simulate, type LifeResult } from "./engine.ts";
import { protocolById, MIN_ADHERENCE } from "./protocols.ts";

function intArg(flag: string, fallback: number): number {
  const i = process.argv.indexOf(flag);
  if (i !== -1 && process.argv[i + 1]) {
    const n = Number(process.argv[i + 1]);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function euro(n: number): string {
  const sign = n < 0 ? "-" : "";
  return sign + "EUR " + Math.round(Math.abs(n)).toLocaleString("nl-NL");
}

function pct(n: number): string {
  return (n * 100).toFixed(0) + "%";
}

function pad(s: string | number, width: number): string {
  return String(s).padStart(width);
}

function padEnd(s: string | number, width: number): string {
  return String(s).padEnd(width);
}

// ---------------------------------------------------------------------------
// Monte Carlo: de eerlijke weergave — een verdeling over vele levens.
// ---------------------------------------------------------------------------

// Het waarde-op-percentiel uit een oplopend gesorteerde reeks.
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[i];
}

interface Summary {
  name: string;
  tagline: string;
  medianMoney: number;
  p10Money: number;
  p90Money: number;
  medianAge: number;
  p10Age: number;
  medianWellbeing: number;
  diedYoung: number; // aandeel dat voor 60 sterft
  endsBroke: number; // aandeel dat zonder kapitaal eindigt
  thrives: number;   // aandeel dat welzijn >= 75 haalt en minstens 75 wordt
}

function summarize(name: string, tagline: string, lives: LifeResult[]): Summary {
  const n = lives.length;
  const money = lives.map((r) => r.final.money).sort((a, b) => a - b);
  const ages = lives.map((r) => r.diedAt).sort((a, b) => a - b);
  const wb = lives.map((r) => r.final.wellbeing).sort((a, b) => a - b);
  return {
    name,
    tagline,
    medianMoney: percentile(money, 50),
    p10Money: percentile(money, 10),
    p90Money: percentile(money, 90),
    medianAge: percentile(ages, 50),
    p10Age: percentile(ages, 10),
    medianWellbeing: percentile(wb, 50),
    diedYoung: lives.filter((r) => r.diedAt < 60).length / n,
    endsBroke: lives.filter((r) => r.final.money < 0).length / n,
    thrives: lives.filter((r) => r.final.wellbeing >= 75 && r.diedAt >= 75).length / n,
  };
}

function printSummary(s: Summary, runs: number): void {
  console.log("");
  console.log("=".repeat(74));
  console.log(`  ${s.name.toUpperCase()}`);
  console.log(`  ${s.tagline}`);
  console.log("=".repeat(74));
  console.log(`  verdeling over ${runs} levens, elk met een andere hand en andere schokken:`);
  console.log("");
  console.log(
    `  eindkapitaal     mediaan ${pad(euro(s.medianMoney), 16)}` +
      `   (p10 ${euro(s.p10Money)}  ..  p90 ${euro(s.p90Money)})`,
  );
  console.log(
    `  leeftijd overl.  mediaan ${pad(s.medianAge, 16)}   (ongelukkigste 10%: <= ${s.p10Age})`,
  );
  console.log(`  welzijn (eind)   mediaan ${pad(s.medianWellbeing.toFixed(0), 16)}`);
  console.log("");
  console.log(`  jong gestorven (voor 60):      ${pad(pct(s.diedYoung), 5)}`);
  console.log(`  eindigt zonder kapitaal:       ${pad(pct(s.endsBroke), 5)}`);
  console.log(`  bloeit (welzijn >= 75, 75+):   ${pad(pct(s.thrives), 5)}`);
}

function runMonteCarlo(runs: number): void {
  console.log("");
  console.log(`LEVENSSIMULATIE  -  "mensencode"   (Monte Carlo, ${runs} levens per strategie)`);
  console.log("Elke strategie speelt vele levens. De beginhand en de schokken zijn telkens");
  console.log("anders en niet gekozen. De uitkomst is een verdeling, geen belofte.");

  const summaries = STRATEGIES.map((st) => {
    const lives: LifeResult[] = [];
    for (let seed = 1; seed <= runs; seed++) lives.push(simulate(st, seed));
    return summarize(st.name, st.tagline, lives);
  });

  for (const s of summaries) printSummary(s, runs);

  console.log("");
  console.log("=".repeat(74));
  console.log("  VERGELIJKING");
  console.log("=".repeat(74));
  console.log(
    `  ${padEnd("strategie", 24)} ${pad("med. kapitaal", 16)} ${pad("med. lft", 9)} ` +
      `${pad("jong dood", 10)} ${pad("bloeit", 8)}`,
  );
  for (const s of summaries) {
    console.log(
      `  ${padEnd(s.name, 24)} ${pad(euro(s.medianMoney), 16)} ${pad(s.medianAge, 9)} ` +
        `${pad(pct(s.diedYoung), 10)} ${pad(pct(s.thrives), 8)}`,
    );
  }

  console.log("");
  console.log("  Wat dit model laat zien:");
  console.log("  - Strategie verschuift de verdeling, ze schrijft de uitkomst niet. Zelfs");
  console.log("    'Herschrijf de code' kent levens die jong stranden door ziekte of pech.");
  console.log("  - Wat een goed systeem doet, is de kans op een slechte afloop verkleinen");
  console.log("    en de kans op bloei vergroten — kijk naar 'jong dood' en 'bloeit'.");
  console.log("  - De spreiding tussen p10 en p90 is breed. Geluk is reëel; het is alleen");
  console.log("    geen vervanging voor de hefbomen en systemen die je wél in de hand hebt.");
  console.log("");
  console.log("  Draai met --trace voor één uitvergroot leven, of --runs N voor meer levens.");
  console.log("");
}

// ---------------------------------------------------------------------------
// Trace: één leven jaar na jaar, inclusief de schokken die het trof.
// ---------------------------------------------------------------------------

function printTrace(result: LifeResult): void {
  console.log("");
  console.log("=".repeat(74));
  console.log(`  ${result.strategy.toUpperCase()}`);
  console.log(`  ${result.tagline}`);
  console.log("=".repeat(74));
  console.log(
    `  ${pad("leeftijd", 8)} ${pad("kapitaal", 16)} ${pad("vaardig.", 9)} ` +
      `${pad("gezond.", 8)} ${pad("fitness", 8)} ${pad("mindset", 8)} ${pad("welzijn", 8)}`,
  );

  const rows = result.history.filter(
    (r, idx) => idx % 6 === 0 || idx === result.history.length - 1,
  );
  for (const r of rows) {
    console.log(
      `  ${pad(r.age, 8)} ${pad(euro(r.money), 16)} ${pad(r.skill.toFixed(0), 9)} ` +
        `${pad(r.health.toFixed(0), 8)} ${pad(r.fitness.toFixed(0), 8)} ` +
        `${pad(r.mindset.toFixed(0), 8)} ${pad(r.wellbeing.toFixed(0), 8)}`,
    );
  }

  const f = result.final;
  console.log(
    `  overleden op leeftijd ${result.diedAt} (${result.causeOfDeath})  |  ` +
      `hoogste kapitaal: ${euro(result.peakMoney)}  |  ` +
      `netwerk ${f.network.toFixed(0)}, weerbaarheid ${f.resilience.toFixed(0)}`,
  );

  // De ongekozen hand: wat dit leven trof, los van elke strategie.
  console.log("  Schokken (de ongekozen hand):");
  if (result.shocks.length === 0) {
    console.log("    geen — dit leven bleef gespaard.");
  } else {
    for (const sh of result.shocks) {
      console.log(`    leeftijd ${pad(sh.age, 2)}: ${sh.label}${sh.fatal ? "  <- fataal" : ""}`);
    }
  }

  console.log("  Gevolgde systemen (de code van menselijk succes):");
  if (result.adopted.length === 0) {
    console.log("    geen — de systemen bestaan en laten sporen na, maar worden niet gevolgd.");
    return;
  }
  for (const id of result.adopted) {
    const p = protocolById(id);
    const adherence = result.protocolRun.adherence[id];
    const contribution = result.protocolRun.contribution[id];
    const note = adherence < MIN_ADHERENCE ? "  <- onder de drempel, nauwelijks effect" : "";
    console.log(
      `    ${padEnd(p.name, 22)} adherence ${pad((adherence * 100).toFixed(0) + "%", 5)}` +
        `  bijdrage ${pad("+" + contribution.toFixed(0) + " pt", 9)}${note}`,
    );
  }
}

function runTrace(seed: number): void {
  console.log("");
  console.log(`LEVENSSIMULATIE  -  "mensencode"   (trace, seed ${seed})`);
  console.log("Drie levens met dezelfde beginhand en dezelfde ongekozen hand — alleen de");
  console.log("strategie verschilt. Ze bepaalt mee welke schokken aanslaan, niet de worp.");
  for (const st of STRATEGIES) printTrace(simulate(st, seed));
  console.log("");
  console.log("  Let op: dit is één lot. Draai zonder --trace voor de eerlijke verdeling");
  console.log("  over vele levens — één trace kan toevallig mee- of tegenzitten.");
  console.log("");
}

function main(): void {
  if (process.argv.includes("--trace")) {
    runTrace(intArg("--seed", 42));
  } else {
    runMonteCarlo(intArg("--runs", 500));
  }
}

main();
