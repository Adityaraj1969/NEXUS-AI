import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Globe, Eye, Wifi, WifiOff, Clock } from 'lucide-react';
import { geminiClient } from '../services/gemini';

/**
 * @fileoverview Top header bar for NEXUS AI platform.
 * Shows module title, clock, language selector, accessibility toggle,
 * notification bell, and AI mode badge.
 * @module components/Header
 */

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/navigator': 'Stadium Navigator',
  '/crowd': 'Crowd Intelligence',
  '/concierge': 'AI Concierge',
  '/transport': 'Transport Hub',
  '/sustainability': 'Sustainability',
  '/accessibility': 'Accessibility Center',
  '/operations': 'Operations Center',
};

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

/**
 * Top header bar with dynamic module title, clock, language selector,
 * accessibility toggle, notifications, and AI mode indicator.
 *
 * @param {Object} props
 * @param {string} [props.language='en'] - Current language code
 * @param {Function} [props.onLanguageChange] - Language change callback
 * @param {Function} [props.onToggleA11y] - Accessibility panel toggle
 * @param {number} [props.notificationCount=0] - Unread notification count
 * @returns {JSX.Element}
 */
export default function Header({
  language = 'en',
  onLanguageChange,
  onToggleA11y,
  notificationCount = 3,
}) {
  const location = useLocation();
  const [clock, setClock] = useState('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const isLive = geminiClient.isLiveMode;
  const title = ROUTE_TITLES[location.pathname] || 'NEXUS AI';
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b
        border-nexus-border bg-[#0d1117]/80 px-6 backdrop-blur-xl"
    >
      {/* Module Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-nexus-text-primary">
          {title}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div
          className="hidden items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5
            text-xs text-nexus-text-secondary sm:flex"
          aria-live="polite"
          aria-label={`Current time: ${clock}`}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-mono">{clock}</span>
        </div>

        {/* AI Mode Badge */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('nexus-toast', { 
              detail: { message: `AI Mode switched to ${isLive ? 'Simulation' : 'Live'}`, type: 'success' } 
            }));
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
            isLive
              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
          }`}
          role="status"
          aria-label={`AI Mode: ${isLive ? 'Live' : 'Simulation'}`}
        >
          {isLive ? (
            <Wifi className="h-3 w-3" aria-hidden="true" />
          ) : (
            <WifiOff className="h-3 w-3" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{isLive ? 'Live' : 'Sim'}</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            aria-haspopup="listbox"
            aria-expanded={showLangDropdown}
            aria-label={`Language: ${currentLang.label}`}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm
              text-nexus-text-secondary transition-colors hover:bg-white/5 hover:text-nexus-text-primary"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{currentLang.flag}</span>
          </button>

          {showLangDropdown && (
            <ul
              role="listbox"
              aria-label="Select language"
              className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border
                border-nexus-border bg-[#0d1117] py-1 shadow-xl"
            >
              {LANGUAGES.map((lang) => (
                <li key={lang.code} role="presentation">
                  <button
                    role="option"
                    aria-selected={lang.code === language}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left
                      transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:bg-white/10
                      ${lang.code === language ? 'text-nexus-secondary' : 'text-nexus-text-secondary'}`}
                    onClick={() => {
                      onLanguageChange?.(lang.code);
                      setShowLangDropdown(false);
                      window.dispatchEvent(new CustomEvent('nexus-toast', { 
                        detail: { message: `Language changed to ${lang.label}`, type: 'info' } 
                      }));
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === 'ar' && (
                      <span className="ml-auto text-[10px] text-nexus-text-secondary">RTL</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Accessibility Toggle */}
        <button
          onClick={() => {
            onToggleA11y?.();
            window.dispatchEvent(new CustomEvent('nexus-toast', { 
              detail: { message: 'High visibility mode toggled', type: 'info' } 
            }));
          }}
          aria-label="Toggle accessibility settings"
          className="rounded-lg p-2 text-nexus-text-secondary transition-colors
            hover:bg-white/5 hover:text-nexus-text-primary"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('nexus-toast', { 
              detail: { message: `You have ${notificationCount} unread system notifications.`, type: 'info' } 
            }));
          }}
          aria-label={`Notifications: ${notificationCount} unread`}
          className="relative rounded-lg p-2 text-nexus-text-secondary
            transition-colors hover:bg-white/5 hover:text-nexus-text-primary"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center
                justify-center rounded-full bg-nexus-danger text-[10px] font-bold text-white"
              aria-hidden="true"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
