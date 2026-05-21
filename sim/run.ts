// run.ts
// Startpunt van de levenssimulatie. Draait elke strategie en drukt het verloop af.
//
// Gebruik:  npm run sim            (standaard seed)
//           npm run sim -- --seed 7
//
// De simulatie is geen voorspelling. Het is een denkmodel dat de ideeen uit het
// gesprek tastbaar maakt: harde vs. zachte grenzen, hefbomen, en het verschil
// tussen een grens testen en er roekeloos tegenaan duwen.

import { STRATEGIES } from "./model.ts";
import { simulate, type LifeResult } from "./engine.ts";

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

function printLife(result: LifeResult): void {
  console.log("");
  console.log("=".repeat(72));
  console.log(`  ${result.strategy.toUpperCase()}`);
  console.log(`  ${result.tagline}`);
  console.log("=".repeat(72));
  console.log(
    `  ${pad("leeftijd", 8)} ${pad("kapitaal", 16)} ${pad("vaardig.", 9)} ` +
      `${pad("gezond.", 8)} ${pad("netwerk", 8)} ${pad("welzijn", 8)} ${pad("geloofd ink.", 14)}`,
  );

  // Toon elke zesde jaar plus altijd het laatste jaar, om de lijst kort te houden.
  const rows = result.history.filter(
    (r, idx) => idx % 6 === 0 || idx === result.history.length - 1,
  );
  for (const r of rows) {
    console.log(
      `  ${pad(r.age, 8)} ${pad(euro(r.money), 16)} ${pad(r.skill.toFixed(0), 9)} ` +
        `${pad(r.health.toFixed(0), 8)} ${pad(r.network.toFixed(0), 8)} ` +
        `${pad(r.wellbeing.toFixed(0), 8)} ${pad(euro(r.believedIncome), 14)}`,
    );
  }
  console.log(
    `  overleden op leeftijd ${result.diedAt}  |  hoogste kapitaal ooit: ${euro(result.peakMoney)}`,
  );
}

function main(): void {
  const seed = parseSeed();
  console.log("");
  console.log(`LEVENSSIMULATIE  -  "mensencode"   (seed ${seed})`);
  console.log("Drie levens vertrekken van exact dezelfde mens en dezelfde grenzen.");

  const results = STRATEGIES.map((s) => simulate(s, seed));
  for (const r of results) printLife(r);

  console.log("");
  console.log("=".repeat(72));
  console.log("  VERGELIJKING");
  console.log("=".repeat(72));
  console.log(
    `  ${pad("strategie", 26)} ${pad("leeftijd", 9)} ${pad("eindkapitaal", 16)} ${pad("welzijn", 9)}`,
  );
  for (const r of results) {
    console.log(
      `  ${pad(r.strategy, 26)} ${pad(r.diedAt, 9)} ${pad(euro(r.final.money), 16)} ` +
        `${pad(r.final.wellbeing.toFixed(0), 9)}`,
    );
  }

  console.log("");
  console.log("  Wat dit model laat zien:");
  console.log("  - Aanvaard de code : het aangenomen plafond wordt nooit getest, dus");
  console.log("    het leven blijft hangen rond een grens die niet de echte was.");
  console.log("  - Herschrijf de code: zachte grenzen testen tilt het plafond op, en");
  console.log("    hefbomen (compounding, gewoontes, feedback) laten de winst doorgroeien.");
  console.log("  - Verwar hard met zacht: tegen biologie duwen en onomkeerbaar gokken");
  console.log("    haalt je uit het spel voordat de winst kan aangroeien.");
  console.log("");
  console.log("  De code die telt is niet bovennatuurlijk: het zijn de grenzen die je");
  console.log("  test en de hefbomen die je inricht. Draai met --seed voor een ander lot.");
  console.log("");
}

main();
