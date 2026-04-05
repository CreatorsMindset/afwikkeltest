// Profiles
export type ProfileKey = "drager" | "pleaser" | "controleur" | "twijfelaar" | "versneller";

export interface Profile {
  key: ProfileKey;
  name: string;
  tagline: string;
  description: string;
  howYouGetTangled: string;
  whatYouCarry: string;
  firstMove: string;
  weekAdvice: string;
  strength: string;
  shadow: string;
  color: string;
}

export const profiles: Record<ProfileKey, Profile> = {
  drager: {
    key: "drager",
    name: "De Drager",
    tagline: "Je draagt meer dan van jou is",
    description:
      "Je voelt je verantwoordelijk voor alles en iedereen om je heen. Zonder dat iemand het vraagt, neem jij het op je. Je bent degene die overal het gewicht van voelt — en het ook zelden neerlegt.",
    howYouGetTangled:
      "Door te geloven dat het pas goed komt als jij het draagt. Je verwart verantwoordelijkheid met zorg, en legt de lat zo hoog dat ontspanning voelt als falen.",
    whatYouCarry:
      "De zorgen van anderen. Verwachtingen die niemand heeft uitgesproken. Het idee dat het zonder jou misgaat.",
    firstMove:
      "Leg vandaag bewust één ding neer dat niet van jou is. Niet door het uit te spreken — maar door het los te laten in je hoofd.",
    weekAdvice:
      "Schrijf elke avond op: wat heb ik vandaag gedragen dat niet van mij was? Na zeven dagen zie je het patroon.",
    strength: "Betrouwbaarheid en diepgevoelde betrokkenheid",
    shadow: "Uitputting, martelaarschap en onzichtbare frustratie",
    color: "hsl(195, 50%, 42%)",
  },
  pleaser: {
    key: "pleaser",
    name: "De Pleaser",
    tagline: "Je vormt je naar wat de ander nodig heeft",
    description:
      "Je bent een meester in aanvoelen. Je weet precies wat iemand wil horen, en je geeft het — vaak nog voor ze erom vragen. Maar ergens onderweg raakte je eigen stem wat stiller.",
    howYouGetTangled:
      "Door je waarde af te meten aan de tevredenheid van anderen. Je maakt jezelf klein om de harmonie te bewaren, en noemt dat 'lief zijn'.",
    whatYouCarry:
      "Het verlangen naar goedkeuring. De angst om af te vallen. Een diep verborgen boosheid die je zelden toelaat.",
    firstMove:
      "Zeg vandaag één keer 'nee' zonder uitleg. Niet hard — maar helder. Merk op wat er gebeurt.",
    weekAdvice:
      "Stel jezelf elke ochtend de vraag: wat wil ik vandaag écht? Doe minstens één ding puur voor jezelf.",
    strength: "Empathie, verbinding en fijngevoeligheid",
    shadow: "Zelfverlies, onderdrukte woede en emotionele uitputting",
    color: "hsl(32, 60%, 50%)",
  },
  controleur: {
    key: "controleur",
    name: "De Controleur",
    tagline: "Je houdt alles strak — inclusief jezelf",
    description:
      "Structuur is je houvast. Je hebt graag overzicht, plant vooruit en voelt je onrustig als dingen onvoorspelbaar worden. Controle voelt voor jou als veiligheid.",
    howYouGetTangled:
      "Door te geloven dat je alles kunt beheersen als je maar hard genoeg plant. Je verwart controle met rust, terwijl het juist spanning creëert.",
    whatYouCarry:
      "Een constante waakzaamheid. Moeite met vertrouwen op anderen. De angst dat het misgaat als je loslaat.",
    firstMove:
      "Laat vandaag bewust één ding over aan iemand anders — zonder in te grijpen, zonder te checken.",
    weekAdvice:
      "Kies elke dag één moment waarop je bewust niet plant. Loop zonder route. Eet zonder recept. Merk op hoe dat voelt.",
    strength: "Overzicht, betrouwbaarheid en doelgerichtheid",
    shadow: "Rigiditeit, micromanagement en angst voor kwetsbaarheid",
    color: "hsl(280, 40%, 50%)",
  },
  twijfelaar: {
    key: "twijfelaar",
    name: "De Twijfelaar",
    tagline: "Je wikt en weegt tot het moment voorbij is",
    description:
      "Je denkt diep na, weegt opties af en ziet nuances die anderen missen. Maar al dat nadenken wordt soms een labyrint waar je zelf in verdwaalt.",
    howYouGetTangled:
      "Door te geloven dat er altijd een béter antwoord is als je maar lang genoeg nadenkt. Je twijfelt niet uit onzekerheid — maar uit perfectionisme.",
    whatYouCarry:
      "Een hoofd dat nooit stilstaat. Het gevoel dat elke keuze definitief is. De angst om het verkeerde te doen.",
    firstMove:
      "Neem vandaag één beslissing binnen 30 seconden. Klein mag. Merk op dat de wereld niet instort.",
    weekAdvice:
      "Voer een 'goed genoeg'-regel in: als een keuze voor 80% klopt, doe je het. Schrijf aan het eind van de week op hoeveel keer dat goed uitpakte.",
    strength: "Diepgang, nuance en zorgvuldigheid",
    shadow: "Verlamming, uitstel en gemiste kansen",
    color: "hsl(220, 45%, 50%)",
  },
  versneller: {
    key: "versneller",
    name: "De Versneller",
    tagline: "Je rent sneller dan je lichaam kan bijhouden",
    description:
      "Je hebt energie, drive en altijd een volgend plan. Stilstaan voelt als achteruitgaan. Je leeft in de toekomst en mist soms het moment waarop je nu staat.",
    howYouGetTangled:
      "Door te geloven dat druk zijn hetzelfde is als waardevol zijn. Je vult elk gaatje op en noemt dat 'ambitie', terwijl het eigenlijk vluchtgedrag is.",
    whatYouCarry:
      "Een onrust die je niet kunt benoemen. Het gevoel dat je nog niet genoeg bent. Een lichaam dat signalen geeft die je negeert.",
    firstMove:
      "Blokkeer vandaag 15 minuten in je agenda en doe letterlijk niets. Geen telefoon, geen podcast, geen plan.",
    weekAdvice:
      "Tel deze week hoeveel keer je 'druk' als antwoord geeft op de vraag hoe het gaat. Vervang het door een eerlijker woord.",
    strength: "Daadkracht, energie en inspirerend leiderschap",
    shadow: "Burn-out, oppervlakkigheid en vermijding van kwetsbaarheid",
    color: "hsl(350, 50%, 50%)",
  },
};

