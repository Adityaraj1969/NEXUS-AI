import { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Supported FIFA World Cup 2026 languages with metadata.
 * @type {Array<{code: string, name: string, nativeName: string, flag: string, rtl: boolean}>}
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
];

const LanguageContext = createContext(null);

/**
 * Provider component for language/i18n context across the NEXUS AI platform.
 * Manages the current language, direction (LTR/RTL), and language switching.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0]);

  const switchLanguage = useCallback((langCode) => {
    const lang = LANGUAGES.find((l) => l.code === langCode);
    if (lang) {
      setCurrentLanguage(lang);
      document.documentElement.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang.code);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentLanguage,
      switchLanguage,
      languages: LANGUAGES,
      isRtl: currentLanguage.rtl,
    }),
    [currentLanguage, switchLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the language context.
 * @returns {{ currentLanguage: object, switchLanguage: function, languages: Array, isRtl: boolean }}
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
