import assert from "node:assert/strict";
import approvalWorker, { applyProposal, parseProposal } from "../approval-worker/index.js";
import { getGlossaryRows, loadGlossaryEdits, setSharedGlossary, checkGlossary } from "../src/glossary.js";

const storage = { getItem: () => null, setItem: () => {} };
loadGlossaryEdits(storage);
const base = { schema: "checkform-shared-glossary-v1", version: 1, updatedAt: null,
  overrides: {}, rootOverrides: {}, customRows: [] };
const proposal = { schema: "checkform-glossary-proposal-v1", mode: "add", rowId: 2,
  language: "es-AR", sourceTerm: "2-way", previous: "dos desenlaces",
  value: "dos opciones", root: "opcion", baseVersion: 1 };
assert.deepEqual(parseProposal({ state: "open", body: `\`\`\`checkform-glossary-proposal-v1\n${JSON.stringify(proposal)}\n\`\`\`` }), proposal);
const added = applyProposal(structuredClone(base), proposal);
assert.equal(added.version, 2);
assert.equal(added.customRows[0].terms["es-AR"], "dos opciones");
assert.equal(added.customRows[0].roots["es-AR"], "opcion");
assert.equal(setSharedGlossary(added, storage), true);
assert.equal(getGlossaryRows().some((row) => row.terms["es-AR"] === "dos opciones" && row.roots["es-AR"] === "opcion"), true);
assert.equal(checkGlossary("2-way", "dos opciones", "en", "es-AR", getGlossaryRows()).length, 0);
const replaced = applyProposal(structuredClone(added), { ...proposal, mode: "replace", value: "Nueva combinada", root: null, baseVersion: 2 });
assert.equal(replaced.version, 3);
assert.equal(replaced.overrides[2]["es-AR"], "Nueva combinada");
assert.throws(() => applyProposal(structuredClone(replaced), proposal), /опубликован/u);
assert.equal(applyProposal(structuredClone(replaced), { ...proposal, mode: "add", value: "otra opción" }).version, 4);
const unavailable = await approvalWorker.fetch(new Request("https://worker.example/review?issue=12"), {}, {});
assert.equal(unavailable.status, 503);
const denied = await approvalWorker.fetch(new Request("https://worker.example/review?issue=12"),
  { ADMIN_EMAIL: "owner@example.test", APPROVAL_CODE: "test-code", GITHUB_TOKEN: "test-token", ATTEMPTS: {} },
  { access: { getIdentity: async () => ({ email: "other@example.test" }) } });
assert.equal(denied.status, 403);
const originalFetch = globalThis.fetch;
let committed;
let closed = false;
const issueBody = `\`\`\`checkform-glossary-proposal-v1\n${JSON.stringify(proposal)}\n\`\`\``;
globalThis.fetch = async (url, options) => {
  if (url.endsWith("/issues/12") && options.method === "PATCH") { closed = true; return Response.json({ state: "closed" }); }
  if (url.endsWith("/issues/12")) return Response.json({ state: "open", body: issueBody });
  if (url.includes("/contents/data/shared-glossary.json") && options.method === "PUT") {
    committed = JSON.parse(options.body); return Response.json({ content: { sha: "next" } });
  }
  if (url.includes("/contents/data/shared-glossary.json"))
    return Response.json({ content: Buffer.from(JSON.stringify(base)).toString("base64"), sha: "old" });
  return new Response("unexpected", { status: 404 });
};
try {
  const attempts = new Map();
  const env = { ADMIN_EMAIL: "owner@example.test", APPROVAL_CODE: "test-code", GITHUB_TOKEN: "test-token",
    ATTEMPTS: { get: async (key) => attempts.get(key), put: async (key, value) => attempts.set(key, value) } };
  const ctx = { access: { getIdentity: async () => ({ email: "owner@example.test" }) } };
  const wrong = new FormData(); wrong.set("code", "wrong");
  assert.equal((await approvalWorker.fetch(new Request("https://worker.example/review?issue=12", { method: "POST", body: wrong }), env, ctx)).status, 403);
  assert.equal(committed, undefined);
  const correct = new FormData(); correct.set("code", "test-code");
  assert.equal((await approvalWorker.fetch(new Request("https://worker.example/review?issue=12", { method: "POST", body: correct }), env, ctx)).status, 200);
  assert.equal(JSON.parse(Buffer.from(committed.content, "base64").toString("utf8")).version, 2);
  assert.equal(closed, true);
} finally { globalThis.fetch = originalFetch; }
console.log("Glossary collaboration tests passed");
