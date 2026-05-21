// fortune.ts
// De ongekozen hand: ongelijke startposities en exogene schokken.
//
// Dit onderscheidt een eerlijk model van een vleiend model. Niet alles volgt uit
// je strategie. Sommigen beginnen met meer; iedereen wordt onderweg geraakt door
// gebeurtenissen die niets met zijn keuzes te maken hebben. Goede systemen
// verschuiven de kansen — ze verwijderen de dobbelsteen niet.

import {
  type State,
  type HardLimits,
  type SoftLimits,
  newHuman,
  newHardLimits,
  newSoftLimits,
} from "./model.ts";

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

function euroShort(n: number): string {
  return "EUR " + Math.round(n).toLocaleString("nl-NL");
}

export interface StartingHand {
  state: State;
  hard: HardLimits;
  soft: SoftLimits;
}

// Een willekeurige beginhand: dezelfde soort mens, een andere uitgangspositie.
export function randomizedStart(rng: () => number): StartingHand {
  const state = newHuman();
  const hard = newHardLimits();
  const soft = newSoftLimits();

  // Startkapitaal is scheef verdeeld: de meesten beginnen met weinig, enkelen
  // met een buffer die ze niet zelf verdiend hebben.
  state.money = Math.round(400 + Math.pow(rng(), 2.5) * 32000);
  state.health = clamp(state.health + (rng() - 0.5) * 16, 60, 100);
  state.fitness = clamp(state.fitness + (rng() - 0.5) * 40, 5, 90);
  state.mindset = clamp(state.mindset + (rng() - 0.5) * 36, 5, 80);
  state.resilience = clamp(state.resilience + (rng() - 0.5) * 36, 5, 85);
  state.network = clamp(state.network + (rng() - 0.5) * 30, 5, 70);
  state.skill = clamp(state.skill + (rng() - 0.5) * 16, 5, 45);

  // Genen en aanleg: niet iedereen heeft dezelfde levensduur of leersnelheid.
  hard.lifespan += Math.round((rng() - 0.5) * 18);
  hard.maxSkillGainPerYear = clamp(hard.maxSkillGainPerYear + (rng() - 0.5) * 3, 3.5, 8);

  // Ook het echte potentieel verschilt — en blijft van binnenuit onbekend.
  soft.income.real *= 0.55 + rng() * 0.95;
  soft.income.believed *= 0.8 + rng() * 0.5;
  soft.skill.real = clamp(soft.skill.real * (0.8 + rng() * 0.25), 60, 99);
  // Het geloofde plafond kan het echte niet overschrijden.
  soft.income.believed = Math.min(soft.income.believed, soft.income.real);
  soft.skill.believed = Math.min(soft.skill.believed, soft.skill.real);

  return { state, hard, soft };
}

export type ShockKind =
  | "ziekte"
  | "ongeval"
  | "recessie"
  | "baanverlies"
  | "verlies-dierbare"
  | "meevaller";

export interface Shock {
  age: number;
  kind: ShockKind;
  label: string;
  fatal: boolean;
}

// Eén jaar exogene gebeurtenissen. Muteert `s` en geeft terug wat er gebeurde.
//
// Alle dobbelstenen van het jaar worden vooraf en in vaste volgorde geworpen
// uit de aparte `luck`-stroom. Daardoor is de ongekozen hand identiek over
// strategieën heen: alleen de drempels (die van de toestand afhangen) verschillen.
// Zo verschuift een strategie wél de kans op een schok, maar niet de worp zelf.
export function applyShocks(s: State, luck: () => number): Shock[] {
  const d = Array.from({ length: 13 }, () => luck());
  const out: Shock[] = [];
  // Weerbaarheid dempt de naweeën van een klap, maar neemt hem niet weg.
  const cushion = 1 - s.resilience / 320;

  // --- Recessie: een macroschok die iedereen gelijk raakt ---
  if (d[0] < 0.04 && s.money > 0) {
    const drop = 0.2 + d[1] * 0.3;
    s.money *= 1 - drop;
    out.push({
      age: s.age,
      kind: "recessie",
      label: `recessie (markt -${Math.round(drop * 100)}%)`,
      fatal: false,
    });
  }

  // --- Ziekte: de kans daalt met conditie en gezondheid, maar verdwijnt nooit ---
  const illnessP = 0.035 * clamp(1.4 - s.fitness / 150 - s.health / 300, 0.5, 1.4);
  if (d[2] < illnessP) {
    const loss = (10 + d[3] * 20) * cushion;
    s.health = clamp(s.health - loss, 0, 100);
    s.fitness = clamp(s.fitness - 6, 0, 100);
    out.push({
      age: s.age,
      kind: "ziekte",
      label: `ziekte (-${loss.toFixed(0)} gezondheid)`,
      fatal: s.health <= 0,
    });
  }

  // --- Ongeval: grotendeels blind toeval; conditie helpt hier nauwelijks ---
  if (d[4] < 0.011) {
    const loss = (10 + d[5] * 50) * (0.6 + cushion * 0.4);
    s.health = clamp(s.health - loss, 0, 100);
    const fatal = s.health <= 0 || (loss > 50 && d[6] < 0.22);
    if (fatal) s.health = 0;
    out.push({
      age: s.age,
      kind: "ongeval",
      label: `ongeval (-${loss.toFixed(0)} gezondheid)`,
      fatal,
    });
  }

  // --- Baanverlies: vaardigheid en netwerk dempen kans en duur ---
  const jobP = 0.05 * clamp(1.3 - s.skill / 200 - s.network / 200, 0.5, 1.3);
  if (d[7] < jobP) {
    const gap = 12000 + d[8] * 20000;
    s.money -= gap;
    out.push({
      age: s.age,
      kind: "baanverlies",
      label: `baanverlies (-${euroShort(gap)})`,
      fatal: false,
    });
  }

  // --- Verlies van een dierbare: de kans stijgt met de leeftijd ---
  const griefP = 0.03 + Math.max(0, s.age - 35) * 0.0016;
  if (d[9] < griefP) {
    s.network = clamp(s.network - (8 + d[10] * 14), 0, 100);
    s.resilience = clamp(s.resilience - 6 * cushion, 0, 100);
    out.push({ age: s.age, kind: "verlies-dierbare", label: "verlies van een dierbare", fatal: false });
  }

  // --- Meevaller: een eerlijk model bevat ook geluk de andere kant op ---
  if (d[11] < 0.05) {
    const gain = 6000 + d[12] * 52000;
    s.money += gain;
    out.push({
      age: s.age,
      kind: "meevaller",
      label: `meevaller (+${euroShort(gain)})`,
      fatal: false,
    });
  }

  return out;
}
