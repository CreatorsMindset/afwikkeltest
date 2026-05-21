// engine.ts
// De simulatielus: draait een strategie jaar na jaar tot de mens overlijdt.

import {
  type State,
  type HardLimits,
  type SoftLimits,
  type Strategy,
  type ActionKey,
  newHuman,
  newHardLimits,
  newSoftLimits,
} from "./model.ts";
import { type ProtocolRun, newProtocolRun, stepProtocols } from "./protocols.ts";

const LIVING_COST = 24000;  // jaarlijkse vaste levenskost in euro
const BASE_INCOME = 16000;  // inkomensbodem voordat vaardigheid en netwerk meetellen
const COMPOUND_RATE = 0.05; // jaarlijks rendement van de compounding-hefboom

export interface YearRecord {
  age: number;
  money: number;
  skill: number;
  health: number;
  fitness: number;
  mindset: number;
  resilience: number;
  network: number;
  wellbeing: number;
  believedIncome: number; // het op dat moment aangenomen inkomensplafond
}

export interface LifeResult {
  strategy: string;
  tagline: string;
  adopted: string[];
  protocolRun: ProtocolRun;
  history: YearRecord[];
  diedAt: number;
  peakMoney: number;
  final: State;
}

// Kleine, deterministische pseudo-randomgenerator zodat een seed reproduceerbaar is.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

