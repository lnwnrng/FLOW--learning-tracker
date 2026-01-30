import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import zh from './zh';

export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'flow.language';

export function normalizeLanguage(language?: string): SupportedLanguage {
  if (!language) return DEFAULT_LANGUAGE;
  const normalized = language.toLowerCase();
  const base = normalized.split('-')[0];
  const direct = SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)
    ? (normalized as SupportedLanguage)
    : (base as SupportedLanguage);
  return SUPPORTED_LANGUAGES.includes(direct) ? direct : DEFAULT_LANGUAGE;
}

export function languageToLocale(language: SupportedLanguage): string {
  return language === 'zh' ? 'zh-CN' : 'en-US';
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return normalizeLanguage(stored ?? undefined);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures (e.g. privacy mode).
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
  returnEmptyString: false,
  react: { useSuspense: false },
});

export default i18n;
