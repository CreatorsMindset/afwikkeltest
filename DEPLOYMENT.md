# Deployment Memo — Afwikkeltest op Combell

**Domein:** `afwikkeltest.leiderworden.be`  
**Runtime:** Node.js 22 (of 24)  
**Poort:** 3000  
**Datum:** 5 april 2026  

---

## 1. Overzicht

De Afwikkeltest is een Express + React (Vite) applicatie met:
- **Frontend:** React SPA (hash-routing), gebouwd naar `dist/public/`
- **Backend:** Express API (`dist/index.cjs`), draait op poort 3000
- **Database:** SQLite via better-sqlite3 (bestand: `afwikkeltest.db`)
- **E-mail:** Nodemailer via SMTP (mailprotect.be)

De server bedient zowel de API (`/api/*`) als de statische frontend vanuit dezelfde Node-instantie.

---

## 2. npm Scripts

| Script | Commando | Doel |
|--------|----------|------|
| `build` | `tsx script/build.ts` | Bouwt frontend (Vite) + bundelt server (esbuild) naar `dist/` |
| `serve` | `NODE_ENV=production PORT=3000 node dist/index.cjs` | **Start de productie-server op poort 3000** |
| `start` | `NODE_ENV=production node dist/index.cjs` | Alternatief start-commando (leest PORT uit env) |
| `dev`   | `NODE_ENV=development tsx server/index.ts` | Alleen lokaal ontwikkelen |

**Combell moet uitvoeren:**
1. `npm ci --production=false` (devDependencies nodig voor build)
2. `npm run build`
3. `npm run serve` (of `npm start` met PORT=3000 als env var)

---

## 3. Environment Variables

| Variabele | Verplicht | Standaard | Beschrijving |
|-----------|-----------|-----------|-------------|
| `PORT` | Nee | `3000` | Poort waarop de server luistert |
| `NODE_ENV` | Ja | — | Moet `production` zijn op Combell |
| `DB_PATH` | Nee | `afwikkeltest.db` | Pad naar SQLite-database (relatief of absoluut) |
| `BASE_URL` | Aanbevolen | Afgeleid van request | Basis-URL voor e-mail links, bv. `https://afwikkeltest.leiderworden.be` |
| `SMTP_HOST` | Nee | `smtp-auth.mailprotect.be` | SMTP-server |
| `SMTP_PORT` | Nee | `587` | SMTP-poort |
| `SMTP_USER` | Nee | `afwikkeltest@leiderworden.be` | SMTP-gebruikersnaam |
| `SMTP_PASS` | Nee | (ingesteld in code) | SMTP-wachtwoord |
| `SMTP_FROM` | Nee | `De Afwikkeltest <afwikkeltest@leiderworden.be>` | Afzender |

**Aanbevolen op Combell in te stellen:**
```
PORT=3000
NODE_ENV=production
BASE_URL=https://afwikkeltest.leiderworden.be
```

---

## 4. Combell Autogit Deployment

Het project bevat een `.autogit.yml` die automatisch:
- `npm ci --production=false` uitvoert na checkout
- `npm run build` uitvoert om `dist/` te genereren
- De SQLite-database als `shared_file` bewaart tussen deploys

### Stappen voor eerste keer:

1. **Activeer Autogit** in het Combell-controlepaneel voor `afwikkeltest.leiderworden.be`
2. **Voeg de Combell remote toe:**
   ```bash
   cd afwikkeltest
   git remote add combell <USER>@ssh.<DOMAIN>:auto.git
   ```
3. **Push naar Combell:**
   ```bash
   git push combell main
   ```
4. **Configureer Node.js applicatie** in Combell-paneel:
   - Node-versie: 22 (of 24)
   - Startup-commando: `npm run serve`
   - Poort: 3000
   - Environment variables instellen (zie §3)

### Bij elke update:
```bash
git push combell main
```
De `.autogit.yml` hooks herbouwen automatisch de applicatie.

---

## 5. Database-persistentie

De SQLite-database (`afwikkeltest.db`) is geconfigureerd als `shared_file` in `.autogit.yml`. Dit betekent dat het bestand als symlink beschikbaar is in elke release en data bewaard blijft over deploys heen.

Als Combell een ander mechanisme gebruikt voor persistente bestanden, stel dan `DB_PATH` in naar een absoluut pad buiten de checkout-map, bv.:
```
DB_PATH=/data/sites/web/<account>/data/afwikkeltest.db
```

---

## 6. Bestandsstructuur na build

```
afwikkeltest/
├── dist/
│   ├── index.cjs          ← Gebundelde server (Express + API)
│   └── public/
│       ├── index.html      ← SPA entry point
│       └── assets/
│           ├── index-*.css  ← Gestylede frontend
│           └── index-*.js   ← React-app bundle
├── node_modules/           ← Dependencies
├── afwikkeltest.db         ← SQLite-database (shared)
├── package.json
├── .autogit.yml
├── .nvmrc                  ← Node-versie hint (22)
└── ...bronbestanden
```

---

## 7. Lokaal testen in productie-modus

```bash
npm run build
npm run serve
# Open http://localhost:3000
```

---

## 8. Functionaliteit-overzicht

Alle bestaande functionaliteit is behouden:
- **Registratie:** POST `/api/participants` → opslaan in SQLite
- **Test afnemen:** Frontend hash-route `/#/test/:id`
- **Resultaten opslaan:** POST `/api/results` → opslaan + async e-mail
- **Resultaten bekijken:** GET `/api/results/:id` + frontend `/#/resultaat/:id`
- **Admin:** GET `/api/admin/participants` en `/api/admin/results`
- **E-mail:** Automatische resultaatsmail via SMTP (non-blocking)
