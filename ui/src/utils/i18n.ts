import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import translationEn from "@src/json/lang/en.json";
import translationAr from "@src/json/lang/ar.json";

const resources = {
  en: { translation: translationEn },
  ar: { translation: translationAr },
};

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    // lng: localStorage.getItem("I18N_LANGUAGE") || "en",
    fallbackLng: "en",
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });
export default i18n;
