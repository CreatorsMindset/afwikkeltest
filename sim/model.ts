// model.ts
// "Mensencode": een mens uitgedrukt als toestand, grenzen en hefbomen.
// Dit bestand bevat alleen de definities; engine.ts draait de simulatie erop.
//
// De kerngedachte uit het gesprek: een leven kent twee soorten grenzen.
//  - Harde grenzen  -> fysica en biologie. Niet herschrijfbaar; erop duwen kwetst.
//  - Zachte grenzen -> aangenomen plafonds. Herschrijfbaar door ze te testen.
// Daarnaast zijn er hefbomen: mechanismen die, eenmaal ingericht, vanzelf doorwerken.

// De veranderlijke toestand van de mens. Elk getal is een "register" van het leven.
export interface State {
  age: number;       // leeftijd in jaren
  money: number;     // kapitaal in euro
  skill: number;     // vaardigheid / capaciteit, 0..100
  health: number;    // gezondheid, 0..100
  network: number;   // relatiekapitaal, 0..100
  wellbeing: number; // levenstevredenheid, 0..100 (afgeleid)
  alive: boolean;
}

// Harde grenzen — fysica en biologie. De simulatie staat niet toe ze te herschrijven.
export interface HardLimits {
  lifespan: number;            // leeftijd waarop het lichaam hoe dan ook stopt
  maxSkillGainPerYear: number; // leren heeft een biologische snelheidslimiet
}

// Een zachte grens — een aangenomen plafond.
// `believed` is wat de mens voor mogelijk houdt; `real` is wat werkelijk kan.
// Testen verschuift `believed` richting `real`. `real` zelf blijft onbekend van binnenuit.
export interface SoftLimit {
  believed: number;
  real: number;
}

export interface SoftLimits {
  income: SoftLimit; // het jaarinkomen dat de mens voor mogelijk houdt
  skill: SoftLimit;  // hoeveel vaardigheid de mens denkt te kunnen bereiken
}

// De handelingen waarover het jaarlijkse energiebudget verdeeld wordt.
export type ActionKey = "work" | "learn" | "test" | "network" | "rest";

// Een strategie is de "levenscode" die de mens draait: hoe energie verdeeld wordt,
// welke hefbomen zijn ingericht, en of harde grenzen gerespecteerd worden.
export interface Strategy {
  name: string;
  tagline: string;
  // Verdeling van het energiebudget over handelingen; de waarden tellen op tot 1.
  alloc: Record<ActionKey, number>;
  // Hefbomen: structureel ingerichte mechanismen die zonder losse inzet doorwerken.
  levers: {
    compounding: boolean; // kapitaal dat zichzelf jaarlijks vermeerdert
    defaults: boolean;    // gewoontes die zonder energie kleine winst opleveren
    feedback: boolean;    // reflectie die het testen en leren effectiever maakt
  };
  // Het soort weddenschap dat de mens aangaat (optionaliteit).
  betStyle: "none" | "small-reversible" | "big-irreversible";
  // De roekeloze fout: een harde grens behandelen alsof ze zacht is.
  pushHardLimits: boolean;
}

export function newHuman(): State {
  return { age: 22, money: 2000, skill: 20, health: 92, network: 25, wellbeing: 58, alive: true };
}

export function newHardLimits(): HardLimits {
  return { lifespan: 86, maxSkillGainPerYear: 6 };
}

// De zachte grenzen starten ver onder hun echte waarde: het aangenomen plafond
// ligt veel lager dan wat werkelijk haalbaar is.
export function newSoftLimits(): SoftLimits {
  return {
    income: { believed: 34000, real: 145000 },
    skill: { believed: 52, real: 96 },
  };
}

// Drie levens, drie manieren om met dezelfde "code" om te gaan.
export const STRATEGIES: Strategy[] = [
  {
    name: "Aanvaard de code",
    tagline: "neemt elk aangenomen plafond als natuurwet; test niets, richt geen hefbomen in",
    alloc: { work: 0.58, learn: 0.04, test: 0.0, network: 0.04, rest: 0.34 },
    levers: { compounding: false, defaults: false, feedback: false },
    betStyle: "none",
    pushHardLimits: false,
  },
  {
    name: "Herschrijf de code",
    tagline: "test zachte grenzen, richt hefbomen in, neemt kleine omkeerbare risico's",
    alloc: { work: 0.32, learn: 0.22, test: 0.16, network: 0.14, rest: 0.16 },
    levers: { compounding: true, defaults: true, feedback: true },
    betStyle: "small-reversible",
    pushHardLimits: false,
  },
  {
    name: "Verwar hard met zacht",
    tagline: "duwt tegen biologische grenzen en zet groot en onomkeerbaar in",
    alloc: { work: 0.5, learn: 0.14, test: 0.1, network: 0.1, rest: 0.16 },
    levers: { compounding: true, defaults: false, feedback: false },
    betStyle: "big-irreversible",
    pushHardLimits: true,
  },
];
