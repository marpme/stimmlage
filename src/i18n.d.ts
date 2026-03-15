import type deTranslation from "../public/locales/de/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof deTranslation;
    };
  }
}
