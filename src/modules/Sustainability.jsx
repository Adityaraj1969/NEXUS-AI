import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Leaf, Zap, Droplets, Recycle, Wind, Sun, Thermometer,
  TrendingDown, TrendingUp, Award, RefreshCw, Loader2,
  Battery, Lightbulb, TreePine, Globe, Users, Star
} from 'lucide-react';

/** ─── CONSTANTS ─── */
const ENERGY_CHART_HOURS = 24;

/** Generate 24h energy consumption data */
function generateEnergyData() {
  return Array.from({ length: ENERGY_CHART_HOURS }, (_, i) => {
    const hour = `${String(i).padStart(2, '0')}:00`;
    const base = i >= 6 && i <= 22 ? 3.2 + Math.random() * 2.8 : 1.5 + Math.random() * 1.0;
    return {
      time: hour,
      consumption: parseFloat(base.toFixed(1)),
      solar: parseFloat((Math.max(0, Math.sin((i - 6) / 16 * Math.PI) * 1.8) + Math.random() * 0.3).toFixed(1)),
      baseline: parseFloat((3.5 + Math.random() * 0.3).toFixed(1)),
    };
  });
}

const WASTE_DATA = [
  { name: 'Recyclable', value: 42, fill: '#2dd4bf' },
  { name: 'Compostable', value: 28, fill: '#a855f7' },
  { name: 'Landfill', value: 18, fill: '#6b7280' },
  { name: 'Hazardous', value: 2, fill: '#ef4444' },
  { name: 'E-Waste', value: 10, fill: '#f59e0b' },
];

/** Generate water usage trend data */
function generateWaterData() {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i + 8).padStart(2, '0')}:00`,
    usage: parseFloat((120 + Math.random() * 80 + (i > 4 && i < 10 ? 60 : 0)).toFixed(0)),
    recycled: parseFloat((30 + Math.random() * 25).toFixed(0)),
    target: 160,
  }));
}

const AI_SUSTAINABILITY_INSIGHTS = [
  {
    id: 1,
    title: 'HVAC Optimization',
    insight: 'Ambient temperature dropping to 68°F by 9 PM. Recommend lowering AC in zones 4-6 to save an estimated 12% energy (0.7 MWh).',
    impact: 'Save 0.7 MWh',
    category: 'energy',
    icon: Thermometer,
    priority: 'high',
  },
  {
    id: 2,
    title: 'Solar Peak Utilization',
    insight: 'Solar panels operating at 94% efficiency. Redirect surplus 0.3 MWh to battery storage for post-sunset LED operations.',
    impact: 'Store 0.3 MWh',
    category: 'energy',
    icon: Sun,
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Waste Stream Alert',
    insight: 'Recyclable contamination rate in Concourse B bins has risen to 18%. Deploy sorting volunteers to reduce landfill diversion by 8%.',
    impact: '-8% landfill',
    category: 'waste',
    icon: Recycle,
    priority: 'high',
  },
  {
    id: 4,
    title: 'Water Conservation',
    insight: 'Restroom sensor data shows 15% above-average flush volume in South Wing. Inspect Flow valves — potential 2,400L daily savings.',
    impact: 'Save 2,400L/day',
    category: 'water',
    icon: Droplets,
    priority: 'medium',
  },
  {
    id: 5,
    title: 'Crowd-Based Lighting',
    insight: 'East Wing concourse is at 34% capacity. Dim lighting to 60% in low-traffic sections to save 0.4 MWh over the next 2 hours.',
    impact: 'Save 0.4 MWh',
    category: 'energy',
    icon: Lightbulb,
    priority: 'low',
  },
];

const FAN_LEADERBOARD = [
  { rank: 1, name: 'Maria G.', country: '🇧🇷', score: 2840, badge: 'Eco Champion', actions: 'Used transit, recycled 12 items, refillable bottle' },
  { rank: 2, name: 'James L.', country: '🇺🇸', score: 2650, badge: 'Green Star', actions: 'Walked to venue, composted food waste' },
  { rank: 3, name: 'Yuki T.', country: '🇯🇵', score: 2410, badge: 'Carbon Saver', actions: 'Metro, used digital ticket, zero waste' },
  { rank: 4, name: 'Ahmed K.', country: '🇸🇦', score: 2280, badge: 'Water Hero', actions: 'Refillable bottle, shared ride' },
  { rank: 5, name: 'Sophie M.', country: '🇫🇷', score: 2150, badge: 'Eco Warrior', actions: 'Transit, recycled, volunteered cleanup' },
];

/**
 * GlassCard — glassmorphism container
 * @param {{ children: React.ReactNode, className?: string, role?: string, ariaLabel?: string }} props
 */
function GlassCard({ children, className = '', role, ariaLabel }) {
  return (
    <div role={role} aria-label={ariaLabel}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/10 p-5 ${className}`}>
      {children}
    </div>
  );
}

