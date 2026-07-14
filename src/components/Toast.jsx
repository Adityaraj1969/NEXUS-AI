import {  useState, useEffect  } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/**
 * @fileoverview Toast notification component for system-wide alerts.
 * @module components/Toast
 */

const TYPE_CONFIG = {
  success: { bg: 'bg-emerald-900/90 border-emerald-500/30', Icon: CheckCircle, color: 'text-emerald-400' },
  warning: { bg: 'bg-amber-900/90 border-amber-500/30', Icon: AlertTriangle, color: 'text-amber-400' },
  error: { bg: 'bg-red-900/90 border-red-500/30', Icon: XCircle, color: 'text-red-400' },
  info: { bg: 'bg-sky-900/90 border-sky-500/30', Icon: Info, color: 'text-sky-400' },
};

/**
 * Toast notification rendered at bottom-right with auto-dismiss.
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {'success'|'warning'|'error'|'info'} [props.type='info']
 * @param {Function} [props.onDismiss] - Dismiss callback
 * @param {number} [props.duration=5000] - Auto-dismiss duration in ms
 * @returns {JSX.Element|null}
 */
export default function Toast({ message, type = 'info', onDismiss, duration = 5000, index = 0 }) {
  const [visible, setVisible] = useState(true);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const { Icon } = config;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ bottom: `${1.5 + index * 4.5}rem` }}
      className={`fixed right-6 z-[9999] flex max-w-sm items-center gap-3
        rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm transition-all duration-300
        ${config.bg} ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${config.color}`} aria-hidden="true" />
      <p className="flex-1 text-sm text-nexus-text-primary">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss?.(), 300); }}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-lg p-1 text-nexus-text-secondary transition-colors hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
