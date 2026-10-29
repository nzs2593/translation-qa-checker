export const INTERFACE_LOCALES = Object.freeze(["en", "ru"]);

const UI = {
  en: {
    eyebrow: "LOCAL · RULE-BASED QA",
    title: "CHECKform",
    subtitle: "Find what others miss",
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
    startAgain: "Start again",
    sideView: "Findings on side",
    bottomView: "Findings below",
    dragFindings: "Drag findings to the right or below",
    checkCurrency: "Check currency",
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
    checkTab: "Check",
    glossaryTab: "Glossary",
    gmtTab: "GMT",
    gmtTitle: "GMT & time zones",
    gmtIntro: "Set the expected marker and offset by target language. Changes are saved in this browser and applied to the next check.",
    gmtNote: "A language is not a time zone. Until a market-specific rule is confirmed, keep the source marker and offset. English is the usual source; Ukrainian normally uses Russian.",
    gmtSource: "Usual source",
    gmtRule: "Target rule",
    gmtMarker: "Marker",
    gmtOffset: "Offset from GMT (hours)",
    gmtExample: "Example from 20:59 GMT",
    gmtInherit: "Keep source zone",
    gmtEquivalent: "Equivalent moment (any marker)",
    gmtFixed: "Fixed marker and offset",
    gmtExamplesTitle: "Checks",
    gmtExamplesCopy: "20:59 GMT → 17:59 GMT-3 passes for Argentine Spanish and Brazilian Portuguese. GMT -3 has an extra space. 12:00 МСК = 09:00 GMT.",
    gmtSaved: "GMT rule saved in this browser",
    gmtSaveError: "Enter a valid offset from -12 to +14 hours",
    rulesTab: "Language rules",
    rulesTitle: "Language conventions",
    rulesIntro: "A quick reference based on the supplied style guides and CHECKform's language profiles.",
    rulesNote: "Examples show default formats. Market and content-type exceptions need manual review.",
    rulesLanguage: "Language", rulesDate: "Date", rulesNumber: "Numbers", rulesCurrency: "Currency",
    rulesPercent: "Percent", rulesQuotes: "Quotes", rulesNotes: "Exceptions / guide",
    rulesChecksTitle: "Automated checks",
    rulesChecksCopy: "CHECKform checks comparable numeric values, dates, currency markers and placement, percent spacing, quotation style, and extra spaces. Ambiguous formats require review.",
    glossaryTitle: "Glossary",
    glossaryIntro: "Edit a term here and CHECKform will use the new translation in the next check. Changes are saved in this browser.",
    glossarySearch: "Search terms or translations…",
    glossaryFrom: "Source term",
    glossaryTo: "Goal term",
    glossaryNotes: "Notes",
    glossaryAdd: "Add term",
    glossaryAddSource: "New source term",
    glossaryAddTarget: "New goal term",
    glossarySaved: "Saved in this browser",
    glossarySaveError: "Could not save changes in this browser",
    glossaryRows: "{count} entries",
    glossaryEmpty: "No entries match the search.",
    glossaryMissing: "No translation in glossary",
    glossaryShowMore: "Show more",
    glossarySourceRule: "Source: {language}",
    errorTableTitle: "Error table",
    errorTableDescription: "Supported checks and their default severity",
    close: "Close",
    errorType: "Error type",
    pool: "Pool",
    severity: "Severity",
    description: "Description",
    profileRulesTitle: "Profile conventions",
    dateFormat: "Date format",
    targetTimezone: "Target time zone",
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
    subtitle: "Находим то, что другие не видят",
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
    startAgain: "Начать заново",
    sideView: "Ошибки сбоку",
    bottomView: "Ошибки снизу",
    dragFindings: "Перетащите панель ошибок вправо или вниз",
    checkCurrency: "Проверять валюту",
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
    checkTab: "Проверка",
    glossaryTab: "Словарь",
    gmtTab: "GMT",
    gmtTitle: "GMT и часовые пояса",
    gmtIntro: "Укажите маркер и смещение для целевого языка. Изменения сохраняются в браузере и применяются при следующей проверке.",
    gmtNote: "Язык не равен часовому поясу. Пока правило рынка не подтверждено, сохраняем маркер и смещение оригинала. Обычно оригинал английский; для украинского — русский.",
    gmtSource: "Обычный оригинал",
    gmtRule: "Правило перевода",
    gmtMarker: "Маркер",
    gmtOffset: "Смещение от GMT (часы)",
    gmtExample: "Пример от 20:59 GMT",
    gmtInherit: "Как в оригинале",
    gmtEquivalent: "Тот же момент (любой маркер)",
    gmtFixed: "Заданы маркер и смещение",
    gmtExamplesTitle: "Примеры проверок",
    gmtExamplesCopy: "20:59 GMT → 17:59 GMT-3 — верно для аргентинского испанского и бразильского португальского. GMT -3 — лишний пробел. 12:00 МСК = 09:00 GMT.",
    gmtSaved: "Правило GMT сохранено в этом браузере",
    gmtSaveError: "Укажите корректное смещение от −12 до +14 часов",
    rulesTab: "Правила языков",
    rulesTitle: "Языковые правила",
    rulesIntro: "Краткая памятка по присланным стайлгайдам и языковым профилям CHECKform.",
    rulesNote: "В таблице базовые форматы. Исключения по рынку и типу текста требуют проверки человеком.",
    rulesLanguage: "Язык", rulesDate: "Дата", rulesNumber: "Числа", rulesCurrency: "Валюта",
    rulesPercent: "Проценты", rulesQuotes: "Кавычки", rulesNotes: "Исключения / документ",
    rulesChecksTitle: "Автоматические проверки",
    rulesChecksCopy: "CHECKform сравнивает числовые значения и даты, проверяет обозначения и положение валют, пробелы перед %, кавычки и лишние пробелы. Неоднозначные форматы требуют просмотра.",
    glossaryTitle: "Словарь",
    glossaryIntro: "Измените термин здесь — CHECKform учтёт новый перевод при следующей проверке. Изменения сохраняются в этом браузере.",
    glossarySearch: "Поиск по терминам и переводам…",
    glossaryFrom: "Термин оригинала",
    glossaryTo: "Термин перевода",
    glossaryNotes: "Примечания",
    glossaryAdd: "Добавить термин",
    glossaryAddSource: "Новый термин оригинала",
    glossaryAddTarget: "Новый термин перевода",
    glossarySaved: "Сохранено в этом браузере",
    glossarySaveError: "Не удалось сохранить изменения в браузере",
    glossaryRows: "{count} записей",
    glossaryEmpty: "По запросу записей нет.",
    glossaryMissing: "Нет перевода в словаре",
    glossaryShowMore: "Показать ещё",
    glossarySourceRule: "Оригинал: {language}",
    errorTableTitle: "Таблица ошибок",
    errorTableDescription: "Доступные проверки и их градация по умолчанию",
    close: "Закрыть",
    errorType: "Тип ошибки",
    pool: "Пул",
    severity: "Градация",
    description: "Описание",
    profileRulesTitle: "Правила профиля",
    dateFormat: "Формат даты",
    targetTimezone: "Часовой пояс перевода",
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
  { type: "GLOSSARY_TRANSLATION_MISSING", pool: "Terminology", severity: "Major", en: "A source term is present, but its listed glossary translation is missing from the matching target passage.", ru: "Термин есть в оригинале, но его перевод из словаря отсутствует в соответствующем фрагменте." },
  { type: "GLOSSARY_CASE_MISMATCH", pool: "Terminology", severity: "Minor", en: "The glossary translation is present but its letter case differs.", ru: "Перевод из словаря найден, но регистр букв отличается." },
  { type: "NUMBER_MISMATCH", pool: "Numbers", severity: "Major", en: "Numeric values outside dates and times differ between source and target.", ru: "Числовое значение вне даты или времени отличается в оригинале и переводе." },
  { type: "NUMBER_WORD_JOINED", pool: "Numbers", severity: "Minor", en: "A number is attached to a word and may indicate a typo or a missing space.", ru: "Цифра присоединена к слову — возможно, это опечатка или пропущен пробел." },
  { type: "SPANISH_QUESTION_MARKS", pool: "Punctuation", severity: "Minor", en: "Spanish questions should use an opening ¿ and a closing ?.", ru: "В испанском вопросе должны быть открывающий знак ¿ и закрывающий ?." },
  { type: "SPANISH_EXCLAMATION_MARKS", pool: "Punctuation", severity: "Minor", en: "Spanish exclamations should use an opening ¡ and a closing !.", ru: "В испанском восклицании должны быть открывающий знак ¡ и закрывающий !." },
  { type: "NUMBER_FORMAT", pool: "Numbers", severity: "Minor", en: "Digit grouping does not follow the selected language profile.", ru: "Разделители разрядов не соответствуют выбранному языковому профилю." },
  { type: "CURRENCY_MISMATCH", pool: "Currency", severity: "Major", en: "Currency markers differ between source and target.", ru: "Обозначения валюты отличаются в оригинале и переводе." },
  { type: "CURRENCY_FORMAT", pool: "Currency", severity: "Minor", en: "Currency placement or spacing does not follow the selected profile.", ru: "Положение валюты или пробелы не соответствуют выбранному профилю." },
  { type: "PERCENTAGE_FORMAT", pool: "Percentage", severity: "Minor", en: "The percentage sign uses an incorrect position or spacing.", ru: "Знак процента стоит неверно или отделён неправильным пробелом." },
  { type: "PUNCTUATION_MISMATCH", pool: "Punctuation", severity: "Minor", en: "Terminal punctuation differs between source and target.", ru: "Конечный знак препинания отличается в оригинале и переводе." },
  { type: "QUOTATION_STYLE", pool: "Punctuation", severity: "Minor", en: "Quotation marks do not follow the selected language profile.", ru: "Кавычки не соответствуют выбранному языковому профилю." },
  { type: "MULTIPLE_SPACES", pool: "Spacing", severity: "Minor", en: "Target contains consecutive spaces.", ru: "В переводе обнаружены двойные или множественные пробелы." },
  { type: "TRAILING_SPACE", pool: "Spacing", severity: "Minor", en: "Target contains a space at the end of a line.", ru: "В конце строки перевода стоит лишний пробел." },
  { type: "LEADING_SPACE", pool: "Spacing", severity: "Minor", en: "Target contains a space at the beginning of a line.", ru: "В начале строки перевода стоит лишний пробел." },
  { type: "SPACE_BEFORE_PUNCTUATION", pool: "Spacing", severity: "Minor", en: "There is an unnecessary space before punctuation.", ru: "Перед знаком препинания стоит лишний пробел." },
  { type: "NON_BREAKING_SPACE", pool: "Spacing", severity: "Minor", en: "Digit groups should use a non-breaking space in this language profile.", ru: "В этом языковом профиле между разрядами нужен неразрывный пробел." },
  { type: "PLACEHOLDER_MISMATCH", pool: "Placeholders", severity: "Major", en: "A placeholder is missing or changed in the target.", ru: "Плейсхолдер отсутствует или изменён в переводе." },
  { type: "TIMEZONE_MISSING", pool: "Dates & Time", severity: "Major", en: "Timezone is present in the source but missing in the target.", ru: "В оригинале есть часовой пояс, но в переводе он отсутствует." },
  { type: "TIMEZONE_EXTRA", pool: "Dates & Time", severity: "Minor", en: "Target adds a timezone that is not present in the source.", ru: "В переводе добавлен часовой пояс, которого нет в оригинале." },
  { type: "TIMEZONE_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target uses an incorrect GMT offset for the selected locale or the local time was not converted.", ru: "В переводе неверное смещение GMT для выбранного профиля или местное время не пересчитано." },
  { type: "TIMEZONE_OFFSET_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target timezone offset differs from the GMT table.", ru: "Смещение часового пояса в переводе не соответствует таблице GMT." },
  { type: "TIMEZONE_LABEL_MISMATCH", pool: "Dates & Time", severity: "Major", en: "The target timezone marker differs from the GMT table.", ru: "Маркер часового пояса в переводе не соответствует таблице GMT." },
  { type: "TIMEZONE_FORMAT", pool: "Dates & Time", severity: "Minor", en: "The timezone marker contains a space or non-standard sign; use its exact spelling from the GMT table.", ru: "Маркер часового пояса написан с лишним пробелом или нестандартным знаком; используйте точную запись из таблицы GMT." },
  { type: "INVALID_DATE", pool: "Dates & Time", severity: "Major", en: "A calendar date, clock time, or GMT offset is invalid in the source or target.", ru: "В оригинале или переводе некорректны календарная дата, время или смещение GMT." },
  { type: "DATE_FORMAT", pool: "Dates & Time", severity: "Minor", en: "Numeric date format does not follow the selected language profile.", ru: "Числовая дата не соответствует формату выбранного языка." },
  { type: "TIME_FORMAT", pool: "Dates & Time", severity: "Minor", en: "A time with a timezone needs a two-digit hour in this language profile.", ru: "Время с указанием часового пояса в этом профиле требует двузначного часа." },
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
  try { return localStorage.getItem("translation-qa-locale") === "ru" ? "ru" : "en"; }
  catch { return "en"; }
}

export function setLocale(locale) {
  const next = INTERFACE_LOCALES.includes(locale) ? locale : "en";
  try { localStorage.setItem("translation-qa-locale", next); } catch { /* File URLs may disable persistent storage. */ }
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
  if (issue.format) {
    const { expected, actual } = issue.format;
    return locale === "ru" ? `Формат даты: ожидается ${expected}, найдено «${actual}».` : `Date format: expected ${expected}; found “${actual}”.`;
  }
  if (issue.timezone) {
    const { expected, actual } = issue.timezone;
    const detail = locale === "ru" ? `Ожидается «${expected}», найдено «${actual}».` : `Expected “${expected}”; found “${actual}”.`;
    return `${catalogEntry(issue.error_type)?.[locale] ?? issue.explanation ?? ""} ${detail}`;
  }
  if (issue.error_type === "GLOSSARY_CASE_MISMATCH" && issue.glossary) {
    const expected = issue.glossary.expectedTerms.join(" / ");
    return locale === "ru"
      ? `Регистр перевода отличается: найдено «${issue.glossary.actualTerm}», в словаре «${expected}» (строка ${issue.glossary.rows.join(", ")}).`
      : `Translation case differs: found “${issue.glossary.actualTerm}”, glossary expects “${expected}” (row ${issue.glossary.rows.join(", ")}).`;
  }
  if (issue.glossary) {
    const expected = issue.glossary.expectedTerms.join(" / ");
    return locale === "ru"
      ? `В оригинале «${issue.glossary.sourceTerm}». В соответствующем фрагменте перевода ожидается «${expected}» (строка словаря ${issue.glossary.rows.join(", ")}).`
      : `Source term “${issue.glossary.sourceTerm}” is present. Expected “${expected}” in the matching target passage (glossary row ${issue.glossary.rows.join(", ")}).`;
  }
  const entry = catalogEntry(issue.error_type);
  return entry?.[locale] ?? entry?.en ?? issue.explanation ?? "";
}
