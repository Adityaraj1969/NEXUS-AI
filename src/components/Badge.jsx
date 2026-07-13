/**
 * @fileoverview Status badge component with color variants and pulse animation.
 * @module components/Badge
 */

const VARIANT_STYLES = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  default: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

/**
 * Status badge with color variants and optional pulse animation.
 * @param {Object} props
 * @param {string} props.label - Badge text
 * @param {'success'|'warning'|'danger'|'info'|'default'} [props.variant='default']
 * @param {boolean} [props.pulse=false] - Enable pulse animation
 * @returns {JSX.Element}
 */
export default function Badge({ label, variant = 'default', pulse = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5
        text-xs font-medium ${VARIANT_STYLES[variant] || VARIANT_STYLES.default}`}
    >
      {pulse && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === 'danger' ? 'bg-red-400' :
            variant === 'warning' ? 'bg-amber-400' :
            variant === 'success' ? 'bg-emerald-400' : 'bg-sky-400'
          } animate-pulse`}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
