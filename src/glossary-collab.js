import { GLOSSARY_LANGUAGES, getGlossaryRows, setSharedGlossary } from "./glossary.js";

const $ = (id) => document.getElementById(id);
const REPO = "nzs2593/translation-qa-checker";
const MARKER = "checkform-glossary-proposal-v1";
const DATA_URL = new URL("data/shared-glossary.json", document.baseURI);
let sharedVersion = 1;

function proposalFromIssue(issue) {
  const match = issue.body?.match(/```checkform-glossary-proposal-v1\s*([\s\S]*?)```/u);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    if (data.schema !== MARKER || !["add", "replace"].includes(data.mode) ||
        !Number.isInteger(data.rowId) || !Number.isInteger(data.baseVersion) ||
        !Object.values(GLOSSARY_LANGUAGES).includes(data.language) ||
        typeof data.value !== "string" || !data.value.trim()) return null;
    return data;
  } catch { return null; }
}

export async function refreshSharedGlossary(onChange = () => {}) {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) return false;
    const data = await response.json();
    if (!setSharedGlossary(data, globalThis.localStorage)) return false;
    sharedVersion = data.version;
    onChange();
    return true;
  } catch { return false; }
}

export function initGlossaryCollab({ onChange, refreshView }) {
  const form = $("glossary-proposal-form");
  const status = $("glossary-collab-status");
  const list = $("glossary-proposal-list");
  let approvalApi = "";

  fetch(new URL("data/collaboration-config.json", document.baseURI))
    .then((response) => response.ok ? response.json() : {})
    .then((config) => { approvalApi = /^https:\/\//u.test(config.approvalApi ?? "") ? config.approvalApi : ""; })
    .catch(() => {});

  $("glossary-table-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-propose-row]");
    if (!button) return;
    const row = getGlossaryRows().find((item) => String(item.id) === button.dataset.proposeRow);
    const target = $("glossary-language").value;
    const source = target === "uk" ? "ru" : "en";
    if (!row || !GLOSSARY_LANGUAGES[target]) return;
    $("glossary-proposal-row").value = String(row.id);
    $("glossary-proposal-language").value = GLOSSARY_LANGUAGES[target];
    $("glossary-proposal-source").value = row.terms[GLOSSARY_LANGUAGES[source]] ?? "";
    $("glossary-proposal-current").value = row.terms[GLOSSARY_LANGUAGES[target]] ?? "";
    $("glossary-proposal-value").value = "";
    $("glossary-proposal-root").value = "";
    $("glossary-proposal-title").textContent = `${row.terms[GLOSSARY_LANGUAGES[source]] ?? "Термин"} · ${target}`;
    form.hidden = false;
    form.scrollIntoView({ block: "nearest", behavior: "smooth" });
    $("glossary-proposal-value").focus();
  });
  $("glossary-proposal-cancel").addEventListener("click", () => { form.hidden = true; });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = $("glossary-proposal-value").value.trim();
    const root = $("glossary-proposal-root").value.trim();
    if (!value || (root && !/^[\p{L}]+(?:[ \u00a0-][\p{L}]+){0,3}$/u.test(root))) {
      status.textContent = "Проверьте перевод и корень.";
      return;
    }
    const data = {
      schema: MARKER, mode: form.elements.namedItem("glossary-proposal-mode").value,
      rowId: Number($("glossary-proposal-row").value),
      language: $("glossary-proposal-language").value,
      sourceTerm: $("glossary-proposal-source").value,
      previous: $("glossary-proposal-current").value,
      value, root: root || null, baseVersion: sharedVersion
    };
    const body = `Предложение из CHECKform.\n\n\`\`\`${MARKER}\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    const title = `[Глоссарий] ${data.sourceTerm} → ${value} (${data.language})`;
    const url = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    status.textContent = "Открыта форма GitHub. Отправьте предложение там; общий словарь пока не изменён.";
  });

  async function loadProposals() {
    status.textContent = "Загружаю предложения…";
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO}/issues?state=open&per_page=100`, { cache: "no-store" });
      if (!response.ok) throw new Error(`GitHub: ${response.status}`);
      const issues = (await response.json()).filter((issue) => !issue.pull_request)
        .map((issue) => ({ issue, proposal: proposalFromIssue(issue) })).filter((item) => item.proposal);
      list.replaceChildren();
      status.textContent = issues.length ? `${issues.length} предложений на рассмотрении` : "Предложений пока нет.";
      for (const { issue, proposal } of issues) {
        const card = document.createElement("article"); card.className = "glossary-proposal-card";
        const summary = document.createElement("p");
        summary.textContent = `#${issue.number} · ${proposal.sourceTerm} · ${proposal.language} · ${proposal.mode === "add" ? "добавить вариант" : "заменить"}: ${proposal.previous || "—"} → ${proposal.value}${proposal.root ? ` · корень: ${proposal.root}` : ""}`;
        const link = document.createElement("a"); link.href = issue.html_url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "Открыть предложение";
        const approval = document.createElement("a"); approval.className = "glossary-approve-link";
        approval.textContent = "Согласовать по коду";
        approval.href = approvalApi ? `${approvalApi.replace(/\/$/u, "")}/review?issue=${issue.number}` : "#glossary-collab-status";
        approval.target = approvalApi ? "_blank" : "_self";
        approval.rel = "noopener noreferrer";
        if (!approvalApi) approval.addEventListener("click", () => {
          status.textContent = "Сервер согласования ещё не подключён. Предложения можно просматривать, но публиковать по коду пока нельзя.";
        });
        card.append(summary, link, approval); list.append(card);
      }
      if (issues.length && !approvalApi) status.textContent += " · Утверждение по коду ожидает подключения серверного маршрута.";
    } catch (error) { status.textContent = `Не удалось загрузить предложения: ${error.message}`; }
  }
  $("glossary-load-proposals").addEventListener("click", loadProposals);
  refreshSharedGlossary(() => { onChange(); refreshView(); });
  return { refreshSharedGlossary: () => refreshSharedGlossary(() => { onChange(); refreshView(); }) };
}
