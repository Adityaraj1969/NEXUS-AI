import { useEffect } from 'react';
import { AlertTriangle, Info, XCircle, X } from 'lucide-react';

/**
 * @fileoverview Priority alert banner with auto-dismiss and severity styles.
 * @module components/AlertBanner
 */

const SEVERITY_CONFIG = {
  info: { bg: 'bg-sky-500/15 border-sky-500/30', text: 'text-sky-400', Icon: Info },
  warning: { bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-400', Icon: AlertTriangle },
  critical: { bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-400', Icon: XCircle },
};

/**
 * Priority alert banner with severity styling and auto-dismiss.
 * @param {Object} props
 * @param {string} props.message - Alert message
 * @param {'info'|'warning'|'critical'} [props.severity='info']
 * @param {Function} [props.onDismiss] - Dismiss callback
 * @param {number} [props.autoDismiss] - Auto-dismiss delay in ms
 * @returns {JSX.Element}
 */
export default function AlertBanner({ message, severity = 'info', onDismiss, autoDismiss }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const { Icon } = config;

  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  return (
    <div
      role="alert"
      aria-live={severity === 'critical' ? 'assertive' : 'polite'}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3
        animate-slide-in ${config.bg}`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${config.text}`} aria-hidden="true" />
      <p className={`flex-1 text-sm ${config.text}`}>{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-white/10 ${config.text}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
