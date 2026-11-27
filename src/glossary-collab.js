import { GLOSSARY_DEFAULTS } from "./glossary-data.js";
import { GLOSSARY_LANGUAGES, setSharedGlossary } from "./glossary.js";

const $ = (id) => document.getElementById(id);
const CONFIG_URL = new URL("data/collaboration-config.json", document.baseURI);
const DATA_URL = new URL("data/shared-glossary.json", document.baseURI);
const CODE_KEY = "checkform-member-code-v1";
let api = "";
let sharedData = null;

function publishedTerm(row, language) {
  return sharedData?.overrides?.[row.id]?.[language] ?? row.terms?.[language] ?? "";
}

function publishedRow(id) {
  return GLOSSARY_DEFAULTS.find((row) => row.id === id) ?? sharedData?.customRows?.find((row) => row.id === id);
}

export async function refreshSharedGlossary(onChange = () => {}) {
  try {
    const configResponse = await fetch(CONFIG_URL, { cache: "no-store" });
    const config = configResponse.ok ? await configResponse.json() : {};
    api = /^https:\/\//u.test(config.collabApi ?? "") ? config.collabApi.replace(/\/$/u, "") : "";
    const response = await fetch(api ? `${api}/v1/glossary` : DATA_URL, { cache: "no-store" });
    if (!response.ok) return false;
    const data = await response.json();
    if (!setSharedGlossary(data, globalThis.localStorage)) return false;
    sharedData = data;
    onChange();
    return true;
  } catch { return false; }
}

export function initGlossaryCollab({ onChange, refreshView }) {
  const form = $("glossary-proposal-form");
  const status = $("glossary-collab-status");
  const codeInput = $("glossary-member-code");
  try { codeInput.value = localStorage.getItem(CODE_KEY) ?? ""; } catch { /* file URLs may disallow storage */ }

  function setMode(mode) {
    form.dataset.mode = mode;
    form.hidden = false;
    $("glossary-proposal-source").readOnly = mode !== "new";
    $("glossary-proposal-current").parentElement.hidden = mode === "new";
    form.querySelector(".glossary-proposal-mode").hidden = mode === "new";
    if (mode !== "new") form.querySelector(`input[name="glossary-proposal-mode"][value="${mode}"]`).checked = true;
    form.scrollIntoView({ block: "nearest", behavior: "smooth" });
    $(mode === "new" ? "glossary-proposal-source" : "glossary-proposal-value").focus();
  }

  $("glossary-table-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-propose-row]");
    if (!button) return;
    const row = publishedRow(Number(button.dataset.proposeRow));
    const target = $("glossary-language").value;
    const source = target === "uk" ? "ru" : "en";
    if (!row || !GLOSSARY_LANGUAGES[target]) return;
    $("glossary-proposal-row").value = String(row.id);
    $("glossary-proposal-language").value = GLOSSARY_LANGUAGES[target];
    $("glossary-proposal-source").value = publishedTerm(row, GLOSSARY_LANGUAGES[source]);
    $("glossary-proposal-current").value = publishedTerm(row, GLOSSARY_LANGUAGES[target]);
    $("glossary-proposal-value").value = "";
    $("glossary-proposal-root").value = "";
    $("glossary-proposal-title").textContent = `${publishedTerm(row, GLOSSARY_LANGUAGES[source])} · ${target}`;
    setMode("replace");
  });
  $("glossary-new-shared").addEventListener("click", () => {
    const target = $("glossary-language").value;
    if (!GLOSSARY_LANGUAGES[target]) return;
    $("glossary-proposal-row").value = "0";
    $("glossary-proposal-language").value = GLOSSARY_LANGUAGES[target];
    $("glossary-proposal-source").value = "";
    $("glossary-proposal-current").value = "";
    $("glossary-proposal-value").value = "";
    $("glossary-proposal-root").value = "";
    $("glossary-proposal-title").textContent = `Новый термин · ${target}`;
    setMode("new");
  });
  $("glossary-proposal-cancel").addEventListener("click", () => { form.hidden = true; });
  $("glossary-save-code").addEventListener("click", () => {
    const code = codeInput.value.trim();
    if (code.replace(/[\s-]/gu, "").length < 20) return void (status.textContent = "Код слишком короткий.");
    try { localStorage.setItem(CODE_KEY, code); status.textContent = "Код сохранён в этом браузере. Он будет проверен при публикации."; }
    catch { status.textContent = "Не удалось сохранить код в браузере."; }
  });
  $("glossary-forget-code").addEventListener("click", () => {
    try { localStorage.removeItem(CODE_KEY); } catch { /* no storage */ }
    codeInput.value = "";
    status.textContent = "Код удалён из этого браузера.";
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!api || !sharedData) return void (status.textContent = "Общий словарь ещё не подключён.");
    const code = codeInput.value.trim();
    if (!code) return void (status.textContent = "Введите личный код.");
    const root = $("glossary-proposal-root").value.trim();
    if (root && !/^[\p{L}]+(?:[ \u00a0-][\p{L}]+){0,3}$/u.test(root))
      return void (status.textContent = "Проверьте корень: до четырёх слов без цифр и знаков пунктуации.");
    const mode = form.dataset.mode === "new" ? "new" : form.elements.namedItem("glossary-proposal-mode").value;
    const change = {
      mode, rowId: Number($("glossary-proposal-row").value),
      language: $("glossary-proposal-language").value,
      sourceTerm: $("glossary-proposal-source").value.trim(),
      previous: $("glossary-proposal-current").value,
      value: $("glossary-proposal-value").value.trim(),
      root: root || null, baseVersion: sharedData.version
    };
    if (!change.sourceTerm || !change.value) return void (status.textContent = "Введите исходный термин и перевод.");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = "Публикую…";
    try {
      const response = await fetch(`${api}/v1/changes`, { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${code}` }, body: JSON.stringify(change) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Ошибка ${response.status}`);
      try { localStorage.setItem(CODE_KEY, code); } catch { /* session still works */ }
      const refreshed = await refreshSharedGlossary(() => { onChange(); refreshView(); });
      form.hidden = true;
      status.textContent = refreshed ? `Опубликовано: версия ${result.version}, автор ${result.actor}.` :
        `Опубликовано: версия ${result.version}. Обновите страницу, чтобы увидеть правку.`;
    } catch (error) { status.textContent = error.message; }
    finally { submit.disabled = false; }
  });
  refreshSharedGlossary(() => { onChange(); refreshView(); }).then((loaded) => {
    status.textContent = loaded ? "Общий словарь подключён. Для публикации правки нужен личный код." :
      "Не удалось загрузить общий словарь. Локальные проверки продолжат работать.";
  });
  return { refreshSharedGlossary: () => refreshSharedGlossary(() => { onChange(); refreshView(); }) };
}
