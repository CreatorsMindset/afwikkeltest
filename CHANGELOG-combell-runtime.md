# Wijzigingsverslag: Combell-runtime veiliger maken

**Datum:** 5 april 2026  
**Doel:** 503-error op Combell managed Node hosting oplossen door native module-afhankelijkheden te elimineren.

---

## Oorzaakanalyse

De app draaide lokaal en de Combell-build slaagde, maar de runtime bleef op **503** hangen. De meest waarschijnlijke oorzaak: **`better-sqlite3`** is een native C++ addon (N-API) die bij `npm install` gecompileerd wordt met `node-gyp`. Op managed Node-hosting zoals Combell kan de gecompileerde `.node` binary falen bij runtime door:

- Mismatch tussen de build-omgeving en de runtime-omgeving (glibc-versie, Node ABI)
- Sandboxing die native modules blokkeert zonder duidelijke foutmelding
- Ontbrekende shared libraries (`libstdc++`, `libm`, etc.) in de runtime-container
- De binary wordt wél gegenereerd tijdens `npm install`, maar `require()` faalt stil bij het laden

Omdat Combell geen gedetailleerde runtime-logs toont, resulteert dit in een kale 503.

---

## Wat is gewijzigd

### 1. `shared/schema.ts` — Drizzle → pure TypeScript + Zod

**Vóór:** Drizzle ORM tabel-definities (`sqliteTable`), `createInsertSchema` uit `drizzle-zod`  
**Na:** Gewone TypeScript interfaces (`Participant`, `Result`) + Zod-schemas voor validatie

- Alle geëxporteerde types/schemas behouden dezelfde namen en structuur
- Frontend hoeft niet te veranderen (importeert enkel types)
- Routes.ts hoeft niet te veranderen (gebruikt nog steeds `insertParticipantSchema.safeParse()`)

### 2. `server/storage.ts` — SQLite → JSON file storage

**Vóór:** `better-sqlite3` + Drizzle ORM query builder  
**Na:** In-memory data met write-through naar `data/afwikkeltest.json`

Kenmerken:
- **Atomic writes:** schrijft naar `.tmp`-bestand, dan `fs.renameSync` (geen corruptie bij crash)
- **Auto-incrementing IDs:** bewaard in het JSON-bestand (`nextParticipantId`, `nextResultId`)
- **Zelfde `IStorage` interface:** alle methoden identiek, zelfde return-types
- **`DB_PATH` env var:** nog steeds ondersteund voor Combell shared folder
- **Geen native modules:** alleen `fs` en `path` uit Node.js core

### 3. `script/build.ts` — Drizzle uit esbuild allowlist

`drizzle-orm` en `drizzle-zod` verwijderd uit de bundle allowlist (ze worden niet meer gebruikt).

### 4. `package.json` — Native dependencies verwijderd

Verwijderd uit `dependencies`:
- `better-sqlite3` (native C++ addon — **de hoofdverdachte**)
- `drizzle-orm` (niet meer nodig)
- `drizzle-zod` (vervangen door directe Zod-schemas)

Verwijderd uit `devDependencies`:
- `@types/better-sqlite3`
- `drizzle-kit`

Verwijderd:
- `overrides` voor `drizzle-kit`

`build` script hersteld naar `tsx script/build.ts` (was placeholder).

### 5. `.gitignore` — `data/` toegevoegd

De JSON data directory wordt niet gecommit.

---

## Wat NIET is gewijzigd

- **Frontend** (alle pagina's: landing, register, test, results, admin) — ongewijzigd
- **API-contracten** — alle endpoints (`/api/participants`, `/api/results`, `/api/admin/*`) retourneren dezelfde JSON-structuur
- **E-mailflow** (`server/email.ts`) — ongewijzigd, werkt nog steeds met `storage.getParticipant()` etc.
- **Routes** (`server/routes.ts`) — ongewijzigd, importeert dezelfde schema-namen
- **Server entry** (`server/index.ts`) — ongewijzigd
- **Vite config, Tailwind config, tsconfig** — ongewijzigd

---

## Waarom dit de Combell-runtime veiliger maakt

| Factor | Vóór | Na |
|---|---|---|
| Native modules | `better-sqlite3` (C++ addon, node-gyp) | Geen |
| Runtime dependencies | SQLite binary + Drizzle ORM | Alleen `fs` (Node core) |
| Faalrisico bij deploy | Hoog (binary mismatch) | Minimaal (pure JS) |
| Data persistentie | SQLite `.db` bestand | JSON bestand (atomisch) |
| Cold start | SQLite moet binary laden | Direct (geen native load) |

---

## Productie-test resultaat

```
$ NODE_ENV=production PORT=3000 node dist/index.cjs

[Storage] JSON store loaded — 0 deelnemers, 0 resultaten
[Mail] SMTP transporter aangemaakt (smtp-auth.mailprotect.be:587)
2:08:43 PM [express] serving on port 3000
```

Alle endpoints getest en werkend:
- `GET /health` → `{ ok: true }`
- `POST /api/participants` → maakt deelnemer, retourneert `{ id }`
- `GET /api/participants/:id` → retourneert deelnemer
- `POST /api/results` → slaat resultaat op, triggert e-mail async
- `GET /api/results/:id` → retourneert resultaat + deelnemer-info
- `GET /api/admin/participants` → alle deelnemers
- `GET /api/admin/results` → alle resultaten
- Validatie (Zod) → correcte 400 bij ongeldige invoer

---

## Volgende stap

Push naar GitHub en deploy opnieuw naar Combell. De app zou nu direct moeten starten zonder 503.
