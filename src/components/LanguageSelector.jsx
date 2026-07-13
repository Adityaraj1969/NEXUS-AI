import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

/**
 * @fileoverview Language selector dropdown for 7 FIFA languages.
 * @module components/LanguageSelector
 */

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
];

/**
 * Language selector with 7 FIFA languages and RTL indicator.
 * @param {Object} props
 * @param {string} [props.value='en'] - Current language code
 * @param {Function} [props.onChange] - Language change callback
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
export default function LanguageSelector({ value = 'en', onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === value) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {setOpen(false);}
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}`}
        className="flex items-center gap-2 rounded-lg border border-nexus-border bg-white/5
          px-3 py-2 text-sm text-nexus-text-primary transition-colors hover:bg-white/10"
      >
        <Globe className="h-4 w-4 text-nexus-text-secondary" aria-hidden="true" />
        <span>{current.flag} {current.native}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-nexus-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border
            border-nexus-border bg-[#111827] py-1 shadow-2xl"
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === value}
              tabIndex={0}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm
                transition-colors hover:bg-white/5
                ${lang.code === value ? 'bg-nexus-primary/10 text-nexus-secondary' : 'text-nexus-text-secondary'}`}
              onClick={() => { onChange?.(lang.code); setOpen(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { onChange?.(lang.code); setOpen(false); } }}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1">{lang.native}</span>
              {lang.rtl && (
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                  RTL
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
