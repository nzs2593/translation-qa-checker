import assert from "node:assert/strict";

const cache = {};
const requested = [];
let listener;
globalThis.chrome = {
  runtime: { onMessage: { addListener(callback) { listener = callback; } } },
  storage: { local: {
    async get(keys) { return Object.fromEntries(keys.map((key) => [key, cache[key]])); },
    async set(values) { Object.assign(cache, values); }
  } }
};
globalThis.fetch = async (url) => {
  requested.push(String(url));
  if (String(url).endsWith("collaboration-config.json")) return { ok: true, json: async () => ({ collabApi: "https://checkform-glossary.nzs2593.workers.dev" }) };
  if (String(url).endsWith("/v1/timezones")) return { ok: true, json: async () => ({ schema: "checkform-shared-timezones-v1", version: 3, overrides: {} }) };
  if (String(url).endsWith("/v1/glossary")) return { ok: true, json: async () => ({ schema: "checkform-shared-glossary-v1", version: 4 }) };
  throw new Error(`Unexpected URL: ${url}`);
};

await import("../chrome-extension/background.js");
function ask(type) {
  return new Promise((resolve) => assert.equal(listener({ type }, null, resolve), true));
}
assert.equal((await ask("checkform-shared-timezones")).data.version, 3);
assert.equal((await ask("checkform-shared-glossary")).data.version, 4);
assert(requested.some((url) => url.endsWith("/v1/timezones")));
assert(requested.some((url) => url.endsWith("/v1/glossary")));
assert.equal(cache.sharedTimezoneCache.version, 3);
assert.equal(cache.sharedGlossaryCache.version, 4);
console.log("Shared sync tests passed");