export interface Statement {
  id: number;
  text: string;
  profileWeights: Partial<Record<ProfileKey, number>>;
}

export const statements: Statement[] = [
  {
    id: 1,
    text: "Ik voel me al snel verantwoordelijk voor hoe het met anderen gaat.",
    profileWeights: { drager: 2, pleaser: 1 },
  },
  {
    id: 2,
    text: "Ik merk dat ik vaak 'ja' zeg terwijl ik eigenlijk 'nee' bedoel.",
    profileWeights: { pleaser: 2, drager: 1 },
  },
  {
    id: 3,
    text: "Ik heb graag overzicht en word onrustig als ik dat verlies.",
    profileWeights: { controleur: 2, twijfelaar: 1 },
  },
  {
    id: 4,
    text: "Ik stel beslissingen liever uit tot ik zeker weet dat het de juiste keuze is.",
    profileWeights: { twijfelaar: 2 },
  },
  {
    id: 5,
    text: "Stilzitten voelt voor mij als stilstaan — ik wil altijd vooruit.",
    profileWeights: { versneller: 2 },
  },
  {
    id: 6,
    text: "Ik neem dingen op me die eigenlijk niet mijn taak zijn.",
    profileWeights: { drager: 2 },
  },
  {
    id: 7,
    text: "Ik pas me aan de stemming van de ander aan, soms zonder het te beseffen.",
    profileWeights: { pleaser: 2 },
  },
  {
    id: 8,
    text: "Ik vind het moeilijk om iets aan een ander over te laten zonder te checken of het goed gaat.",
    profileWeights: { controleur: 2, drager: 1 },
  },
  {
    id: 9,
    text: "Na een drukke dag merk ik dat ik eigenlijk niet meer weet wat ik zelf wilde.",
    profileWeights: { pleaser: 1, versneller: 1, drager: 1 },
  },
  {
    id: 10,
    text: "Ik denk vaak nog lang na over gesprekken die al voorbij zijn.",
    profileWeights: { twijfelaar: 2, pleaser: 1 },
  },
  {
    id: 11,
    text: "Mensen om me heen zeggen weleens dat ik te veel hooi op mijn vork neem.",
    profileWeights: { drager: 1, versneller: 2 },
  },
  {
    id: 12,
    text: "Ik voel me ongemakkelijk als er conflicten zijn, ook al gaan ze niet over mij.",
    profileWeights: { pleaser: 2, drager: 1 },
  },
  {
    id: 13,
    text: "Ik maak lijstjes, structuren en planningen — soms meer dan nodig is.",
    profileWeights: { controleur: 2 },
  },
  {
    id: 14,
    text: "Ik twijfel regelmatig of ik de juiste richting in mijn leven heb gekozen.",
    profileWeights: { twijfelaar: 2 },
  },
  {
    id: 15,
    text: "Ik vul mijn agenda liever vol dan dat ik er lege plekken in laat.",
    profileWeights: { versneller: 2, controleur: 1 },
  },
  {
    id: 16,
    text: "Ik heb het gevoel dat ik het niet mag laten zien als het me te veel wordt.",
    profileWeights: { drager: 2, controleur: 1 },
  },
  {
    id: 17,
    text: "Ik stem mijn mening vaak af op wat sociaal acceptabel is.",
    profileWeights: { pleaser: 2 },
  },
  {
    id: 18,
    text: "Als iets onverwacht verandert, heb ik tijd nodig om me aan te passen.",
    profileWeights: { controleur: 2, twijfelaar: 1 },
  },
  {
    id: 19,
    text: "Ik merk dat ik mezelf vergelijk met anderen en dan tekortschiet.",
    profileWeights: { twijfelaar: 1, pleaser: 1, versneller: 1 },
  },
  {
    id: 20,
    text: "Ik vind rust pas als alles op mijn to-do-lijst is afgevinkt.",
    profileWeights: { versneller: 1, controleur: 2 },
  },
  {
    id: 21,
    text: "Ik slik mijn frustraties in om de lieve vrede te bewaren.",
    profileWeights: { pleaser: 2, drager: 1 },
  },
  {
    id: 22,
    text: "Ik heb het gevoel dat ik altijd 'aan' sta en moeilijk kan afschakelen.",
    profileWeights: { versneller: 2, controleur: 1 },
  },
  {
    id: 23,
    text: "Ik leg de lat voor mezelf hoog en ben teleurgesteld als ik er niet aan voldoe.",
    profileWeights: { controleur: 1, twijfelaar: 1, drager: 1 },
  },
  {
    id: 24,
    text: "Ik denk vaak: als ik het niet doe, doet niemand het.",
    profileWeights: { drager: 2, controleur: 1 },
  },
  {
    id: 25,
    text: "Ik voel me schuldig als ik tijd voor mezelf neem.",
    profileWeights: { drager: 1, pleaser: 1, versneller: 1 },
  },
];

