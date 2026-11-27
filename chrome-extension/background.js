const SHARED_URL = "https://nzs2593.github.io/translation-qa-checker/data/shared-glossary.json";
const CONFIG_URL = "https://nzs2593.github.io/translation-qa-checker/data/collaboration-config.json";
const MAX_AGE_MS = 5 * 60 * 1000;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!["checkform-shared-glossary", "checkform-shared-timezones"].includes(message?.type)) return false;
  (async () => {
    const timezones = message.type === "checkform-shared-timezones";
    const cacheKey = timezones ? "sharedTimezoneCache" : "sharedGlossaryCache";
    const fetchedKey = timezones ? "sharedTimezoneFetchedAt" : "sharedGlossaryFetchedAt";
    const saved = await chrome.storage.local.get([cacheKey, fetchedKey]);
    const recent = Date.now() - Number(saved[fetchedKey] ?? 0) < MAX_AGE_MS;
    if (recent && saved[cacheKey]) return saved[cacheKey];
    try {
      const configResponse = await fetch(CONFIG_URL, { cache: "no-store" });
      const config = configResponse.ok ? await configResponse.json() : {};
      const endpoint = /^https:\/\//u.test(config.collabApi ?? "") ?
        `${config.collabApi.replace(/\/$/u, "")}/v1/${timezones ? "timezones" : "glossary"}` :
        timezones ? null : SHARED_URL;
      if (!endpoint) throw new Error("No shared timezone endpoint");
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.schema !== (timezones ? "checkform-shared-timezones-v1" : "checkform-shared-glossary-v1") ||
          !Number.isInteger(data.version)) throw new Error("Invalid shared data");
      await chrome.storage.local.set({ [cacheKey]: data, [fetchedKey]: Date.now() });
      return data;
    } catch { return saved[cacheKey] ?? null; }
  })().then((data) => sendResponse({ data })).catch(() => sendResponse({ data: null }));
  return true;
});
