import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import da from '../locales/da.json';

const LANGUAGE_KEY = 'medicsync-language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    da: { translation: da },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export async function loadSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'da') {
      await i18n.changeLanguage(saved);
    }
  } catch {}
}

export function setLanguage(lang: 'en' | 'da') {
  i18n.changeLanguage(lang);
  AsyncStorage.setItem(LANGUAGE_KEY, lang).catch(() => {});
}

export default i18n;
