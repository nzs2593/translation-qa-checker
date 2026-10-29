# CHECKform — v2.7

Once both texts are present, the separate Goal language upload card disappears. Its language selector and file picker move into Target Review, leaving the source and target editors at equal size. Currency checks can be turned on or off without disabling other findings. Review findings can be moved with a pointer drag handle or the side/bottom button.

In v2.6, findings follow their position in the target document. Source passages have neutral reference styling; the target carries the warning color and a hover explanation. Paragraph numbers and dotted boundaries use a separate visual style. Once both documents are loaded, the editors occupy equal columns. Findings can be docked on the right and resized by dragging the divider, or returned below the editors. **Start again** clears the current pair and its finding decisions while retaining saved glossary and GMT rules. A Spanish `del 50%` no longer causes a spurious numeric mismatch.

Local, deterministic translation QA checker. It uses only rule-based checks and never rewrites the target text. The UI follows the existing LOCform visual language with compact white panels, thin blue borders and blue actions.

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
- `src/dates-time.js` pairs every date and clock time in a passage, validates calendar dates (including leap years), and compares instants after GMT/UTC normalization. The `es-AR` profile expects converted target times at GMT−3; parenthetical repetitions of the original GMT values do not hide an incorrect primary conversion.
- The GMT tab stores a per-language timezone rule in the browser. Argentine Spanish defaults to `GMT-3`; Russian to Cyrillic `МСК` (GMT+3). Ukrainian accepts an equivalent instant from a Russian source; other unconfirmed markets inherit the source timezone until a project-specific rule is entered. Exact marker spelling and spacing are checked.
- The Language rules tab shows short dates, number separators, currency examples, percent spacing, quotation marks and guide-specific exceptions for all 11 profiles. The table is a quick reference to the profile values used by the checker.
- `CHECKform-presentation-brief.md` is a Russian product description and presentation outline.
- The planned Chrome extension is the primary future review surface for Crowdin: it will run this engine on visible source/target segment pairs as they appear on scroll. A timezone finding will highlight its exact marker, time or date in the segment and appear under the same finding number in a collapsible panel. The extension is not included in this site release.
- The additional style guides supplied on 29 October 2026 add a default GMT−3 conversion for Brazilian Portuguese, including calendar rollover; a paired `¡…!` check in Spanish; and a leading-space check. The currency-format overview distinguishes explicit amounts, split placeholders and single money placeholders, as well as section-specific formats. These contextual exceptions remain documented rather than enforced globally.
- `src/engine.js` runs deterministic checks, including glossary term matching within corresponding segments or paragraphs.
- `data/5820713_glossary-0-3.xlsx` is the preserved source glossary; `scripts/build-glossary-data.py` converts its 821 rows into `src/glossary-data.js` for local browser use.
- The Glossary tab shows the source and goal columns, supports searching and editing terms, and stores browser edits in `localStorage`. A change takes effect in the next check, without changing source or target text. Source entries that differ by capitalization remain distinct; when a capitalized glossary entry is used, a translation found with the wrong letter case produces a separate Minor finding. Ordinary lowercase entries allow sentence-initial capitalization.
- `src/segments.js` pairs repeated labelled blocks such as `Header`, `Text` and `Button`, so numbers and dates are compared inside the corresponding block instead of across a whole multi-document file.
- DOCX paragraphs are preserved as blank-line-separated blocks in both Source and Target Review. Each visible paragraph is numbered, and matching paragraph pairs are checked independently for numbers, dates, times, currencies, placeholders and other deterministic rules.
- `src/main.js` connects the engine to the browser UI.
- The right-side Target Review keeps the target editable while mirroring issue ranges as inline highlights; Issues remains the detailed audit list.
- `tests/dates-time.test.mjs` covers timezone-sensitive behavior.

## Run

Open `index.html` in a modern browser. It loads `checkform.bundle.js` as a classic script, so the tabs also work from a direct `file://` URL. No backend, external service, or API key is required. `.txt`, `.html`, and `.docx` are read locally. After changing source files, rebuild the bundle with `npx --yes esbuild@0.28.2 src/main.js --bundle --format=iife --outfile=checkform.bundle.js`.

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
- A wrong timezone offset or marker yields `TIMEZONE_OFFSET_MISMATCH` or `TIMEZONE_LABEL_MISMATCH`; `GMT -3` yields `TIMEZONE_FORMAT`. Numeric dates using the wrong target separator/order yield `DATE_FORMAT`.
- Profiles are driven by the supplied language guidance first: decimal/thousand separators, currency placement, percentage spacing, quotation style and local month names are explicit profile data.
- Light deterministic checks include `MULTIPLE_SPACES`, `TRAILING_SPACE`, `SPACE_BEFORE_PUNCTUATION`, `NON_BREAKING_SPACE`, `NUMBER_FORMAT`, `CURRENCY_FORMAT`, `CURRENCY_MISMATCH`, `PERCENTAGE_FORMAT` and `QUOTATION_STYLE`.
- Number formatting is normalized before value comparison, so a valid localized rendering such as English `7,500` → Argentine Spanish `7.500` is not reported as a numeric mismatch.
- Score notation such as `54:41` → `54-41` is treated as the same score, while an extra or missing numeric token inside a paragraph remains reportable.
- Highlight numbers and the numbered Review findings use the same included-finding order; overlapping checks are shown together on one marked fragment (for example `2, 3`).
- Clicking a finding focuses and scrolls to the corresponding positions in both Source and Goal when both locations are available.
- Glossary checks use English as the source for most goal languages and Russian for Ukrainian. A term present in the source must have its listed translation in the corresponding goal paragraph. Longer glossary phrases take precedence over contained single words; duplicate source rows supply alternative acceptable translations. Empty glossary translations are displayed for editing and do not produce a finding.
- The other pools have conservative deterministic baseline checks; deeper linguistic rules remain future increments.
