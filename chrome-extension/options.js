const input = document.getElementById("settings-file");
const status = document.getElementById("status");

chrome.storage.local.get(["glossarySettings", "timezoneSettings"], (saved) => {
  const glossaryCount = Object.keys(saved.glossarySettings?.overrides ?? {}).length
    + (saved.glossarySettings?.customRows?.length ?? 0);
  const timezoneCount = Object.keys(saved.timezoneSettings ?? {}).length;
  status.textContent = `Сохранено: ${glossaryCount} правок словаря, ${timezoneCount} правил GMT.`;
});

input.addEventListener("change", async () => {
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.schema !== "checkform-settings-v1" ||
      !parsed.glossary || typeof parsed.glossary !== "object" || Array.isArray(parsed.glossary) ||
      !parsed.timezone || typeof parsed.timezone !== "object" || Array.isArray(parsed.timezone)) {
      throw new Error("Неверный формат файла настроек.");
    }
    await chrome.storage.local.set({ glossarySettings: parsed.glossary, timezoneSettings: parsed.timezone });
    const count = Object.keys(parsed.glossary.overrides ?? {}).length + (parsed.glossary.customRows?.length ?? 0);
    status.textContent = `Импортировано: ${count} правок словаря и ${Object.keys(parsed.timezone).length} правил GMT.`;
  } catch (error) {
    status.textContent = `Не удалось импортировать: ${error.message}`;
  }
});
