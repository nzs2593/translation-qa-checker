# CHECKform — first increment

Local, deterministic translation QA checker. It uses only rule-based checks and never rewrites the target text. The first UI increment follows the existing LOCform visual language: compact white panels, thin gray-green borders, Arial/system UI, and LOCform's green action color.

Original and Goal text can be pasted, loaded from `.txt`/`.html`, or dropped as `.docx` files. Drop the Original file into the Original card and the Goal file into the Goal Language card; after both are received, the Original file appears on the left and the Goal file appears in the large review window on the right. DOCX extraction is performed locally in the browser, without an external service.

## Architecture

```text
UI (Original + language / Target Review / Issues)
          ↓
RuleEngine
          ↓
Rule checks by pool
          ↓
Issue[]
```

- `src/domain.js` contains the issue contract and the supported rule pools. Findings keep `location_in_target` and, when a source counterpart exists, `location_in_source`.
- `src/profiles.js` contains language-profile defaults for the first supported languages.
- `src/language-detection.js` provides deterministic script/marker-based language detection with confidence; manual Source/Goal profile selection can override it.
- `src/dates-time.js` parses dates, times, and GMT/UTC offsets, then compares normalized instants.
- `src/engine.js` runs deterministic checks. Glossary is intentionally only a future extension point.
- `src/segments.js` pairs repeated labelled blocks such as `Header`, `Text` and `Button`, so numbers and dates are compared inside the corresponding block instead of across a whole multi-document file.
- `src/main.js` connects the engine to the browser UI.
- The right-side Target Review keeps the target editable while mirroring issue ranges as inline highlights; Issues remains the detailed audit list.
- `tests/dates-time.test.mjs` covers timezone-sensitive behavior.

## Run

Open `index.html` in a modern browser. No build step, backend, external service, or API key is required. `.txt`, `.html`, and `.docx` are read locally.

For the tests, run:

```text
node tests/dates-time.test.mjs
```

## Current behavior

- The service reports issues only; it does not auto-correct text.
- Each finding can be counted or excluded before export; Edit opens its explanation for review.
- Export PDF opens a print-ready report with the target text highlighted and the selected findings listed for the translator. Choose "Save as PDF" in the browser print dialog.
- A timezone present in the source but absent in the target yields `TIMEZONE_MISSING` and stops datetime comparison for that expression.
- `20:59 GMT` and `17:59 GMT-3` represent the same instant and pass.
- `20:59 GMT` and `20:59 GMT-3` yield `TIMEZONE_MISMATCH`.
- A different normalized instant yields `DATETIME_MISMATCH`.
- Profiles are driven by the supplied language guidance first: decimal/thousand separators, currency placement, percentage spacing, quotation style and local month names are explicit profile data.
- Light deterministic checks include `MULTIPLE_SPACES`, `TRAILING_SPACE`, `SPACE_BEFORE_PUNCTUATION`, `NON_BREAKING_SPACE`, `NUMBER_FORMAT`, `CURRENCY_FORMAT`, `CURRENCY_MISMATCH`, `PERCENTAGE_FORMAT` and `QUOTATION_STYLE`.
- Number formatting is normalized before value comparison, so a valid localized rendering such as English `7,500` → Argentine Spanish `7.500` is not reported as a numeric mismatch.
- Highlight numbers and the numbered Review findings use the same included-finding order; overlapping checks are shown together on one marked fragment (for example `2, 3`).
- Clicking a finding focuses and scrolls to the corresponding positions in both Source and Goal when both locations are available.
- The other pools have conservative deterministic baseline checks; deeper linguistic rules and glossary matching are future increments.
