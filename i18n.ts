import i18n from 'i18next'
import { useTranslation, initReactI18next } from 'react-i18next'
import ruJSON from './src/locales/ru-RU.json'
import enJSON from './src/locales/en-US.json'

i18n.use(initReactI18next).init({
  // Translations files
  resources: {
    en: { ...enJSON },
    ru: { ...ruJSON },
  },

  // Set the initial language of the App
  lng: 'en',

  interpolation: {
    escapeValue: false,
  },
})

export default i18n
