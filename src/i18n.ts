import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const SUPPORTED_LANGUAGES = ["de", "en", "es", "fr", "pl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "gelection_lang";

function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
    return stored;
  }
  const nav = navigator.language.split("-")[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(nav as SupportedLanguage)) {
    return nav;
  }
  return "de";
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: detectLanguage(),
    fallbackLng: "de",
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
