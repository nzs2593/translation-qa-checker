export const INTERFACE_LOCALES = Object.freeze(["en", "ru"]);

const UI = {
  en: {
    eyebrow: "LOCAL · RULE-BASED QA",
    title: "CHECKform",
    subtitle: "Find translation inconsistencies without changing the target.",
    workspace: "Translation workspace",
    original: "ORIGINAL",
    sourceLanguage: "Source language",
    goalLanguage: "Goal language",
    sourcePlaceholder: "Paste the source text here or drop a file…",
    targetPlaceholder: "Paste the translation here…",
    dropOriginal: "Drop Original file here",
    dropGoal: "Drop Goal file here",
    openFile: "Open file",
    chooseProfile: "Choose a profile or use Auto-detect. The selected profile controls date formats, punctuation and numeric conventions.",
    dropGoalCopy: "Drop the Goal file here or use Open file. It will appear in Target Review.",
    waitingForGoal: "Waiting for goal text",
    manualProfile: "Manual profile",
    detected: "Detected",
    supportedProfiles: "Supported profiles",
    profilesCount: "11 language profiles",
    targetReview: "TARGET REVIEW",
    issues: "ISSUES",
    reviewFindings: "Review findings",
    checking: "Checking…",
    finding: "finding",
    findings: "findings",
    excluded: "excluded",
    noFindings: "No findings",
    noViolations: "No rule violations found in this increment.",
    exportPdf: "Export PDF",
    count: "Count",
    edit: "Edit",
    done: "Done",
    explanation: "Explanation",
    goToIssue: "Go to {type} in target text",
    noPopup: "Allow pop-ups to export PDF",
    checked: "Checked {time}",
    ready: "Ready",
    footer: "Deterministic checks · No LLM · No auto-correction",
    errorTable: "Error table",
    errorTableTitle: "Error table",
    errorTableDescription: "Supported checks and their default severity",
    close: "Close",
    errorType: "Error type",
    pool: "Pool",
    severity: "Severity",
    description: "Description",
    profileRulesTitle: "Profile conventions",
    dateFormat: "Date format",
    decimalSeparator: "Decimal separator",
    thousandSeparator: "Thousand separator",
    currencyFormat: "Currency",
    percentageFormat: "Percentage",
    quotationMarks: "Quotation marks",
    before: "before",
    after: "after",
    withoutSpace: "without space",
    withSpace: "with space",
    notSpecified: "Not specified",
    interfaceLanguage: "Interface language",
    autoDetect: "Auto-detect",
    sourceFileReceived: "Source file received · waiting for the other file",
    targetFileReceived: "Goal file received · waiting for the other file",
    bothFilesLoaded: "Both files loaded",
    fileLoaded: "File loaded",
    sourceFile: "Source file",
    targetFile: "Goal file"
  },
  ru: {
    eyebrow: "ЛОКАЛЬНАЯ · RULE-BASED QA",
    title: "CHECKform",
    subtitle: "Находит несоответствия, не изменяя целевой текст.",
    workspace: "Рабочая область перевода",
    original: "ОРИГИНАЛ",
    sourceLanguage: "Язык оригинала",
    goalLanguage: "Целевой язык",
    sourcePlaceholder: "Вставьте текст оригинала или перетащите файл…",
    targetPlaceholder: "Вставьте перевод…",
    dropOriginal: "Перетащите файл оригинала сюда",
    dropGoal: "Перетащите файл перевода сюда",
    openFile: "Открыть файл",
    chooseProfile: "Выберите профиль или используйте автоопределение. Профиль задаёт форматы дат, пунктуации и чисел.",
    dropGoalCopy: "Перетащите файл перевода или нажмите «Открыть файл». Он появится в окне проверки справа.",
    waitingForGoal: "Ожидание текста перевода",
    manualProfile: "Профиль выбран вручную",
    detected: "Определён",
    supportedProfiles: "Доступные профили",
    profilesCount: "11 языковых профилей",
    targetReview: "ПРОВЕРКА ПЕРЕВОДА",
    issues: "ОШИБКИ",
    reviewFindings: "Результаты проверки",
    checking: "Проверка…",
    finding: "ошибка",
    findings: "ошибок",
    excluded: "исключено",
    noFindings: "Ошибок нет",
    noViolations: "На этом этапе нарушений не найдено.",
    exportPdf: "Экспорт PDF",
    count: "Учитывать",
    edit: "Изменить",
    done: "Готово",
    explanation: "Пояснение",
    goToIssue: "Перейти к ошибке {type} в тексте перевода",
    noPopup: "Разрешите всплывающие окна для экспорта PDF",
    checked: "Проверено в {time}",
    ready: "Готово",
    footer: "Детерминированные проверки · Без LLM · Без автокоррекции",
    errorTable: "Таблица ошибок",
    errorTableTitle: "Таблица ошибок",
    errorTableDescription: "Доступные проверки и их градация по умолчанию",
    close: "Закрыть",
    errorType: "Тип ошибки",
    pool: "Пул",
    severity: "Градация",
    description: "Описание",
    profileRulesTitle: "Правила профиля",
    dateFormat: "Формат даты",
    decimalSeparator: "Десятичный разделитель",
    thousandSeparator: "Разделитель тысяч",
    currencyFormat: "Валюта",
    percentageFormat: "Проценты",
    quotationMarks: "Кавычки",
    before: "перед числом",
    after: "после числа",
    withoutSpace: "без пробела",
    withSpace: "с пробелом",
    notSpecified: "Не задано",
    interfaceLanguage: "Язык интерфейса",
    autoDetect: "Автоопределение",
    sourceFileReceived: "Файл оригинала получен · ожидается второй файл",
    targetFileReceived: "Файл перевода получен · ожидается второй файл",
    bothFilesLoaded: "Оба файла загружены",
    fileLoaded: "Файл загружен",
    sourceFile: "Файл оригинала",
    targetFile: "Файл перевода"
  }
};

