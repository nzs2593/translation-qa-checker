export const CROWDIN_LANGUAGES = Object.freeze({
  engb: "en", en: "en", ru: "ru", uk: "uk", az: "az", da: "da", mn: "mn",
  es: "es", esar: "es-AR", ptbr: "pt-BR", uz: "uz-Latn", uzb: "uz-Cyrl"
});

export function editorLanguages(pathname) {
  const pair = pathname.match(/\/editor\/[^/]+\/[^/]+\/([^/]+)-([^/]+)(?:\/|$)/i);
  if (!pair) return null;
  const sourceLanguage = CROWDIN_LANGUAGES[pair[1].toLowerCase()];
  const targetLanguage = CROWDIN_LANGUAGES[pair[2].toLowerCase()];
  return sourceLanguage && targetLanguage ? { sourceLanguage, targetLanguage } : null;
}

export function cleanCrowdinMarkup(text) {
  return String(text ?? "").replace(/<\/?\d+\s*\/?>/g, "").trim();
}

export function readCrowdinRows(root = document) {
  return [...root.querySelectorAll('#texts_list [role="listitem"][data-id]')].flatMap((row) => {
    const source = row.querySelector('.source-string-container [data-testid="SingularString"]')
      ?? row.querySelector('.source-string-container');
    const target = row.querySelector('textarea.side-by-side-textarea');
    if (!source || !target) return [];
    return [{
      id: row.getAttribute("data-id"), row, target,
      sourceText: cleanCrowdinMarkup(source.textContent),
      targetText: cleanCrowdinMarkup(target.value)
    }];
  });
}
