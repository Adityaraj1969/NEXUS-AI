import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

/** @type {string} LocalStorage key for persisting accessibility preferences */
const STORAGE_KEY = 'nexus-accessibility-preferences';

/** @type {object} Default accessibility preferences */
const DEFAULT_PREFERENCES = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
};

const AccessibilityContext = createContext(null);

/**
 * Loads persisted accessibility preferences from localStorage.
 * Falls back to defaults if nothing is stored or parsing fails.
 * @returns {object} The accessibility preferences
 */
function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors, use defaults
  }
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Provider component for accessibility settings across the NEXUS AI platform.
 * Manages high contrast, large text, reduced motion, and screen reader preferences.
 * Persists preferences to localStorage and applies CSS classes to document root.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export function AccessibilityProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);

  // Apply preferences to document root as CSS classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('large-text', preferences.largeText);
    root.classList.toggle('reduced-motion', preferences.reducedMotion);
    root.classList.toggle('screen-reader-mode', preferences.screenReaderMode);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage might be full or unavailable
    }
  }, [preferences]);

  const togglePreference = useCallback((key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES });
  }, []);

  const value = useMemo(
    () => ({
      ...preferences,
      togglePreference,
      resetPreferences,
    }),
    [preferences, togglePreference, resetPreferences]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access the accessibility context.
 * @returns {object} Accessibility preferences and toggle functions
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export default AccessibilityContext;
