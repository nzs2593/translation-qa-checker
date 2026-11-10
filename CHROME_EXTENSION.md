# CHECKform Chrome extension preview

## What the preview does

- Manifest V3 content script runs only on `https://marathonbetops.crowdin.com/editor/*`.
- Reads mounted side-by-side Crowdin rows by `data-id`, including the source string and the translation textarea. It observes later row mounts and edits.
- Runs the same local CHECKform engine for glossary, date, GMT, number, spacing, and currency checks. It does not save or alter Crowdin translations and makes no network requests with their text.
- Adds a finding-count badge beside each affected translation. Clicking it opens a collapsible panel with the finding and target excerpt. The current preview marks a segment, not the exact characters inside Crowdin's textarea.
- The compare-currency checkbox disables currency-identity and amount-value comparisons; target currency placement, spaces, and number format remain checked.
- Open the floating CHECKform button and choose **Check settings** (or the gear icon). Glossary, dates and GMT, numbers, currency comparison, money format, spacing, punctuation, placeholders, and other checks can be switched independently. The choices persist in Chrome.
- Source and target locale codes are read from the Crowdin editor URL. Unsupported locale pairs are ignored.

## Build and local test

From the repository root run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-extension.ps1`. Then, in Chrome, open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the `chrome-extension` folder. Reload the Crowdin editor tab and look for the CHECKform button near the bottom right. The folder, not the ZIP, is for this local test.

The bundled glossary and GMT defaults work immediately. To carry over edits made on the CHECKform site, click **Export Chrome settings** on the site, open the extension's **Details → Extension options** or **Glossary and GMT** in its panel, and import the downloaded `checkform-settings.json`. This file contains glossary and GMT settings only, not the source or translation texts. Export again after later site edits; synchronization is manual in this preview.

## Publishing route

1. Finish local testing, exact-text highlighting, and review of false positives on several Crowdin projects. Add the final icon, store screenshots, support information, privacy description, and reviewer test instructions.
2. Register a Chrome Web Store developer account at the [developer dashboard](https://chrome.google.com/webstore/devconsole), accept the developer terms, and pay the one-time fee. Registration is separate from ordinary Google and GitHub accounts.
3. Zip the contents of `chrome-extension` with `manifest.json` at the ZIP root. In the dashboard choose **Add new item** and upload that ZIP.
4. Fill in **Store Listing**, **Privacy**, **Distribution**, and **Test instructions**. For a team, choose **Private** with named trusted tester Google accounts or a Google Group. **Unlisted** merely hides search listing; anyone with the link can install it. Domain publishing requires a Google Workspace administrator to enable it.
5. Submit for review. Google reviews all visibility modes. Only after approval should the team receive the store link.

The current preview is packaged for local testing; it has not been submitted to the Chrome Web Store.
