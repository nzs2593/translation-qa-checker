# CHECKform Chrome extension

## What the preview does

- Manifest V3 content script runs only on `https://marathonbetops.crowdin.com/editor/*`.
- Reads mounted side-by-side Crowdin rows by `data-id`, including the source string and the translation textarea. It observes later row mounts and edits.
- Runs the same local CHECKform engine for glossary, date, GMT, number, spacing, and currency checks. It does not save or alter Crowdin translations and makes no network requests with their text.
- Adds a numbered case badge beside each affected translation. Clicking it selects the first finding's available target range in Crowdin's textarea. Each finding also has **Select in translation**; markup tags are mapped back to raw textarea offsets. A missing glossary term has no exact target span, so its approximate anchor is selected.
- **Dismiss** removes an individual finding from the current document's list and badge count. Dismissals survive scrolling and reloads, and a changed target text causes the finding to reappear. **Restore dismissed** brings them back.
- The panel counts visible characters, including spaces, in any number of rows selected with Crowdin's own checkboxes. It keeps checked rows in the count as Crowdin unmounts them during scrolling, and removes a row when its visible checkbox is unchecked. It shows source and translation counts per row and combined totals. A selectable limit applies either to the combined translation or to each selected translation; exceeding it produces a clear warning. Crowdin markup tags are excluded. A source context note such as `Title (15+15 characters)` offers a combined limit of 30 for two adjacent rows; `Full description (80 characters)` offers 80 for one row.
- The compare-currency checkbox disables currency-identity and amount-value comparisons; target currency placement, spaces, and number format remain checked.
- Drag the floating CHECKform button to a convenient place. Its position is saved in this Chrome profile and clamped to the visible window after a resize; a normal click still opens the panel. By default it starts at the lower left so it does not cover Crowdin's lower-right controls.
- Open the floating CHECKform button and choose **Check settings** (or the gear icon). Glossary, dates and GMT, numbers, currency comparison, money format, spacing, punctuation, placeholders, and other checks can be switched independently. The choices persist in Chrome.
- Source and target locale codes are read from the Crowdin editor URL. Unsupported locale pairs are ignored.

## Build and local test

From the repository root run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-extension.ps1`. Then, in Chrome, open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the `chrome-extension` folder. Reload the Crowdin editor tab and look for the CHECKform button near the bottom left. The folder, not the ZIP, is for this local test.

The bundled glossary and GMT defaults work immediately. Version 0.2.15 fetches the published shared glossary JSON from GitHub Pages on load and at five-minute intervals. It caches the last successful copy in Chrome storage. It sends no source or target text to that endpoint. The settings panel links to the glossary, and each glossary finding links directly to its language and term row. The manual **Export Chrome settings** flow still exists for personal glossary overrides and GMT rules; published shared entries take precedence over older browser overrides. Uzbek Latin and Cyrillic glossary phrases accept conservative suffixes on each content word; Uzbek apostrophe variants are recognized.

## Publishing route

1. Finish local testing, selection behavior, and review of false positives on several Crowdin projects. Add the final icon, store screenshots, support information, privacy description, and reviewer test instructions.
2. Register a Chrome Web Store developer account at the [developer dashboard](https://chrome.google.com/webstore/devconsole), accept the developer terms, and pay the one-time fee. Registration is separate from ordinary Google and GitHub accounts.
3. Zip the contents of `chrome-extension` with `manifest.json` at the ZIP root. In the dashboard choose **Add new item** and upload that ZIP.
4. Fill in **Store Listing**, **Privacy**, **Distribution**, and **Test instructions**. For a team, choose **Private** with named trusted tester Google accounts or a Google Group. **Unlisted** merely hides search listing; anyone with the link can install it. Domain publishing requires a Google Workspace administrator to enable it.
5. Submit for review. Google reviews all visibility modes. Only after approval should the team receive the store link.

Store submission and updates are managed separately from this local package.
