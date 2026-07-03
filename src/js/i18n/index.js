/**
 * i18n engine
 * ------------
 * Loads a locale JSON, resolves dotted keys via t(), and manages document
 * direction. Adding a language later = drop a new file in locales/ and call
 * loadLocale('en'). All UI strings live in the locale files, never in code.
 */

let dict = {};
let lang = "fa";

const RTL_LANGS = ["fa", "ar", "he", "ur"];

/** Load and activate a locale. */
export async function loadLocale(next = "fa") {
  const res = await fetch(`./src/js/i18n/locales/${next}.json`);
  if (!res.ok) throw new Error(`Locale "${next}" could not be loaded`);
  dict = await res.json();
  lang = next;
  document.documentElement.lang = lang;
  document.documentElement.dir = getDir();
  return dict;
}

export function getLang() {
  return lang;
}

export function getDir() {
  return RTL_LANGS.includes(lang) ? "rtl" : "ltr";
}

/**
 * Translate a dotted key path, e.g. t("home.startTest").
 * Returns arrays/objects untouched (useful for lists like home.steps).
 * Falls back to the given fallback, then to the key itself.
 */
export function t(path, fallback) {
  const value = path
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), dict);
  if (value == null) return fallback != null ? fallback : path;
  return value;
}
