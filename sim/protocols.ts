// protocols.ts
// De "code" die menselijk succes nalaat: bewezen systemen die, mits consequent
// gevolgd, een specifieke uitkomst opleveren — vermageren, conditie, een growth
// mindset, productiviteit, weerbaarheid, relaties.
//
// Elk protocol is data; de engine past het toe. De centrale les zit in de
// *adherence*: een systeem kennen is niet genoeg. Een protocol werkt alleen
// als je het volhoudt, en volhouden lukt pas met gewoontes en een growth mindset.
// Onder een drempel van consistentie beweegt de naald nauwelijks.

import type { State } from "./model.ts";

// De toestandsdimensies waar een protocol op kan inwerken. Geld staat hier
// bewust niet tussen: het is een uitkomst van de andere dimensies, geen knop.
export type ProtocolDim =
  | "skill"
  | "health"
  | "fitness"
  | "mindset"
  | "resilience"
  | "network";

export interface Protocol {
  id: string;
  name: string;
  basis: string; // de bewezen kern, in één zin
  // Jaarlijkse winst per dimensie bij volledige adherence (1.0).
  effects: Partial<Record<ProtocolDim, number>>;
  // Sommige systemen tillen de adherence van álle andere protocollen op.
  boostsAdherence?: number;
}

export const PROTOCOLS: Protocol[] = [
  {
    id: "gewoonteketens",
    name: "Gewoonteketens",
    basis: "kleine gewoontes, verankerd in identiteit en bestaande routines",
    effects: {},
    boostsAdherence: 0.18, // maakt élk ander protocol bestendiger
  },
  {
    id: "growth-mindset",
    name: "Growth mindset",
    basis: "vermogen is rekbaar; inzet en tegenslag verleggen de grens",
    effects: { mindset: 8 },
  },
  {
    id: "slaaphygiene",
    name: "Slaaphygiëne",
    basis: "slaap is het fundament onder herstel, brein en humeur",
    effects: { health: 3, resilience: 3, mindset: 2 },
  },
  {
    id: "caloriebalans-kracht",
    name: "Vermageren & kracht",
    basis: "energiebalans plus progressieve overbelasting",
    effects: { fitness: 7 },
  },
  {
    id: "zone2-interval",
    name: "Uithouding opbouwen",
    basis: "aerobe basis met intervallen voor VO2max",
    effects: { fitness: 5, health: 3 },
  },
  {
    id: "deep-work",
    name: "Deep work & timeboxing",
    basis: "onverdeelde aandacht, in blokken, op één zware taak",
    effects: { skill: 5 },
  },
  {
    id: "relaties-onderhouden",
    name: "Relaties onderhouden",
    basis: "regelmatig, oprecht contact met wie er echt toe doet",
    effects: { network: 6, resilience: 2 },
  },
  {
    id: "reflectie-dagboek",
    name: "Reflectie & dagboek",
    basis: "stoïcijnse reflectie zet tegenslag om in weerbaarheid",
    effects: { resilience: 6, mindset: 2 },
  },
];

export function protocolById(id: string): Protocol {
  const p = PROTOCOLS.find((x) => x.id === id);
  if (!p) throw new Error(`onbekend protocol: ${id}`);
  return p;
}

// Onder deze adherence beweegt de naald nauwelijks: tweemaal per maand sporten
// of mediteren levert geen resultaat. Consistentie is de poort, niet de intentie.
export const MIN_ADHERENCE = 0.3;

export interface ProtocolRun {
  adherence: Record<string, number>;    // huidige adherence per protocol-id, 0..1
  contribution: Record<string, number>; // som van geleverde winst (punten) per id
}

export function newProtocolRun(adopted: string[]): ProtocolRun {
  const adherence: Record<string, number> = {};
  const contribution: Record<string, number> = {};
  for (const id of adopted) {
    adherence[id] = 0.5; // een gemotiveerde start
    contribution[id] = 0;
  }
  return { adherence, contribution };
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

// Eén jaar protocollen: werk de adherence bij en pas de effecten toe op de staat.
// Muteert `s` en `run` rechtstreeks.
export function stepProtocols(
  s: State,
  adopted: string[],
  run: ProtocolRun,
  opts: { defaults: boolean; pushHardLimits: boolean },
  rng: () => number,
): void {
  if (adopted.length === 0) return;

  // Synergie: de gewoonteketens-hefboom tilt de adherence van álles op —
  // maar alleen voor zover je dat ene systeem zélf volhoudt.
  let habitBoost = 0;
  if (adopted.includes("gewoonteketens")) {
    const hp = protocolById("gewoonteketens");
    habitBoost = (hp.boostsAdherence ?? 0) * run.adherence["gewoonteketens"];
  }

  for (const id of adopted) {
    // --- Adherence bijwerken: waar wordt dit protocol naartoe getrokken? ---
    let baseline = 0.22;
    if (opts.defaults) baseline += 0.42;        // gewoontes maken het bestendig
    baseline += (s.mindset / 100) * 0.22;       // growth mindset -> volhouden
    baseline += habitBoost;                     // gewoonteketens tilt alles op
    if (opts.pushHardLimits) baseline -= 0.3;   // overbelasting -> burn-out
    baseline = clamp(baseline, 0.05, 0.97);

    let a = run.adherence[id];
    a += (baseline - a) * 0.5;        // de adherence kruipt richting de baseline
    a += (rng() - 0.5) * 0.12;        // goede en slechte maanden
    run.adherence[id] = clamp(a, 0, 1);

    // --- Effect: alleen boven de consistentiedrempel beweegt er iets ---
    if (run.adherence[id] < MIN_ADHERENCE) continue;
    const scale = (run.adherence[id] - MIN_ADHERENCE) / (1 - MIN_ADHERENCE);
    const p = protocolById(id);
    for (const [dim, gain] of Object.entries(p.effects) as [ProtocolDim, number][]) {
      const before = s[dim];
      s[dim] = clamp(s[dim] + gain * scale, 0, 100);
      run.contribution[id] += s[dim] - before;
    }
  }
}
