import {  useState, useEffect , useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

/**
 * @fileoverview Animated KPI metric card with sparkline chart.
 * @module components/MetricCard
 */

/**
 * Animated metric card showing a KPI value with trend indicator
 * and mini sparkline chart.
 *
 * @param {Object} props
 * @param {string} props.title - Metric label
 * @param {number} props.value - Current metric value
 * @param {string} [props.unit=''] - Value unit (%, MWh, etc.)
 * @param {number} [props.change=0] - Percentage change (positive = up)
 * @param {import('lucide-react').LucideIcon} [props.icon] - Lucide icon
 * @param {string} [props.color='#6C3CE1'] - Accent color
 * @param {Array<number>} [props.sparkData] - Last 10 data points for sparkline
 * @returns {JSX.Element}
 */
export default function MetricCard({
  title,
  value,
  unit = '',
  change = 0,
  icon: Icon,
  color = '#6C3CE1',
  sparkData,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const isPositive = change >= 0;

  // Animated counter effect
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out curve
      const progress = 1 - Math.pow(1 - step / steps, 3);
      current = Math.round(value * progress);
      setDisplayValue(current);

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  // Generate default sparkline data if not provided
  const chartData = (sparkData || Array.from({ length: 10 }, () =>
    Math.round(value * (0.8 + Math.random() * 0.4))
  )).map((v, i) => ({ idx: i, val: v }));

  return (
    <div
      role="region"
      aria-label={`${title}: ${value}${unit}`}
      className="glass group rounded-2xl p-5 transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-lg"
      style={{ '--card-accent': color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-nexus-text-secondary">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className="text-3xl font-bold text-nexus-text-primary"
              aria-live="polite"
            >
              {displayValue.toLocaleString()}
            </span>
            {unit && (
              <span className="text-sm text-nexus-text-secondary">{unit}</span>
            )}
          </div>

          {/* Trend */}
          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            )}
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        </div>

        {/* Icon & Sparkline */}
        <div className="flex flex-col items-end gap-2">
          {Icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
            </div>
          )}

          {/* Sparkline */}
          <div className="h-8 w-20" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