export function calculateResults(answers: Record<number, number>) {
  const scores: Record<ProfileKey, number> = {
    drager: 0,
    pleaser: 0,
    controleur: 0,
    twijfelaar: 0,
    versneller: 0,
  };

  for (const stmt of statements) {
    const answer = answers[stmt.id] ?? 3; // default neutral
    for (const [profile, weight] of Object.entries(stmt.profileWeights)) {
      scores[profile as ProfileKey] += answer * (weight as number);
    }
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const primaryKey = sorted[0][0] as ProfileKey;
  const secondaryKey = sorted[1][0] as ProfileKey;

  // Only show secondary if it's meaningfully close (within 70% of primary)
  const primaryScore = sorted[0][1];
  const secondaryScore = sorted[1][1];
  const showSecondary = secondaryScore >= primaryScore * 0.7;

  return {
    scores,
    primaryProfile: primaryKey,
    secondaryProfile: showSecondary ? secondaryKey : undefined,
    maxPossible: getMaxPossibleScore(),
  };
}

function getMaxPossibleScore(): number {
  // Max score per profile = sum of all weights for that profile * 5 (max answer)
  const maxScores: Record<ProfileKey, number> = {
    drager: 0,
    pleaser: 0,
    controleur: 0,
    twijfelaar: 0,
    versneller: 0,
  };
  for (const stmt of statements) {
    for (const [profile, weight] of Object.entries(stmt.profileWeights)) {
      maxScores[profile as ProfileKey] += (weight as number) * 5;
    }
  }
  return Math.max(...Object.values(maxScores));
}
