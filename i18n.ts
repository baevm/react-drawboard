import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enJSON from './src/locales/en-US.json'
import ruJSON from './src/locales/ru-RU.json'

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    // Translations files
    resources: {
      en: { ...enJSON },
      ru: { ...ruJSON },
    },

    debug: true,

    // Set the fallback language of the App

    fallbackLng: 'en',
    lng: window.localStorage.getItem('i18nextLng') || 'en-US',

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Enable caching in local storage
    },

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
