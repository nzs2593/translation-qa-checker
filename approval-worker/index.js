const REPO = "nzs2593/translation-qa-checker";
const DATA_PATH = "data/shared-glossary.json";
const MARKER = "checkform-glossary-proposal-v1";
const LANGUAGES = new Set(["az", "da", "mn", "pt-BR", "ru", "es", "es-AR", "uk", "uz", "uzb"]);

function htmlEscape(value) {
  return String(value).replace(/[&<>"']/gu, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function page(body, status = 200) {
  return new Response(`<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CHECKform · Согласование</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:680px;margin:6vh auto;padding:20px;color:#172b45}main{border:1px solid #cad8e9;border-radius:12px;padding:24px}label{display:grid;gap:6px;margin:14px 0}input{font:inherit;padding:10px;border:1px solid #a9bed7;border-radius:6px}button{font:inherit;padding:10px 18px;color:white;background:#1458bd;border:0;border-radius:6px;cursor:pointer}dl{display:grid;grid-template-columns:max-content 1fr;gap:8px 14px;overflow-wrap:anywhere}</style><main>${body}</main></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'" } });
}

async function github(env, path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...options, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "CHECKform-glossary-approval", ...(options.headers ?? {}) }
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  return response.json();
}

export function parseProposal(issue) {
  const match = issue.body?.match(/```checkform-glossary-proposal-v1\s*([\s\S]*?)```/u);
  if (!match || issue.state !== "open") throw new Error("Предложение не найдено или уже закрыто.");
  let data;
  try { data = JSON.parse(match[1]); } catch { throw new Error("Некорректный формат предложения."); }
  if (data.schema !== MARKER || !["add", "replace"].includes(data.mode) ||
      !Number.isInteger(data.rowId) || data.rowId < 1 || data.rowId > 100000 ||
      !Number.isInteger(data.baseVersion) || !LANGUAGES.has(data.language) ||
      typeof data.sourceTerm !== "string" || !data.sourceTerm.trim() || data.sourceTerm.length > 200 ||
      typeof data.value !== "string" || !data.value.trim() || data.value.length > 200 ||
      !(data.root == null || (typeof data.root === "string" && /^[\p{L}]+(?:[ \u00a0-][\p{L}]+){0,3}$/u.test(data.root)))) {
    throw new Error("Предложение содержит недопустимые данные.");
  }
  return data;
}

function decodeBase64(value) {
  const bytes = Uint8Array.from(atob(value.replace(/\s/gu, "")), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function applyProposal(data, proposal) {
  if (data.schema !== "checkform-shared-glossary-v1" || !Number.isInteger(data.version) || data.version < proposal.baseVersion)
    throw new Error("Версия словаря не совпадает с предложением.");
  if (proposal.rowId > 822 && !data.customRows.some((row) => row.id === proposal.rowId))
    throw new Error("Термин словаря не найден.");
  if (proposal.mode === "add") {
    if (data.customRows.some((row) => row.terms?.[proposal.language]?.toLocaleLowerCase() === proposal.value.trim().toLocaleLowerCase() &&
      row.terms?.[proposal.language === "uk" ? "ru" : "en-GB"]?.toLocaleLowerCase() === proposal.sourceTerm.toLocaleLowerCase()))
      throw new Error("Такой вариант уже опубликован.");
    const id = Math.max(822, ...data.customRows.map((row) => Number(row.id) || 0)) + 1;
    const sourceLanguage = proposal.language === "uk" ? "ru" : "en-GB";
    data.customRows.push({ id, terms: { [sourceLanguage]: proposal.sourceTerm, [proposal.language]: proposal.value.trim() },
      ...(proposal.root ? { roots: { [proposal.language]: proposal.root.trim() } } : {}) });
  } else {
    const current = data.overrides[proposal.rowId]?.[proposal.language];
    if (current != null && current !== proposal.previous && data.version > proposal.baseVersion)
      throw new Error("Этот перевод изменился после создания предложения. Проверьте его заново.");
    data.overrides[proposal.rowId] ??= {};
    data.overrides[proposal.rowId][proposal.language] = proposal.value.trim();
    data.rootOverrides[proposal.rowId] ??= {};
    if (proposal.root) data.rootOverrides[proposal.rowId][proposal.language] = proposal.root.trim();
    else delete data.rootOverrides[proposal.rowId][proposal.language];
  }
  data.version += 1;
  data.updatedAt = new Date().toISOString();
  return data;
}

export default {
  async fetch(request, env, ctx) {
    if (!ctx.access || !env.ADMIN_EMAIL || !env.APPROVAL_CODE || !env.GITHUB_TOKEN || !env.ATTEMPTS)
      return page("<h1>Согласование недоступно</h1><p>Требуется защищённый доступ и серверные секреты.</p>", 503);
    const identity = await ctx.access.getIdentity();
    if (identity?.email?.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) return page("<h1>Нет доступа</h1>", 403);
    const url = new URL(request.url);
    const number = Number(url.searchParams.get("issue"));
    if (!Number.isInteger(number) || number < 1) return page("<h1>Неверный номер предложения</h1>", 400);
    if (request.method === "GET" && url.pathname === "/review") {
      try {
        const issue = await github(env, `issues/${number}`);
        const data = parseProposal(issue);
        return page(`<h1>Согласовать правку #${number}</h1><dl><dt>Термин</dt><dd>${htmlEscape(data.sourceTerm)}</dd><dt>Язык</dt><dd>${htmlEscape(data.language)}</dd><dt>Действие</dt><dd>${data.mode === "add" ? "Добавить вариант" : "Заменить"}</dd><dt>Было</dt><dd>${htmlEscape(data.previous || "—")}</dd><dt>Станет</dt><dd>${htmlEscape(data.value)}</dd><dt>Корень</dt><dd>${htmlEscape(data.root || "Автоматически")}</dd></dl><form action="/review?issue=${number}" method="post"><label>Код согласования<input name="code" type="password" inputmode="numeric" autocomplete="off" required></label><button type="submit">Утвердить и опубликовать</button></form>`);
      } catch (error) { return page(`<h1>Не удалось открыть предложение</h1><p>${htmlEscape(error.message)}</p>`, 400); }
    }
    if (request.method === "POST" && url.pathname === "/review") {
      const attemptsKey = `approve:${identity.email.toLowerCase()}`;
      const attempts = Number(await env.ATTEMPTS.get(attemptsKey) ?? 0);
      if (attempts >= 5) return page("<h1>Слишком много попыток</h1><p>Повторите через час.</p>", 429);
      const form = await request.formData();
      if (String(form.get("code") ?? "") !== env.APPROVAL_CODE) {
        await env.ATTEMPTS.put(attemptsKey, String(attempts + 1), { expirationTtl: 3600 });
        return page("<h1>Неверный код</h1><p>Вернитесь и попробуйте ещё раз.</p>", 403);
      }
      try {
        const issue = await github(env, `issues/${number}`);
        const proposal = parseProposal(issue);
        const file = await github(env, `contents/${DATA_PATH}?ref=main`);
        const data = applyProposal(JSON.parse(decodeBase64(file.content)), proposal);
        await github(env, `contents/${DATA_PATH}`, { method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: `Approve glossary proposal #${number}`, content: encodeBase64(`${JSON.stringify(data, null, 2)}\n`), sha: file.sha, branch: "main" }) });
        await github(env, `issues/${number}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: "closed" }) });
        return page(`<h1>Правка утверждена</h1><p>Версия словаря ${data.version} опубликована в GitHub. Вернитесь на сайт CHECKform и обновите страницу.</p>`);
      } catch (error) { return page(`<h1>Не удалось опубликовать</h1><p>${htmlEscape(error.message)}</p>`, 409); }
    }
    return page("<h1>Страница не найдена</h1>", 404);
  }
};
