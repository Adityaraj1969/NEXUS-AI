/**
 * @fileoverview Glassmorphism card component with configurable glow.
 * @module components/GlassCard
 */

/**
 * Reusable glassmorphism card with optional icon, title, glow effect,
 * and hover interaction.
 *
 * @param {Object} props
 * @param {string} [props.title] - Card title
 * @param {string} [props.subtitle] - Card subtitle
 * @param {import('lucide-react').LucideIcon} [props.icon] - Lucide icon component
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {'purple'|'teal'|'gold'|'none'} [props.glowColor='none'] - Glow color
 * @param {Function} [props.onClick] - Click handler
 * @returns {JSX.Element}
 */
export default function GlassCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = '',
  glowColor = 'none',
  onClick,
}) {
  const glowClasses = {
    purple: 'shadow-[0_0_20px_rgba(108,60,225,0.15)] hover:shadow-[0_0_30px_rgba(108,60,225,0.25)]',
    teal: 'shadow-[0_0_20px_rgba(10,239,184,0.15)] hover:shadow-[0_0_30px_rgba(10,239,184,0.25)]',
    gold: 'shadow-[0_0_20px_rgba(245,166,35,0.15)] hover:shadow-[0_0_30px_rgba(245,166,35,0.25)]',
    none: '',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      role={onClick ? undefined : 'region'}
      aria-label={title || 'Content card'}
      onClick={onClick}
      className={`glass rounded-2xl p-5 transition-all duration-300
        hover:-translate-y-0.5 ${glowClasses[glowColor] || ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {(title || Icon) && (
        <div className="mb-3 flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nexus-primary/15">
              <Icon className="h-5 w-5 text-nexus-secondary" aria-hidden="true" />
            </div>
          )}
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-nexus-text-primary">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-nexus-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </Component>
  );
}
