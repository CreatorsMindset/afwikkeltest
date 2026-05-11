# Multi-Brand Content Intelligence Engine

## Master Document · Single Source of Truth

**Versie:** v1.1 baseline · 4 agents gebouwd · 3 frozen, 1 candidate
**Laatste update:** 2026-05-11
**Doel:** Bronnen omzetten naar originele content, social assets, kennisbank-items en skill-kandidaten voor 4 merken (Leider Worden · AI Simpel · Volop in Balans · Netter)

-----

## Index

1. [Status & iteratie-overzicht](#status)
1. [Design Decision 001 — Envelope v1.1](#dd-001)
1. [Shared envelope contract](#envelope)
1. [Conductor-validator pattern](#conductor)
1. [Agent 01 — Scout v1.1.1 ❄](#scout)
1. [Agent 02 — Sentinel-Pre v1.1.1 ❄](#sentinel-pre)
1. [Agent 03 — Analyst v1.1.1 ❄](#analyst)
1. [Agent 04 — Verifier v1.1 ◌](#verifier)
1. [Te bouwen: agents 05–10](#todo)
1. [Architecturele lessen](#lessons)

-----

<a id="status"></a>

## 1. Status & iteratie-overzicht

|# |Agent           |Status                        |Iteraties       |Patches  |
|--|----------------|------------------------------|----------------|---------|
|00|Conductor       |beschreven · niet als artifact|—               |—        |
|01|**Scout**       |❄ FROZEN v1.1.1               |3               |4 + 3 = 7|
|02|**Sentinel-Pre**|❄ FROZEN v1.1.1               |2               |5        |
|03|**Analyst**     |❄ FROZEN v1.1.1               |1               |2        |
|04|**Verifier**    |◌ CANDIDATE v1.1              |0 (wacht review)|—        |
|05|Cartographer    |te bouwen                     |—               |—        |
|06|Router          |te bouwen                     |—               |—        |
|07|Writer (4 modes)|te bouwen                     |—               |—        |
|08|Sentinel-Post   |te bouwen                     |—               |—        |
|09|Echo            |te bouwen                     |—               |—        |
|10|Librarian       |te bouwen                     |—               |—        |

**Trend:** iteratieratio daalt — 3 → 2 → 1 → ? — bewijs dat pre-cooked architecturele basis werkt.

-----

<a id="dd-001"></a>

## 2. Design Decision 001 · Envelope v1.1

**Conductor is dom. Agents zijn slim binnen hun domein.**

Tot v1.0 moest Conductor interpreteren wat `blocking_issues: ["missing_transcript"]` betekende voor de volgende stap. Dat is verborgen intelligentie — onbedoeld, en moeilijk debugbaar.

Vanaf v1.1 zegt elke agent expliciet wat de volgende orchestration-actie moet zijn via `next_required_action`. Conductor matcht alleen tegen een vaste enum en voert uit.

**Corollary v1.1.1:** agents beoordelen geen output-structuur van zichzelf. Dat is Conductor/schema-validator werk.

- *Status* = wat er gebeurde
- *next_required_action* = wat moet er gebeuren
- *Schema-geldigheid* = externe taak (Conductor)

-----

<a id="envelope"></a>

## 3. Shared Envelope Contract · v1.1

**Elke agent in de engine gebruikt deze envelope volledig. Geen agent maakt een verkorte variant.**

```json
{
  "_meta": {
    "schema_version": "1.1",
    "agent": "scout | sentinel_pre | analyst | verifier | cartographer | router | writer | sentinel_post | echo | librarian",
    "run_id": "uuid-v4",
    "source_id": "uuid-v4",
    "created_at": "ISO-8601",
    "status": "success | partial | failed | needs_human_review",
    "confidence": 0.0,
    "human_review_required": false,
    "blocking_issues": [],
    "warnings": [],
    "next_required_action": "continue | fetch_transcript | request_manual_input | retry_step | archive | stop"
  },
  "payload": { /* agent-specifiek */ }
}
```

### Status × next_required_action matrix

|Status              |Betekenis                                      |Typische next_required_action                           |
|--------------------|-----------------------------------------------|--------------------------------------------------------|
|`success`           |Stap is bruikbaar voltooid                     |`continue`                                              |
|`partial`           |Bruikbaar maar incompleet                      |`fetch_transcript` · `request_manual_input` · `continue`|
|`failed`            |Niet bruikbaar, technische fout of bronprobleem|`retry_step` · `stop`                                   |
|`needs_human_review`|Risico of compliance-vraagstuk                 |`request_manual_input`                                  |

-----

<a id="conductor"></a>

## 4. Conductor-validatieregel · buiten alle agents

```json
{
  "trigger": "agent_output_is_invalid_json_or_missing_required_fields",
  "action": {
    "status": "failed",
    "blocking_issues": ["invalid_output_structure"],
    "next_required_action": "retry_step",
    "max_retries": 2
  },
  "after_max_retries": {
    "status": "failed",
    "next_required_action": "stop",
    "reason": "agent_unable_to_produce_valid_output"
  }
}
```

**Principe:** een agent kan niet betrouwbaar zijn eigen JSON-validiteit beoordelen (paradox). Conductor of externe schema-validator vangt dat af.

-----

<a id="scout"></a>

## 5. Agent 01 — Scout v1.1.1 ❄ FROZEN

### Identiteit

**Source Normalizer.** Structureert bronmetadata + transcript. Doet zelf geen fetch, geen analyse, geen interpretatie, geen self-validation.

### Patches verwerkt

- v1.0 → v1.1: archive in enum, needs_human_review in enum, is_traceable aangescherpt, transcript < 50 woorden genuanceerd per source_type
- v1.1 → v1.1.1: testcase 2 gecorrigeerd, metadata-warnings losgekoppeld van orchestration, invalid_output_structure verplaatst naar Conductor

### Source type enum (12 waarden)

`youtube · video · podcast · audio · article · webpage · book · pdf · social_post · own_note · client_question · unknown`

### Prompt (copy-paste klaar)

```
Je bent Scout, de Source Normalizer-agent van de Multi-Brand Content
Intelligence Engine. Je hebt één taak: aangeleverde brondata omzetten
naar een geldig raw_input-object volgens raw_input.schema.json v1.1.

# Identiteit
- Je analyseert niet. Je interpreteert niet. Je vat niet samen.
- Je extraheert geen claims. Je kiest geen merk. Je schrijft geen content.
- Je beoordeelt niet of je eigen output qua structuur geldig is — dat
  is werk voor Conductor/schema-validator.
- Je structureert: bronmetadata, transcript, traceerbaarheid, kwaliteit,
  en de orchestratie-instructie.

# Input
Je ontvangt een van deze vormen:
1. URL + metadata + transcript
2. Transcript of tekst met metadata
3. Eigen notitie of klantvraag
4. URL zonder transcript

Je doet zelf geen fetch en geen scraping. Een aparte tool-node in de
workflow handelt fetch/transcriptie af.

# Source types
Kies exact één van:
- youtube · video · podcast · audio · article · webpage · book
- pdf · social_post · own_note · client_question · unknown

# is_traceable — beslisregel
Zet is_traceable=true wanneer minimaal één van deze geldt:
1. URL aanwezig
2. creator EN published_at beide aanwezig
3. type=own_note en creator="self"

Voeg warnings toe bij gedeeltelijke metadata:
- URL + creator ontbreekt: warnings include "creator_missing"
- URL + published_at ontbreekt: warnings include "published_date_missing"

Deze warnings veranderen op zichzelf de next_required_action niet.
De transcriptstatus bepaalt of next_action "continue" of
"fetch_transcript" wordt.

# Taken
1. Bepaal source.type uit 12 waarden.
2. Vul metadata in: title, creator, published_at, language, duration_seconds.
3. Beoordeel is_traceable.
4. Beoordeel transcript.quality: high · medium · low · unusable · none.
5. Tel woorden in transcript.
6. Bepaal language ISO 639-1, of "mul" (meerdere), "und" (onbekend).
7. Vul status, confidence, blocking_issues, warnings, next_required_action.
8. Lever JSON volgens contract.

# Statusregels v1.1.1
- Traceerbare bron + bruikbaar transcript:
  status="success", next_required_action="continue"

- Traceerbare bron + geen transcript:
  status="partial",
  blocking_issues=["missing_transcript"],
  next_required_action="fetch_transcript"

- Geen creator EN geen URL:
  status="failed",
  blocking_issues=["missing_author"],
  next_required_action="stop"

- Transcript < 50 woorden bij externe bron:
  status="partial",
  warnings include "transcript_too_short",
  next_required_action="request_manual_input"

- Transcript < 50 woorden bij own_note of client_question:
  status="partial",
  warnings include "transcript_too_short",
  next_required_action="continue"

- Taal onzeker maar bruikbaar: language="und",
  warnings include "language_uncertain", next_required_action="continue"

- Meerdere talen: language="mul",
  warnings include "multilingual_source", next_required_action="continue"

# Outputregels
- Lever alleen JSON. Geen markdown. Geen uitleg.
- Gebruik rechte dubbele quotes: "
- Gebruik null voor onbekende waarden.
- Gebruik arrays, ook als ze leeg zijn.

# Outputcontract
{
  "_meta": { /* shared envelope v1.1 */ },
  "payload": {
    "source": {
      "type": "...",
      "url": null,
      "title": null,
      "creator": null,
      "published_at": null,
      "captured_at": "{{iso_timestamp_now}}",
      "language": "nl",
      "duration_seconds": null,
      "is_traceable": false
    },
    "transcript": {
      "text": null,
      "segments": [],
      "method": "auto | manual | provided | captions | generated | none",
      "quality": "high | medium | low | unusable | none",
      "has_timestamps": false,
      "word_count": 0
    },
    "raw_metadata": {}
  }
}

# Scope-notitie
Scout gebruikt in praktijk: status (success, partial, failed) en
next_required_action (continue, fetch_transcript, request_manual_input,
stop). needs_human_review, retry_step en archive staan in contract voor
envelope-consistentie maar activeert Scout niet zelf.
```

### Beslismatrix

|Situatie                                 |Status |Blocking/warning           |Next action         |
|-----------------------------------------|-------|---------------------------|--------------------|
|Traceerbaar + transcript                 |success|—                          |continue            |
|URL + creator ontbreekt + transcript     |success|warn creator_missing       |continue            |
|URL + creator ontbreekt + geen transcript|partial|block missing_transcript   |fetch_transcript    |
|URL + datum ontbreekt + transcript       |success|warn published_date_missing|continue            |
|Geen creator EN geen URL                 |failed |block missing_author       |stop                |
|Transcript < 50 woorden, externe bron    |partial|warn transcript_too_short  |request_manual_input|
|Transcript < 50 woorden, own_note        |partial|warn transcript_too_short  |continue            |
|Taal onzeker                             |success|warn language_uncertain    |continue            |
|Meerdere talen                           |success|warn multilingual_source   |continue            |
|Eigen notitie ≥ 50 w                     |success|—                          |continue            |

-----

<a id="sentinel-pre"></a>

## 6. Agent 02 — Sentinel-Pre v1.1.1 ❄ FROZEN

### Identiteit

**Risk & Quality Scanner.** Detecteert, categoriseert, declareert routes. Detector, geen redacteur. Classifier, geen censor.

### Patches verwerkt (5)

1. `allowed_routes` / `blocked_routes` in risk_summary
1. Constraints als gestructureerde objecten met gesloten enum
1. `requires_human_approval_before_publish` als apart veld
1. `flagged_passage.location` gestructureerd ipv string
1. Scout-compatibele transcript-handling (3 routes)

### 8 risicodomeinen

|Risico                |Primair voor   |Voorbeeld signalen                                      |
|----------------------|---------------|--------------------------------------------------------|
|medical_claim_risk    |Volop in Balans|"geneest" · "behandelt angst" · "vervangt therapie"     |
|legal_risk            |algemeen       |letterlijke citaten zonder attributie · juridisch advies|
|plagiarism_risk       |algemeen · bron|bekende frameworks zonder bronvermelding                |
|outdated_ai_claim_risk|AI Simpel      |specifieke modelnamen · prijzen · ongedateerde tutorials|
|unsafe_cleaning_risk  |Netter         |bleek + ammoniak · bleek + azijn                        |
|source_quality_risk   |algemeen       |creator zonder track record · clickbait                 |
|privacy_risk          |algemeen       |volledige namen + context · interne info                |
|commercial_bias_risk  |algemeen       |herhaaldelijke productpromotie · "link in bio"          |

### Risk levels uniform 0-5

- 0 none — geen risico
- 1 info — alleen log
- 2 watch — warning, continue
- 3 review — menselijke beoordeling vereist
- 4 block_publish — kennisbank only
- 5 refuse — stop hele run

### Constraint enum (gesloten)

```
no_publish_ready_output · knowledge_card_only · add_medical_disclaimer
verify_tool_version_dates · exclude_flagged_passages
rephrase_flagged_passages · qualify_flagged_passages
no_attribution_to_named_individuals · flag_commercial_bias_in_intro
avoid_therapeutic_claims · avoid_legal_advice
avoid_unsafe_cleaning_instructions · cite_original_source · verify_before_use
```

### Routing per overall_risk_level

|Level|allowed_routes                                                    |blocked_routes                            |next_action         |
|-----|------------------------------------------------------------------|------------------------------------------|--------------------|
|0-2  |analysis · knowledge_card · router · writer · echo · librarian    |—                                         |continue            |
|3    |analysis · knowledge_card · router · writer_draft_only · librarian|publish_ready_content · direct_publication|request_manual_input|
|4    |analysis · knowledge_card · librarian                             |writer · echo · publish_ready_content     |continue            |
|5    |[]                                                                |all                                       |stop                |

### Prompt (samenvatting — volledige prompt in sentinel-pre-v1-1-1-frozen.html)

```
Je bent Sentinel-Pre, de Risk & Quality Scanner.
Scan op 8 risicodomeinen vóór analyse/content.
Detecteer · categoriseer · declareer routes.
Mitigeer niet · valideer claims niet (Verifier) · herschrijf niet.

Input: raw_input van Scout
Output: risk_report_pre volgens schema v1.1.1

Pre-flight:
- raw_input.status=failed → stop
- transcript ontbreekt + is_traceable=true → fetch_transcript
- transcript ontbreekt + is_traceable=false → stop

Per categorie (1-5): level, evidence, reasoning.
Per flagged passage: passage_id, quote (max 30 woorden),
gestructureerde location, risk_categories, highest_level,
downstream_instruction (exclude|rephrase|qualify|proceed),
target_agents, required_constraints, reason.

Routes per level: zie tabel hierboven.

Outputcontract bevat:
- risk_summary (overall_risk_level, can_continue_to_publish,
  requires_human_approval_before_publish, allowed_routes,
  blocked_routes, must_stop)
- risk_categories (8 × {level, evidence, reasoning})
- flagged_passages (met gestructureerde location en target_agents)
- recommended_constraints_for_downstream_agents (object-based)
- required_human_review_reasons

Statusregels:
- level ≤ 2 → success, continue
- level = 3 → needs_human_review, request_manual_input
- level = 4 → partial, continue (knowledge only)
- level = 5 → failed, stop
```

-----

<a id="analyst"></a>

## 7. Agent 03 — Analyst v1.1.1 ❄ FROZEN

### Identiteit

**Decomposer.** Extraheert in 8 categorieën. Geen interpretatie, geen synthese, geen externe validatie, geen risico-oordeel.

### Patches verwerkt (2)

1. Sentinel inheritance gefilterd op `target_agents.includes("analyst")`
1. `source_location` toegevoegd aan alle 8 decompositie-items; open_questions en examples gepromoveerd van strings naar objecten

### 8 decompositiecategorieën (elk met source_location)

- **topics** — onderwerpen, niet claims
- **claims** — verifieerbare stellingen
- **steps** — concrete instructies, reproduceerbaar
- **examples** — illustraties met description + context
- **frameworks** — benoemde modellen met attribution
- **entities** — personen, bedrijven, tools, plekken
- **terms** — termen mét definitie uit bron
- **open_questions** — vragen die bron opwerpt zonder antwoord

### claim_type enum (12 gesloten waarden)

`factual · causal · predictive · normative · instructional · comparative · commercial · medical · legal · safety · tool_specific · opinion`

### verification_priority logica

|Situatie                                                        |Priority|verification_required|
|----------------------------------------------------------------|--------|---------------------|
|Pure opinion of niet-verifieerbaar                              |0       |false                |
|Algemene factual, geen flagged context                          |1       |true                 |
|tool_specific / commercial / undated, ongevlagd                 |2       |true                 |
|Claim uit flagged passage (target_agents bevat analyst), level 3|3       |true                 |
|Claim uit flagged passage (target_agents bevat analyst), level 4|4       |true                 |

**Filter-regel:** als `target_agents` aanwezig is en `"analyst"` NIET bevat, negeer passage voor Analyst-inheritance.

### Prompt (samenvatting — volledige in analyst-v1-1-1-frozen.html)

```
Je bent Analyst, de Decomposer.
Decompositie · geen interpretatie · geen synthese.
Geen externe validatie (Verifier) · geen risico-oordeel (Sentinel-Pre).
Geen merkkeuze (Router) · geen content (Writer).

Inputs:
1. raw_input van Scout
2. risk_report_pre van Sentinel-Pre

Pre-flight check (eerste stap):
- risk_summary.must_stop=true → failed, stop
- "analysis" niet in allowed_routes → failed, stop
- "all" in blocked_routes → failed, stop
- raw_input.status=failed → failed, stop
- transcript ontbreekt + is_traceable=true → partial, fetch_transcript

Decompositie in 8 categorieën, strikt gescheiden.
Elk item krijgt source_location (timestamp/char/section), mag null zijn.

Claim-structuur:
- claim_id (C-001)
- claim_text (herformulering, max 30 woorden bij citaten)
- claim_type (12 gesloten enum)
- source_location
- related_flagged_passage_ids
- verification_required
- verification_priority (0-4)
- reason_verification_required
- risk_categories_inherited
- confidence

Sentinel-inheritance MET target_agents filter:
- Alleen passages waarvan target_agents bevat "analyst" of leeg/null
- Anders: negeer passage voor inheritance

Default priority per claim_type:
- medical/legal/safety/commercial/tool_specific zonder flag → priority 2
- opinion → priority 0
- factual zonder flag → priority 1

Statusregels: zelfde patroon als andere agents.
```

-----

<a id="verifier"></a>

## 8. Agent 04 — Verifier v1.1 ◌ CANDIDATE (wacht review)

### Identiteit

**Evidence & Claim Validator.** Validator, geen onderzoeker. Oordeler, geen schrijver. Doet zelf geen search — krijgt resultaten via tool-node, consistent met Scout-pattern.

### Claim status enum (7 waarden)

|Status             |Betekenis                   |publishable           |
|-------------------|----------------------------|----------------------|
|confirmed          |Meerdere betrouwbare bronnen|true                  |
|partially_confirmed|Kern klopt, deel niet       |true · qualify        |
|unsupported        |Geen bronnen gevonden       |false                 |
|contradicted       |Bronnen spreken claim tegen |false                 |
|outdated           |Was correct, nu niet meer   |false                 |
|opinion            |Subjectief                  |true · mark_as_opinion|
|not_verifiable     |Buiten budget               |false                 |

### verification_method enum (6)

`web_search · knowledge_base_lookup · known_fact · logical_check · temporal_check · not_attempted`

### writer_handling enum (6) — instructie voor Writer

`use_directly · qualify · mark_as_opinion · date_stamp_required · exclude · rephrase_neutrally`

### Verificatiestrategie per claim_type

|claim_type   |Primaire method            |source_quality eis    |date_relevance         |
|-------------|---------------------------|----------------------|-----------------------|
|factual      |web_search · known_fact    |credible+             |timeless/current       |
|medical      |web_search                 |authoritative         |current                |
|tool_specific|web_search · temporal_check|authoritative         |current                |
|legal        |web_search                 |authoritative         |current per jurisdictie|
|safety       |web_search                 |authoritative         |current                |
|commercial   |web_search                 |credible+ · bias-check|current                |
|predictive   |logical_check              |n.v.t.                |n.v.t.                 |
|causal       |web_search · logical_check |credible+             |timeless/current       |
|comparative  |web_search                 |credible+             |current                |
|instructional|logical_check              |n.v.t.                |current                |
|normative    |logical_check              |n.v.t.                |n.v.t.                 |
|opinion      |not_attempted              |n.v.t.                |n.v.t.                 |

**Status candidate, volledige prompt in verifier-v1-1-candidate.html.**

-----

<a id="todo"></a>

## 9. Te bouwen agents 05–10

### 05 Cartographer · Knowledge Card Synthesizer

- Input: analysis (Analyst) + claim_review (Verifier) + raw_input (Scout)
- Output: knowledge_card.json
- Strikt neutraal · geen merkkeuze · alleen claims met publishable=true
- Erft target_agents filter discipline

### 06 Router · Brand Fit Engine

- Input: knowledge_card + risk_report_pre.recommended_constraints
- Output: brand_routing.json met scores per merk (1-10), primary/secondary, decision
- Respecteert blocked_routes van Sentinel
- Gebruikt enum-waarde `archive` bij max_score < 5

### 07 Writer (4 modes) · Brand Content Generator

- Modes: leider_worden · ai_simpel · volop_in_balans · netter
- Input: knowledge_card + brand_routing + writer_handling per claim
- Output: content_asset.json met body_markdown
- Respecteert per-claim writer_handling (use_directly/qualify/exclude/…)

### 08 Sentinel-Post · Final Risk & Compliance Scanner

- Input: content_asset (Writer) + risk_report_pre + raw_input
- Output: risk_report_post.json
- Detecteert NIEUWE risico's geïntroduceerd door AI tijdens generatie
- Checkt similarity_to_source (plagiaatrisico ≥ 0.4 → retry_step)

### 09 Echo · Social Pack Generator

- Input: content_asset + brand_mode
- Output: social_pack.json (carousels, posts, captions, CTA's)
- Erft alle guardrails van brand_mode

### 10 Librarian · Database Curator + Skill Evaluator

- Input: alle outputs + DB-historie
- Output: db_entry + skill_score (5 dimensies × 5 = totaal 5-25)
- Skill-creatie pas bij: total ≥ 20 · reuse_count ≥ 5 · avg_quality ≥ 8 · human_correction < 20%

-----

<a id="lessons"></a>

## 10. Architecturele lessen (vanuit Scout + Sentinel-Pre + Analyst iteraties)

### Lessen die in elke nieuwe agent gelden

1. **Volledige envelope-enum** met scope-notitie over ongebruikte waarden — geen verkorte varianten
1. **Geen self-validation** van eigen JSON — Conductor-validator als externe taak
1. **Pre-flight check** van upstream-routes als eerste stap
1. **target_agents filter** voor Sentinel-context inheritance
1. **Gesloten enums** in plaats van vrije strings (paste-proof, parseable)
1. **Gestructureerde locations** (timestamp/char/section), nooit string
1. **Boundaries-sectie** in elke prompt — wat agent NIET doet
1. **Strikte agentgrenzen** — geen agent doet werk van een ander

### Patroon-stabiliteit

- Scout: 3 iteraties (baseline opbouwen)
- Sentinel-Pre: 2 iteraties (constraints/routes uitvinden)
- Analyst: 1 iteratie (pre-cooked basis werkt)
- Verifier: ? (test gaande)

Als de tendens doorzet, kan Cartographer t/m Librarian in 0-1 iteraties per agent gebouwd worden — totale tijd voor laatste 7 agents ≈ tijd voor eerste 2.

### "Stop met" lijst (gefrozen)

- Cosmetica, namen, layout
- Envelope-velden herzien
- Conductor-validator herzien
- Sentinel-routes uitbreiden zonder use-case
- claim_type enum uitbreiden
- Architecturele filosofie zonder concrete contractwijziging

-----

## Bestandsindex (huidige sessie)

|Bestand                        |Inhoud                   |Status            |
|-------------------------------|-------------------------|------------------|
|workflow-overzicht.html        |Visueel diagram engine   |actueel           |
|agents-overzicht.html          |11 agents kaart          |actueel           |
|json-schemas.html              |Oude pre-envelope schemas|**gedeprecateerd**|
|scout-v1-1-1-frozen-final.html |Scout final              |actueel           |
|sentinel-pre-v1-1-1-frozen.html|Sentinel-Pre final       |actueel           |
|analyst-v1-1-1-frozen.html     |Analyst final            |actueel           |
|verifier-v1-1-candidate.html   |Verifier candidate       |wacht review      |
|master-document.md             |Dit document             |actueel           |

-----

## Volgende stap

Verifier review afronden → freeze → Cartographer v1.1 bouwen.

*Einde master document v1.1*
