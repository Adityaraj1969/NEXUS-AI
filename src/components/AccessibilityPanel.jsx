import { Contrast, Type, MonitorOff, AudioLines, RotateCcw } from 'lucide-react';

/**
 * @fileoverview Accessibility settings panel with toggle switches.
 * @module components/AccessibilityPanel
 */

const SETTINGS = [
  { key: 'highContrast', label: 'High Contrast', description: 'Increase color contrast for better visibility', icon: Contrast },
  { key: 'largeText', label: 'Large Text', description: 'Increase text size across the interface', icon: Type },
  { key: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations and transitions', icon: MonitorOff },
  { key: 'screenReaderMode', label: 'Screen Reader Mode', description: 'Optimize for assistive technologies', icon: AudioLines },
];

/**
 * Accessibility preferences panel with toggle switches.
 *
 * @param {Object} props
 * @param {Object} props.preferences - Current preferences object
 * @param {Function} props.onToggle - Toggle callback (key) => void
 * @param {Function} props.onReset - Reset all preferences
 * @returns {JSX.Element}
 */
export default function AccessibilityPanel({ preferences = {}, onToggle, onReset }) {
  return (
    <div className="space-y-4" role="region" aria-label="Accessibility settings">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-nexus-text-primary">
          Accessibility Settings
        </h3>
        <button
          onClick={onReset}
          aria-label="Reset all accessibility settings"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs
            text-nexus-text-secondary transition-colors hover:bg-white/5 hover:text-nexus-text-primary"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {SETTINGS.map(({ key, label, description, icon: Icon }) => {
          const isOn = Boolean(preferences[key]);
          return (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-nexus-border bg-white/[0.02] p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nexus-primary/10">
                <Icon className="h-4 w-4 text-nexus-secondary" aria-hidden="true" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-nexus-text-primary">{label}</p>
                <p className="text-xs text-nexus-text-secondary">{description}</p>
              </div>

              {/* Toggle Switch */}
              <button
                role="switch"
                aria-checked={isOn}
                aria-label={`${label}: ${isOn ? 'on' : 'off'}`}
                onClick={() => onToggle?.(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
                  rounded-full transition-colors duration-200 focus-visible:ring-2
                  focus-visible:ring-nexus-secondary ${
                    isOn ? 'bg-nexus-primary' : 'bg-gray-600'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
                    transition-transform duration-200 ${
                      isOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
