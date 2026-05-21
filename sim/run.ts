// run.ts
// Startpunt van de levenssimulatie. Draait elke strategie en drukt het verloop af.
//
// Gebruik:  npm run sim            (standaard seed)
//           npm run sim -- --seed 7
//
// De simulatie is geen voorspelling. Het is een denkmodel dat de ideeen uit het
// gesprek tastbaar maakt: harde vs. zachte grenzen, hefbomen, en de bewezen
// systemen (protocollen) die menselijk succes nalaat — die alleen werken als je
// ze consequent volhoudt.

import { STRATEGIES } from "./model.ts";
import { simulate, type LifeResult } from "./engine.ts";
import { protocolById, MIN_ADHERENCE } from "./protocols.ts";

function parseSeed(): number {
  const i = process.argv.indexOf("--seed");
  if (i !== -1 && process.argv[i + 1]) {
    const n = Number(process.argv[i + 1]);
    if (Number.isFinite(n)) return n;
  }
  return 42;
}

function euro(n: number): string {
  return "EUR " + Math.round(n).toLocaleString("nl-NL");
}

function pad(s: string | number, width: number): string {
  return String(s).padStart(width);
}

function padEnd(s: string | number, width: number): string {
  return String(s).padEnd(width);
}

function printLife(result: LifeResult): void {
  console.log("");
  console.log("=".repeat(74));
  console.log(`  ${result.strategy.toUpperCase()}`);
  console.log(`  ${result.tagline}`);
  console.log("=".repeat(74));
  console.log(
    `  ${pad("leeftijd", 8)} ${pad("kapitaal", 16)} ${pad("vaardig.", 9)} ` +
      `${pad("gezond.", 8)} ${pad("fitness", 8)} ${pad("mindset", 8)} ${pad("welzijn", 8)}`,
  );

  // Toon elke zesde jaar plus altijd het laatste jaar, om de lijst kort te houden.
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
    `  overleden op leeftijd ${result.diedAt}  |  hoogste kapitaal: ${euro(result.peakMoney)}` +
      `  |  netwerk ${f.network.toFixed(0)}, weerbaarheid ${f.resilience.toFixed(0)}`,
  );

  // De gevolgde systemen: dezelfde "code", maar pas bruikbaar via adherence.
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

function main(): void {
  const seed = parseSeed();
  console.log("");
  console.log(`LEVENSSIMULATIE  -  "mensencode"   (seed ${seed})`);
  console.log("Drie levens vertrekken van exact dezelfde mens, grenzen en systemen.");

  const results = STRATEGIES.map((s) => simulate(s, seed));
  for (const r of results) printLife(r);

  console.log("");
  console.log("=".repeat(74));
  console.log("  VERGELIJKING");
  console.log("=".repeat(74));
  console.log(
    `  ${padEnd("strategie", 24)} ${pad("leeftijd", 9)} ${pad("eindkapitaal", 16)} ` +
      `${pad("fitness", 8)} ${pad("welzijn", 8)}`,
  );
  for (const r of results) {
    console.log(
      `  ${padEnd(r.strategy, 24)} ${pad(r.diedAt, 9)} ${pad(euro(r.final.money), 16)} ` +
        `${pad(r.final.fitness.toFixed(0), 8)} ${pad(r.final.wellbeing.toFixed(0), 8)}`,
    );
  }

  console.log("");
  console.log("  Wat dit model laat zien:");
  console.log("  - Aanvaard de code : de systemen bestaan en werken, maar wie ze niet");
  console.log("    volgt blijft hangen rond een grens die nooit de echte was.");
  console.log("  - Herschrijf de code: zachte grenzen testen tilt het plafond op, en");
  console.log("    bewezen systemen + hefbomen laten gezondheid, geld en welzijn doorgroeien.");
  console.log("  - Verwar hard met zacht: dezelfde systemen kennen helpt niet als je tegen");
  console.log("    biologie duwt — de adherence stort in en je valt vroeg uit het spel.");
  console.log("");
  console.log("  De sleutel is niet kennis maar adherence: een systeem werkt pas boven een");
  console.log("  drempel van consistentie, en die consistentie steunt op gewoontes en");
  console.log("  een growth mindset. Draai met --seed voor een ander lot.");
  console.log("");
}

main();