// Eén levensjaar. Past de toestand en de zachte grenzen rechtstreeks aan.
function stepYear(
  s: State,
  hard: HardLimits,
  soft: SoftLimits,
  st: Strategy,
  run: ProtocolRun,
  rng: () => number,
): void {
  s.age += 1;

  // --- Energiebudget van het jaar ---
  // De energiecap volgt uit gezondheid en conditie: geen oneindige bron.
  let energy = clamp(40 + s.health * 0.4 + s.fitness * 0.25, 30, 110);
  // De roekeloze fout: voorbij de cap "lenen" alsof rust een zachte grens is.
  if (st.pushHardLimits) energy += 28;

  const e: Record<ActionKey, number> = {
    work: energy * st.alloc.work,
    learn: energy * st.alloc.learn,
    test: energy * st.alloc.test,
    network: energy * st.alloc.network,
    rest: energy * st.alloc.rest,
  };

  // --- Natuurlijke erosie: zonder onderhoud zakken conditie en weerbaarheid ---
  s.fitness = clamp(s.fitness - 1.2, 0, 100);
  s.resilience = clamp(s.resilience - 0.5, 0, 100);
  s.mindset = clamp(s.mindset - 0.3, 0, 100);

  // --- Protocollen: de bewezen systemen toepassen (zie protocols.ts) ---
  // Werkt alleen via adherence, en adherence steunt op de defaults-hefboom.
  stepProtocols(
    s,
    st.protocols,
    run,
    { defaults: st.levers.defaults, pushHardLimits: st.pushHardLimits },
    rng,
  );

  // Mindset versnelt zowel leren als het verleggen van zachte grenzen.
  const feedbackMul = st.levers.feedback ? 1.5 : 1;
  const mindsetMul = 1 + s.mindset / 200;

  // --- Testen: zachte grenzen verschuiven richting hun echte waarde ---
  // Dit is de kern van "je code herschrijven": een aangenomen muur die meegeeft.
  if (e.test > 0) {
    for (const wall of [soft.income, soft.skill]) {
      const gap = wall.real - wall.believed;
      const luck = 0.6 + rng() * 0.8; // de ene muur geeft sneller mee dan de andere
      wall.believed = Math.min(
        wall.real,
        wall.believed + gap * (e.test / 100) * 0.35 * feedbackMul * mindsetMul * luck,
      );
    }
  }

  // --- Leren: begrensd door biologie (hard) en door het geloof (zacht) ---
  const skillGain = Math.min(
    (e.learn / 100) * 14 * feedbackMul * mindsetMul,
    hard.maxSkillGainPerYear,
  );
  s.skill = clamp(Math.min(s.skill + skillGain, soft.skill.believed), 0, 100);

  // --- Netwerk: groeit met inzet, brokkelt licht af zonder onderhoud ---
  s.network = clamp(s.network + (e.network / 100) * 9 - 0.6, 0, 100);

  // --- Hefboom: defaults — gewoontes die zonder losse energie doorlopen ---
  if (st.levers.defaults) {
    s.skill = clamp(Math.min(s.skill + 0.9, soft.skill.believed), 0, 100);
    s.health = clamp(s.health + 1.6, 0, 100);
    s.network = clamp(s.network + 0.7, 0, 100);
  }

  // --- Werk en inkomen ---
  // Het verdienpotentieel groeit met vaardigheid en netwerk, maar het feitelijke
  // inkomen wordt afgetopt op wat de mens voor mogelijk houdt (de zachte grens).
  const potential = BASE_INCOME * (1 + s.skill / 38) * (1 + s.network / 110);
  const workFactor = clamp(0.45 + 0.55 * st.alloc.work, 0, 1.1);
  const income = Math.min(potential, soft.income.believed) * workFactor;
  s.money += income - LIVING_COST;

  // --- Hefboom: compounding — kapitaal dat zichzelf vermeerdert ---
  if (st.levers.compounding && s.money > 0) {
    s.money += s.money * COMPOUND_RATE;
  }

  // --- Weddenschappen / optionaliteit ---
  if (st.betStyle === "small-reversible" && s.money > 3000) {
    // Kleine, omkeerbare inzet: meestal verlies je de inzet, soms een mooie winst.
    s.money -= 1000;
    if (rng() < 0.28) s.money += 1000 + 3000 + rng() * 9000;
  } else if (st.betStyle === "big-irreversible" && s.money > 0) {
    // Grote, onomkeerbare inzet: kans op verdubbeling, grotere kans op zware klap.
    // Weerbaarheid dempt de klap, maar neemt hem niet weg.
    if (rng() < 0.32) s.money += s.money;
    else s.money -= s.money * 0.6 * (1 - s.resilience / 250);
  }

  // --- Gezondheid ---
  // Conditie versnelt herstel; weerbaarheid vertraagt de slijtage van het ouder worden.
  const aging = (s.age > 40 ? (s.age - 40) * 0.06 : 0) * (1 - s.resilience / 300);
  const recovery = (e.rest / 100) * 9 + s.fitness * 0.03;
  let health = s.health + recovery - 3 - aging;
  if (st.pushHardLimits) health -= 7; // geleende energie is geen gratis energie
  s.health = clamp(health, 0, 100);

  // --- Welzijn: een afgeleide van alle andere toestanden ---
  const financialSecurity = clamp(s.money / 5000, 0, 100); // ~EUR 500k is verzadiging
  s.wellbeing = clamp(
    0.2 * s.health +
      0.16 * s.fitness +
      0.22 * financialSecurity +
      0.14 * s.network +
      0.12 * s.skill +
      0.1 * s.resilience +
      0.06 * s.mindset,
    0,
    100,
  );

  // --- Sterfte: een harde grens die niemand herschrijft ---
  if (s.health <= 0 || s.age >= hard.lifespan) {
    s.alive = false;
  }
}

export function simulate(strategy: Strategy, seed: number): LifeResult {
  const rng = mulberry32(seed);
  const state = newHuman();
  const hard = newHardLimits();
  const soft = newSoftLimits();
  const run = newProtocolRun(strategy.protocols);
  // Lichte spreiding op de levensduur, zodat de seed het lot mee bepaalt.
  hard.lifespan += Math.round((rng() - 0.5) * 8);

  const history: YearRecord[] = [];
  let peakMoney = state.money;

  while (state.alive) {
    stepYear(state, hard, soft, strategy, run, rng);
    peakMoney = Math.max(peakMoney, state.money);
    history.push({
      age: state.age,
      money: state.money,
      skill: state.skill,
      health: state.health,
      fitness: state.fitness,
      mindset: state.mindset,
      resilience: state.resilience,
      network: state.network,
      wellbeing: state.wellbeing,
      believedIncome: soft.income.believed,
    });
  }

  return {
    strategy: strategy.name,
    tagline: strategy.tagline,
    adopted: strategy.protocols,
    protocolRun: run,
    history,
    diedAt: state.age,
    peakMoney,
    final: state,
  };
}
