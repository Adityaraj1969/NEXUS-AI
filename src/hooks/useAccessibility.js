import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * @fileoverview React hook for managing WCAG 2.1 AA accessibility preferences.
 * Persists choices to localStorage and applies CSS classes / attributes
 * to `document.documentElement` so global styles can respond.
 * @module hooks/useAccessibility
 */

/** localStorage key for persisted preferences */
const STORAGE_KEY = 'nexus-accessibility-prefs';

/**
 * Default accessibility preference values.
 * @type {Object}
 */
const DEFAULT_PREFERENCES = Object.freeze({
  /** Enable WCAG AAA contrast mode */
  highContrast: false,
  /** Scale text to 125 % base size */
  largeText: false,
  /** Disable animations / transitions */
  reducedMotion: false,
  /** Optimize layout for screen readers (extra ARIA live regions, simplified DOM) */
  screenReaderMode: false,
});

/**
 * CSS class mapping — each preference key maps to a class applied
 * on `<html>` when the preference is enabled.
 * @type {Object<string, string>}
 */
const CSS_CLASS_MAP = Object.freeze({
  highContrast: 'nexus-high-contrast',
  largeText: 'nexus-large-text',
  reducedMotion: 'nexus-reduced-motion',
  screenReaderMode: 'nexus-sr-mode',
});

/**
 * Load saved preferences from localStorage, merging with defaults.
 * @returns {Object} Merged preferences
 * @private
 */
function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {
    // Corrupted data — reset silently
    localStorage.removeItem(STORAGE_KEY);
  }
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Persist preferences to localStorage.
 * @param {Object} prefs — Preferences object
 * @private
 */
function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or unavailable — degrade gracefully
    console.warn('[NEXUS A11y] Could not save preferences to localStorage.');
  }
}

/**
 * Apply / remove CSS classes on documentElement to reflect current prefs.
 * @param {Object} prefs — Current preferences
 * @private
 */
function applyClasses(prefs) {
  const root = document.documentElement;
  Object.entries(CSS_CLASS_MAP).forEach(([key, className]) => {
    if (prefs[key]) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }
  });

  // Set data attribute for CSS-based queries
  root.setAttribute('data-nexus-a11y', JSON.stringify(prefs));
}

/**
 * Hook for managing accessibility preferences.
 *
 * Persists user choices to `localStorage`, applies CSS classes to the
 * document root, and respects the OS-level `prefers-reduced-motion` query.
 *
 * @returns {{
 *   preferences: Object,
 *   togglePreference: (key: string) => void,
 *   setPreference: (key: string, value: boolean) => void,
 *   resetPreferences: () => void,
 * }}
 *
 * @example
 * ```jsx
 * const { preferences, togglePreference } = useAccessibility();
 * <button onClick={() => togglePreference('highContrast')}>
 *   {preferences.highContrast ? 'Disable' : 'Enable'} High Contrast
 * </button>
 * ```
 */
export function useAccessibility() {
  const [preferences, setPreferences] = useState(loadPreferences);

  // Detect OS-level reduced-motion preference on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    /** Sync OS setting into our state (only if user hasn't explicitly set it) */
    const handleChange = (e) => {
      setPreferences((prev) => {
        // Only auto-set if the user hasn't manually toggled it before
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.reducedMotion === 'boolean') return prev;
        }
        return { ...prev, reducedMotion: e.matches };
      });
    };

    // Set initial value from OS on first load
    if (mq.matches && !localStorage.getItem(STORAGE_KEY)) {
      setPreferences((prev) => ({ ...prev, reducedMotion: true }));
    }

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Persist and apply whenever preferences change
  useEffect(() => {
    savePreferences(preferences);
    applyClasses(preferences);
  }, [preferences]);

  /**
   * Toggle a single preference on/off.
   * @param {string} key — Preference key
   */
  const togglePreference = useCallback((key) => {
    if (!(key in DEFAULT_PREFERENCES)) {
      console.warn(`[NEXUS A11y] Unknown preference key: "${key}"`);
      return;
    }
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /**
   * Set a preference to a specific boolean value.
   * @param {string} key — Preference key
   * @param {boolean} value — New value
   */
  const setPreference = useCallback((key, value) => {
    if (!(key in DEFAULT_PREFERENCES)) {
      console.warn(`[NEXUS A11y] Unknown preference key: "${key}"`);
      return;
    }
    setPreferences((prev) => ({ ...prev, [key]: Boolean(value) }));
  }, []);

  /**
   * Reset all preferences to defaults and clear localStorage.
   */
  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /** Stable return object */
  const api = useMemo(
    () => ({ preferences, togglePreference, setPreference, resetPreferences }),
    [preferences, togglePreference, setPreference, resetPreferences]
  );

  return api;
}
