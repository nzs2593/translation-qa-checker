const SHARED_URL = "https://nzs2593.github.io/translation-qa-checker/data/shared-glossary.json";
const CONFIG_URL = "https://nzs2593.github.io/translation-qa-checker/data/collaboration-config.json";
const MAX_AGE_MS = 5 * 60 * 1000;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "checkform-shared-glossary") return false;
  (async () => {
    const saved = await chrome.storage.local.get(["sharedGlossaryCache", "sharedGlossaryFetchedAt"]);
    const recent = Date.now() - Number(saved.sharedGlossaryFetchedAt ?? 0) < MAX_AGE_MS;
    if (recent && saved.sharedGlossaryCache) return saved.sharedGlossaryCache;
    try {
      const configResponse = await fetch(CONFIG_URL, { cache: "no-store" });
      const config = configResponse.ok ? await configResponse.json() : {};
      const endpoint = /^https:\/\//u.test(config.collabApi ?? "") ? `${config.collabApi.replace(/\/$/u, "")}/v1/glossary` : SHARED_URL;
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.schema !== "checkform-shared-glossary-v1" || !Number.isInteger(data.version)) throw new Error("Invalid glossary");
      await chrome.storage.local.set({ sharedGlossaryCache: data, sharedGlossaryFetchedAt: Date.now() });
      return data;
    } catch { return saved.sharedGlossaryCache ?? null; }
  })().then((data) => sendResponse({ data })).catch(() => sendResponse({ data: null }));
  return true;
});
