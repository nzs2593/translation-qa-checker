import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "file:///C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const mime = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html" };
const server = createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(request.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    const path = normalize(join(root, requested));
    if (relative(root, path).startsWith("..")) throw new Error("Outside project");
    const contents = await readFile(path);
    response.writeHead(200, { "Content-Type": mime[path.slice(path.lastIndexOf("."))] ?? "application/octet-stream" });
    response.end(contents);
  } catch {
    response.writeHead(404); response.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.selectOption("#source-language", "en");
  await page.selectOption("#target-language", "es");
  await page.fill("#source-text", "Account balance");
  await page.fill("#target-text", "Saldo");
  await page.locator(".issue-type", { hasText: "GLOSSARY_TRANSLATION_MISSING" }).waitFor();
  assert.equal(await page.locator(".issue-row").count() >= 1, true);

  await page.click("#glossary-tab");
  assert.equal(await page.locator("#glossary-tab").getAttribute("aria-current"), "page");
  assert.equal(await page.locator("#check-tab").getAttribute("aria-current"), null);
  assert.equal(await page.locator("#glossary-tab").getAttribute("class"), "workspace-tab active");
  assert.equal(await page.locator("#check-tab").getAttribute("class"), "workspace-tab");
  await page.fill("#glossary-search", "account balance");
  const tabStyles = await page.locator(".workspace-tab").evaluateAll((tabs) => tabs.map((tab) => ({ cls: tab.className, border: getComputedStyle(tab).borderBottomColor, background: getComputedStyle(tab).backgroundColor })));
  assert.notEqual(tabStyles[0].border, tabStyles[1].border);
  if (process.env.CHECKFORM_SCREENSHOT) await page.screenshot({ path: process.env.CHECKFORM_SCREENSHOT, fullPage: true });
  const row = page.locator("#glossary-table-body tr").first();
  assert.equal(await row.locator("input").first().inputValue(), "account balance", `language=${await page.locator("#glossary-language").inputValue()} row=${await row.innerText()}`);
  await row.locator("input").nth(1).fill("Saldo");
  await row.locator("input").nth(1).blur();
  await page.click("#check-tab");
  assert.equal(await page.locator(".issue-type", { hasText: "GLOSSARY_TRANSLATION_MISSING" }).count(), 0);

  await page.reload();
  await page.click("#glossary-tab");
  await page.selectOption("#glossary-language", "es");
  await page.fill("#glossary-search", "account balance");
  assert.equal(await page.locator("#glossary-table-body tr input").nth(1).inputValue(), "Saldo");
  await page.click("#check-tab");
  await page.fill("#source-text", "Marathonbet");
  await page.fill("#target-text", "marathonbet");
  await page.locator(".issue-type", { hasText: "GLOSSARY_CASE_MISMATCH" }).waitFor();
  assert.equal(await page.locator(".issue-type", { hasText: "GLOSSARY_TRANSLATION_MISSING" }).count(), 0);
  assert.deepEqual(errors, []);
  console.log("Glossary browser test passed");
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