export const PROFILE_LABELS = Object.freeze({
  ru: {
    en: "Английский", ru: "Русский", es: "Испанский", "es-AR": "Аргентинский испанский",
    "uz-Cyrl": "Узбекский (кириллица)", "uz-Latn": "Узбекский (латиница)", uk: "Украинский",
    mn: "Монгольский", da: "Датский", "pt-BR": "Бразильский португальский", az: "Азербайджанский"
  }
});

export const ISSUE_CATALOG = Object.freeze([
  { type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", en: "Numeric values outside dates and times differ between source and target.", ru: "Числовое значение вне даты или времени отличается в оригинале и переводе." },
  { type: "NUMBER_FORMAT", pool: "Numbers", severity: "Minor", en: "Digit grouping does not follow the selected language profile.", ru: "Разделители разрядов не соответствуют выбранному языковому профилю." },
  { type: "CURRENCY_MISMATCH", pool: "Currency", severity: "Major", en: "Currency markers differ between source and target.", ru: "Обозначения валюты отличаются в оригинале и переводе." },
  { type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", en: "Currency placement or spacing does not follow the selected profile.", ru: "Положение валюты или пробелы не соответствуют выбранному профилю." },
  { type: "PERCENTAGE_FORMAT", pool: "Percentage", severity: "Minor", en: "The percentage sign uses an incorrect position or spacing.", ru: "Знак процента стоит неверно или отделён неправильным пробелом." },
  { type: "PUNCTUATION_MISMATCH", pool: "Punctuation", severity: "Minor", en: "Terminal punctuation differs between source and target.", ru: "Конечный знак препинания отличается в оригинале и переводе." },
  { type: "QUOTATION_STYLE", pool: "Punctuation", severity: "Minor", en: "Quotation marks do not follow the selected language profile.", ru: "Кавычки не соответствуют выбранному языковому профилю." },
  { type: "MULTIPLE_SPACES", pool: "Spacing", severity: "Minor", en: "Target contains consecutive spaces.", ru: "В переводе обнаружены двойные или множественные пробелы." },
  { type: "TRAILING_SPACE", pool: "Spacing", severity: "Minor", en: "Target contains a space at the end of a line.", ru: "В конце строки перевода стоит лишний пробел." },
  { type: "SPACE_BEFORE_PUNCTUATION", pool: "Spacing", severity: "Minor", en: "There is an unnecessary space before punctuation.", ru: "Перед знаком препинания стоит лишний пробел." },
  { type: "NON_BREAKING_SPACE", pool: "Spacing", severity: "Minor", en: "Digit groups should use a non-breaking space in this language profile.", ru: "В этом языковом профиле между разрядами нужен неразрывный пробел." },
  { type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", en: "A placeholder is missing or changed in the target.", ru: "Плейсхолдер отсутствует или изменён в переводе." },
  { type: "TIMEZONE_MISSING", pool: "Dates & Time", severity: "Major", en: "Timezone is present in the source but missing in the target.", ru: "В оригинале есть часовой пояс, но в переводе он отсутствует." },
  { type: "TIMEZONE_EXTRA", pool: "Dates & Time", severity: "Minor", en: "Target adds a timezone that is not present in the source.", ru: "В переводе добавлен часовой пояс, которого нет в оригинале." },
  { type: "TIMEZONE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The local date/time matches, but the timezone offset differs.", ru: "Местные дата и время совпадают, но смещение часового пояса различается." },
  { type: "INVALID_DATE", pool: "Dates & Time", severity: "Major", en: "A calendar date is not valid in the source or target.", ru: "Календарная дата некорректна в оригинале или переводе." },
  { type: "DATE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target contain different calendar dates.", ru: "Календарные даты в оригинале и переводе различаются." },
  { type: "TIME_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target contain different clock times.", ru: "Время на часах в оригинале и переводе различается." },
  { type: "DATETIME_MISMATCH", pool: "Dates & Time", severity: "Major", en: "Source and target resolve to different moments after timezone normalization.", ru: "После нормализации часовых поясов оригинал и перевод указывают на разные моменты." }
]);

const POOL_LABELS = {
  ru: { Numbers: "Числа", Currency: "Валюта", Percentage: "Проценты", Punctuation: "Пунктуация", Spacing: "Пробелы", Capitalization: "Регистр", Placeholders: "Плейсхолдеры", Terminology: "Терминология", Formatting: "Форматирование", Transliteration: "Транслитерация", "Dates & Time": "Даты и время", "File structure": "Структура файла" }
};
const SEVERITY_LABELS = {
  en: { Critical: "CRITICAL", Major: "MAJOR", Minor: "MINOR", Info: "INFO" },
  ru: { Critical: "CRITICAL", Major: "MAJOR", Minor: "MINOR", Info: "INFO" }
};

export function getLocale() {
  return localStorage.getItem("translation-qa-locale") === "ru" ? "ru" : "en";
}

export function setLocale(locale) {
  const next = INTERFACE_LOCALES.includes(locale) ? locale : "en";
  localStorage.setItem("translation-qa-locale", next);
  return next;
}

export function t(locale, key, variables = {}) {
  let value = UI[locale]?.[key] ?? UI.en[key] ?? key;
  for (const [name, replacement] of Object.entries(variables)) value = value.replace(`{${name}}`, replacement);
  return value;
}

export function profileLabel(locale, code, fallback) {
  return PROFILE_LABELS[locale]?.[code] ?? fallback;
}

export function poolLabel(locale, pool) {
  return POOL_LABELS[locale]?.[pool] ?? pool;
}

export function severityLabel(locale, severity) {
  return SEVERITY_LABELS[locale]?.[severity] ?? severity;
}

export function catalogEntry(errorType) {
  return ISSUE_CATALOG.find((entry) => entry.type === errorType);
}

export function issueDescription(locale, issue) {
  const entry = catalogEntry(issue.error_type);
  return entry?.[locale] ?? entry?.en ?? issue.explanation ?? "";
}