/**
 * MetricCard — sustainability KPI display
 * @param {{ title: string, value: string, icon: React.ElementType, trend?: number, color?: string, unit?: string }} props
 */
function MetricCard({ title, value, icon: Icon, trend, color = 'text-emerald-400', unit = '' }) {
  const isPositive = trend <= 0; // For sustainability, decreasing is good
  const TrendIcon = trend <= 0 ? TrendingDown : TrendingUp;
  return (
    <GlassCard role="status" ariaLabel={`${title}: ${value}${unit}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}<span className="ml-1 text-sm font-normal text-gray-500">{unit}</span></p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              <span>{Math.abs(trend)}% vs last event</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl bg-white/5 p-2.5 ${color}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </GlassCard>
  );
}

/**
 * Sustainability — environmental sustainability dashboard for FIFA World Cup 2026
 * Features: KPI metrics, energy chart, waste breakdown, AI recommendations,
 * water usage trend, and fan sustainability leaderboard.
 * @returns {JSX.Element}
 */
export default function Sustainability() {
  const [energyData] = useState(generateEnergyData);
  const [waterData] = useState(generateWaterData);
  const [insights, setInsights] = useState(AI_SUSTAINABILITY_INSIGHTS.slice(0, 3));
  const [insightLoading, setInsightLoading] = useState(false);
  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches, []);

  const totalEnergy = useMemo(() => energyData.reduce((s, d) => s + d.consumption, 0).toFixed(1), [energyData]);
  const totalSolar = useMemo(() => energyData.reduce((s, d) => s + d.solar, 0).toFixed(1), [energyData]);
  const wasteTotal = useMemo(() => WASTE_DATA.reduce((s, d) => s + d.value, 0), []);
  const diversionRate = useMemo(() => {
    const diverted = WASTE_DATA.filter(d => d.name !== 'Landfill' && d.name !== 'Hazardous').reduce((s, d) => s + d.value, 0);
    return Math.round((diverted / wasteTotal) * 100);
  }, [wasteTotal]);

  /** Refresh AI insights */
  const handleRefreshInsights = useCallback(() => {
    setInsightLoading(true);
    setTimeout(() => {
      // Rotate insights
      setInsights(prev => {
        const allInsights = AI_SUSTAINABILITY_INSIGHTS;
        const nextStart = (allInsights.indexOf(prev[0]) + 1) % allInsights.length;
        return [
          allInsights[nextStart % allInsights.length],
          allInsights[(nextStart + 1) % allInsights.length],
          allInsights[(nextStart + 2) % allInsights.length],
        ];
      });
      setInsightLoading(false);
    }, 1500);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-emerald-950/20 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="Sustainability Dashboard">
      {/* Header */}
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <Leaf className="h-8 w-8 text-emerald-400" aria-hidden="true" />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Sustainability</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Environmental impact tracking — FIFA World Cup 2026 Green Initiative</p>
      </header>

      {/* KPI Metrics */}
      <section aria-label="Sustainability KPIs" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard title="Carbon Footprint" value="124.8" unit="t CO₂" icon={Wind} trend={-8.3} color="text-emerald-400" />
        <MetricCard title="Energy Usage" value={totalEnergy} unit="MWh" icon={Zap} trend={-5.1} color="text-amber-400" />
        <MetricCard title="Waste Diversion Rate" value={`${diversionRate}`} unit="%" icon={Recycle} trend={-12.4} color="text-teal-400" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Energy Consumption Chart */}
          <GlassCard role="img" ariaLabel="24-hour energy consumption chart">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
                <Battery className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
                Energy Consumption (24h)
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <Sun className="h-3 w-3 text-amber-400" aria-hidden="true" />
                Solar generated: {totalSolar} MWh
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={energyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} interval={3} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${v}MW`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area type="monotone" dataKey="consumption" stroke="#f59e0b" strokeWidth={2} fill="url(#energyGradient)" name="Grid Usage" animationDuration={prefersReducedMotion ? 0 : 800} />
                <Area type="monotone" dataKey="solar" stroke="#2dd4bf" strokeWidth={2} fill="url(#solarGradient)" name="Solar" animationDuration={prefersReducedMotion ? 0 : 800} />
                <Line type="monotone" dataKey="baseline" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Baseline" animationDuration={prefersReducedMotion ? 0 : 800} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Waste Breakdown + Water Usage */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Waste Pie Chart */}
            <GlassCard role="img" ariaLabel="Waste breakdown by category">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
                <Recycle className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
                Waste Breakdown
              </h2>
              <div className="mx-auto h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={WASTE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value"
                      animationDuration={prefersReducedMotion ? 0 : 800}>
                      {WASTE_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.8} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                      formatter={(val) => [`${val} tonnes`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                {WASTE_DATA.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    {d.name} ({d.value}t)
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Water Usage Chart */}
            <GlassCard role="img" ariaLabel="Water usage trend">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-300">
                <Droplets className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
                Water Usage
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={waterData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${v}kL`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                  />
                  <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} dot={false} name="Usage (kL)" animationDuration={prefersReducedMotion ? 0 : 800} />
                  <Line type="monotone" dataKey="recycled" stroke="#2dd4bf" strokeWidth={2} dot={false} name="Recycled (kL)" animationDuration={prefersReducedMotion ? 0 : 800} />
                  <Line type="monotone" dataKey="target" stroke="#6b7280" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Target" animationDuration={prefersReducedMotion ? 0 : 800} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>

        {/* Right: AI Recommendations + Leaderboard */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">AI Recommendations</h2>
              </div>
              <button
                onClick={handleRefreshInsights}
                disabled={insightLoading}
                className="rounded-lg bg-white/5 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                aria-label="Refresh recommendations"
              >
                <RefreshCw className={`h-4 w-4 ${insightLoading && !prefersReducedMotion ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {insightLoading ? (
              <div className="space-y-3" aria-live="polite" aria-busy="true">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3" aria-live="polite">
                {insights.map(item => (
                  <div key={item.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <item.icon className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase
                        ${item.priority === 'high' ? 'bg-red-500/20 text-red-400' : item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-400">{item.insight}</p>
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                      <TreePine className="h-3 w-3" aria-hidden="true" />
                      Impact: {item.impact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Fan Sustainability Leaderboard */}
          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Fan Eco Leaderboard</h2>
            </div>
            <ul className="space-y-2" aria-label="Top 5 sustainable fans">
              {FAN_LEADERBOARD.map(fan => (
                <li key={fan.rank} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold
                    ${fan.rank === 1 ? 'bg-amber-500/20 text-amber-400'
                      : fan.rank === 2 ? 'bg-gray-400/20 text-gray-300'
                      : fan.rank === 3 ? 'bg-orange-600/20 text-orange-400'
                      : 'bg-white/5 text-gray-500'}`}
                  >
                    {fan.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white">{fan.country} {fan.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{fan.badge}</p>
                    <p className="mt-0.5 text-[9px] text-gray-600">{fan.actions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{fan.score.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-600">pts</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
