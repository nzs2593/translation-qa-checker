import { GLOSSARY_DEFAULTS } from "../src/glossary-data.js";

const LANGUAGES = new Set(["az", "da", "mn", "pt-BR", "ru", "es", "es-AR", "uk", "uz", "uzb"]);
const ALLOWED_ORIGIN = "https://nzs2593.github.io";
const ROOT_PATTERN = /^[\p{L}]+(?:[ \u00a0-][\p{L}]+){0,3}$/u;
const BASE_ROWS = new Map(GLOSSARY_DEFAULTS.map((row) => [row.id, row]));

function response(body, status = 200, origin = null) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (origin === ALLOWED_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function cleanCode(value) {
  return String(value ?? "").replace(/[\s-]/gu, "").toUpperCase();
}

export async function codeHash(code, pepper) {
  const bytes = new TextEncoder().encode(`${String(pepper).trim()}:${cleanCode(code)}`);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function currentTerm(data, rowId, language) {
  const custom = data.customRows.find((row) => row.id === rowId);
  return data.overrides[rowId]?.[language] ?? custom?.terms?.[language] ?? BASE_ROWS.get(rowId)?.terms?.[language] ?? "";
}

export function applyChange(data, change, actor) {
  if (data?.schema !== "checkform-shared-glossary-v1" || !Number.isInteger(data.version) ||
      !Array.isArray(data.customRows) || !data.overrides || !data.rootOverrides) throw new Error("Некорректное состояние словаря.");
  if (!["add", "replace", "new"].includes(change?.mode) || !Number.isInteger(change.rowId) || !LANGUAGES.has(change.language) ||
      !Number.isInteger(change.baseVersion) || change.baseVersion !== data.version ||
      typeof change.value !== "string" || !change.value.trim() || change.value.length > 200 ||
      !(change.root == null || change.root === "" || typeof change.root === "string" && change.root.length <= 100 && ROOT_PATTERN.test(change.root))) {
    throw new Error("Некорректная правка или словарь уже обновлён. Загрузите свежую версию.");
  }
  const sourceLanguage = change.language === "uk" ? "ru" : "en-GB";
  if (change.mode === "new") {
    const sourceTerm = String(change.sourceTerm ?? "").trim();
    if (change.rowId !== 0 || !sourceTerm || sourceTerm.length > 200) throw new Error("Введите исходный термин.");
    const value = change.value.trim();
    const root = change.root?.trim() || null;
    if ([...BASE_ROWS.values(), ...data.customRows].some((item) =>
      item.terms?.[sourceLanguage]?.toLocaleLowerCase() === sourceTerm.toLocaleLowerCase() &&
      item.terms?.[change.language]?.toLocaleLowerCase() === value.toLocaleLowerCase()))
      throw new Error("Такая пара терминов уже есть в словаре.");
    const id = Math.max(822, ...data.customRows.map((item) => Number(item.id) || 0)) + 1;
    data.customRows.push({ id, terms: { [sourceLanguage]: sourceTerm, [change.language]: value }, ...(root ? { roots: { [change.language]: root } } : {}) });
    data.version += 1;
    data.updatedAt = new Date().toISOString();
    return { data, audit: { actor, mode: "new", rowId: id, language: change.language, sourceTerm, previous: "", value, root } };
  }
  const row = BASE_ROWS.get(change.rowId) ?? data.customRows.find((item) => item.id === change.rowId);
  if (!row) throw new Error("Термин не найден.");
  const sourceTerm = currentTerm(data, row.id, sourceLanguage);
  if (!sourceTerm || sourceTerm !== change.sourceTerm) throw new Error("Исходный термин изменился. Загрузите свежую версию.");
  const previous = currentTerm(data, row.id, change.language);
  const value = change.value.trim();
  const root = change.root?.trim() || null;
  if (change.mode === "replace") {
    if (change.previous !== previous) throw new Error("Перевод уже изменился. Загрузите свежую версию.");
    if (data.customRows.some((item) => item.id === row.id)) {
      const custom = data.customRows.find((item) => item.id === row.id);
      custom.terms[change.language] = value;
      if (root) { custom.roots ??= {}; custom.roots[change.language] = root; }
      else if (custom.roots) delete custom.roots[change.language];
    } else {
      data.overrides[row.id] ??= {};
      data.overrides[row.id][change.language] = value;
      data.rootOverrides[row.id] ??= {};
      if (root) data.rootOverrides[row.id][change.language] = root;
      else delete data.rootOverrides[row.id][change.language];
    }
  } else {
    if ([row, ...data.customRows].some((item) => item.terms?.[sourceLanguage] === sourceTerm && item.terms?.[change.language]?.toLocaleLowerCase() === value.toLocaleLowerCase()))
      throw new Error("Этот вариант уже есть в словаре.");
    const id = Math.max(822, ...data.customRows.map((item) => Number(item.id) || 0)) + 1;
    data.customRows.push({ id, terms: { [sourceLanguage]: sourceTerm, [change.language]: value }, ...(root ? { roots: { [change.language]: root } } : {}) });
  }
  data.version += 1;
  data.updatedAt = new Date().toISOString();
  return { data, audit: { actor, mode: change.mode, rowId: change.rowId, language: change.language, sourceTerm, previous, value, root } };
}

async function blocked(db, clientKey) {
  const now = Math.floor(Date.now() / 1000);
  const row = await db.prepare("SELECT window_start, failures FROM login_attempts WHERE client_key = ?").bind(clientKey).first();
  return row && now - row.window_start < 900 && row.failures >= 8;
}

async function recordFailure(db, clientKey) {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare("INSERT INTO login_attempts(client_key, window_start, failures) VALUES (?, ?, 1) ON CONFLICT(client_key) DO UPDATE SET window_start = CASE WHEN ? - window_start >= 900 THEN ? ELSE window_start END, failures = CASE WHEN ? - window_start >= 900 THEN 1 ELSE failures + 1 END")
    .bind(clientKey, now, now, now, now).run();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);
    if (!env.DB || !env.CODE_PEPPER) return response({ error: "Сервер не настроен." }, 503, origin);
    if (request.method === "OPTIONS" && origin === ALLOWED_ORIGIN) {
      return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Max-Age": "600", Vary: "Origin" } });
    }
    if (origin && origin !== ALLOWED_ORIGIN && !origin.startsWith("chrome-extension://"))
      return response({ error: "Недопустимый источник запроса." }, 403);
    if (request.method === "GET" && url.pathname === "/v1/glossary") {
      const row = await env.DB.prepare("SELECT glossary_json FROM revisions ORDER BY version DESC LIMIT 1").first();
      return row ? response(JSON.parse(row.glossary_json), 200, origin) : response({ error: "Словарь не загружен." }, 503, origin);
    }
    if (request.method !== "POST" || url.pathname !== "/v1/changes") return response({ error: "Маршрут не найден." }, 404, origin);
    const clientKey = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (await blocked(env.DB, clientKey)) return response({ error: "Слишком много попыток. Повторите через 15 минут." }, 429, origin);
    const match = /^Bearer\s+(.+)$/iu.exec(request.headers.get("Authorization") ?? "");
    const code = cleanCode(match?.[1]);
    if (code.length < 20 || code.length > 80) {
      await recordFailure(env.DB, clientKey);
      return response({ error: "Неверный код участника." }, 401, origin);
    }
    const member = await env.DB.prepare("SELECT id FROM members WHERE code_hash = ? AND active = 1")
      .bind(await codeHash(code, env.CODE_PEPPER)).first();
    if (!member) {
      await recordFailure(env.DB, clientKey);
      return response({ error: "Неверный код участника." }, 401, origin);
    }
    let change;
    try { change = await request.json(); } catch { return response({ error: "Ожидается JSON." }, 400, origin); }
    const latest = await env.DB.prepare("SELECT glossary_json FROM revisions ORDER BY version DESC LIMIT 1").first();
    if (!latest) return response({ error: "Словарь не загружен." }, 503, origin);
    let next;
    try { next = applyChange(JSON.parse(latest.glossary_json), change, member.id); }
    catch (error) { return response({ error: error.message }, 409, origin); }
    try {
      await env.DB.prepare("INSERT INTO revisions(version, glossary_json, actor_id, changed_at, change_json) VALUES (?, ?, ?, ?, ?)")
        .bind(next.data.version, JSON.stringify(next.data), member.id, next.data.updatedAt, JSON.stringify(next.audit)).run();
      return response({ version: next.data.version, actor: member.id, updatedAt: next.data.updatedAt }, 200, origin);
    } catch { return response({ error: "Словарь обновился параллельно. Повторите правку после обновления." }, 409, origin); }
  }
};
