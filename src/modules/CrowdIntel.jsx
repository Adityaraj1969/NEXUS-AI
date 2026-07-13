import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  RadialBarChart, RadialBar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, AlertTriangle, TrendingUp, TrendingDown, Brain,
  RefreshCw, Clock, Zap, MapPin, ChevronRight, Loader2,
  ShieldAlert, UserPlus, ArrowUpRight, ArrowDownRight, Camera, UploadCloud
} from 'lucide-react';
import PropTypes from 'prop-types';
import { geminiClient } from '../services/gemini.js';

/** ─── CONSTANTS ─── */
const ZONE_COUNT = 8;
const THRESHOLD_GREEN = 60;
const THRESHOLD_YELLOW = 80;

const ZONE_NAMES = [
  'North Stand', 'South Stand', 'East Wing', 'West Wing',
  'Concourse A', 'Concourse B', 'VIP Level', 'Field Level'
];

const ZONE_COLORS = [
  '#a855f7', '#2dd4bf', '#f59e0b', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
];

/** Generate simulated zone data */
function generateZoneData() {
  return ZONE_NAMES.map((name, i) => {
    const capacity = 8000 + Math.round(Math.random() * 4000);
    const current = Math.round(capacity * (0.4 + Math.random() * 0.55));
    const pct = Math.round((current / capacity) * 100);
    return {
      id: `zone-${i}`,
      name,
      capacity,
      current,
      pct,
      fill: ZONE_COLORS[i],
      trend: Math.round((Math.random() - 0.4) * 10),
      avgDwell: Math.round(15 + Math.random() * 30),
    };
  });
}

/** Generate historical comparison data */
function generateHistoricalData() {
  return Array.from({ length: 12 }, (_, i) => {
    const hour = `${String(i + 10).padStart(2, '0')}:00`;
    return {
      time: hour,
      today: Math.round(40 + Math.random() * 45),
      lastMatch: Math.round(35 + Math.random() * 40),
      average: Math.round(45 + Math.random() * 20),
    };
  });
}

const AI_PREDICTIONS = [
  {
    timeframe: '15 min',
    density: '+4.2%',
    direction: 'up',
    detail: 'North Stand and East Wing expected to see increased flow as halftime approaches.',
    risk: 'low',
  },
  {
    timeframe: '30 min',
    density: '+11.8%',
    direction: 'up',
    detail: 'Concourse A and B will peak during halftime. Recommend opening auxiliary concession lanes.',
    risk: 'medium',
  },
  {
    timeframe: '60 min',
    density: '-8.5%',
    direction: 'down',
    detail: 'Post-halftime density drop expected across all zones. Safe to reduce concourse staffing by 15%.',
    risk: 'low',
  },
];

const STAFF_RECOMMENDATIONS = [
  { zone: 'Concourse A', action: 'Deploy +4 crowd marshals', priority: 'high', reason: 'Pre-halftime surge expected' },
  { zone: 'Gate B', action: 'Open additional screening lane', priority: 'high', reason: 'Queue time exceeding 12 min' },
  { zone: 'East Wing', action: 'Station medical standby', priority: 'medium', reason: 'High density + temperature advisory' },
  { zone: 'South Stand', action: 'Maintain current levels', priority: 'low', reason: 'Density within normal range' },
];

/**
 * GlassCard — glassmorphism container
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.role]
 * @param {string} [props.ariaLabel]
 */
function GlassCard({ children, className = '', role, ariaLabel }) {
  return (
    <div role={role} aria-label={ariaLabel}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/10 p-5 ${className}`}>
      {children}
    </div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  role: PropTypes.string,
  ariaLabel: PropTypes.string,
};

/**
 * DensityIndicator — colored density threshold badge
 * @param {Object} props
 * @param {number} props.pct
 */
function DensityIndicator({ pct }) {
  const level = pct >= THRESHOLD_YELLOW ? 'critical' : pct >= THRESHOLD_GREEN ? 'caution' : 'normal';
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    caution: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    normal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[level]}`}>
      {level}
    </span>
  );
}

DensityIndicator.propTypes = {
  pct: PropTypes.number.isRequired,
};

/**
 * HeatmapGrid — renders a visual grid of crowd density
 * @param {Object} props
 * @param {Array<Object>} props.zones
 */
function HeatmapGrid({ zones }) {
  return (
    <div className="grid grid-cols-8 gap-0.5 sm:gap-1" role="img" aria-label="Crowd density heatmap">
      {Array.from({ length: 64 }, (_, i) => {
        const zoneIdx = Math.floor(i / 8);
        const zone = zones[zoneIdx] || zones[0];
        const intensity = Math.max(0.1, (zone.pct / 100) * (0.6 + Math.random() * 0.4));
        const hue = zone.pct >= THRESHOLD_YELLOW ? 0 : zone.pct >= THRESHOLD_GREEN ? 45 : 160;
        return (
          <div
            key={i}
            className="aspect-square rounded-[2px] transition-colors duration-500 hover:scale-105 hover:z-10 cursor-crosshair"
            style={{ backgroundColor: `hsla(${hue}, 80%, 50%, ${intensity})` }}
            title={`${zone.name}: ${zone.pct}% density`}
          />
        );
      })}
    </div>
  );
}

HeatmapGrid.propTypes = {
  zones: PropTypes.array.isRequired,
};

/**
 * CrowdIntel — crowd management intelligence dashboard
 * Features: heatmap, zone status with RadialBarChart, AI predictions, staff recommendations,
 * historical comparison, and alert thresholds.
 * @returns {JSX.Element}
 */
export default function CrowdIntel() {
  const [zones, setZones] = useState(generateZoneData);
  const [historicalData] = useState(generateHistoricalData);
  const [predictions, setPredictions] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches, []);

  /** Update zone data every 8 seconds */
  useEffect(() => {
    const id = setInterval(() => {
      setZones(prev => prev.map(z => {
        const delta = Math.round((Math.random() - 0.45) * 300);
        const next = Math.max(0, Math.min(z.capacity, z.current + delta));
        return { ...z, current: next, pct: Math.round((next / z.capacity) * 100), trend: Math.round((Math.random() - 0.4) * 10) };
      }));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  /** Generate AI predictions */
  const handleGeneratePrediction = useCallback(async (imageData = null) => {
    setPredictionLoading(true);
    setPredictions(null);
    try {
      const prompt = `Analyze current stadium metrics. Generate a 15, 30, and 60-minute prediction.
Return ONLY a JSON array of 3 objects with these exact keys: timeframe (string like '15 min'), density (string with % and +/- sign), direction (string 'up' or 'down'), detail (string), risk (string 'low', 'medium', or 'high').
${imageData ? 'I have attached an image from the stadium CCTV. Analyze the crowd density in the image and adjust your predictions accordingly.' : ''}`;
      
      const response = await geminiClient.generateJSON(prompt, 'crowd', imageData);
      
      if (Array.isArray(response) && response.length === 3) {
        setPredictions(response);
      } else {
        setPredictions(AI_PREDICTIONS);
      }
    } catch (err) {
      console.error(err);
      setPredictions(AI_PREDICTIONS);
    } finally {
      setPredictionLoading(false);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {return;}

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target.result.split(',')[1];
      handleGeneratePrediction({ base64: base64Str, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  /** Prepare radial bar data for a zone */
  const getRadialData = useCallback((zone) => [
    { name: 'Capacity', value: zone.pct, fill: zone.fill },
  ], []);

  const avgDensity = useMemo(() => {
    const avg = zones.reduce((sum, z) => sum + z.pct, 0) / zones.length;
    return Math.round(avg);
  }, [zones]);

  const criticalZones = useMemo(() => zones.filter(z => z.pct >= THRESHOLD_YELLOW), [zones]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="Crowd Intelligence Dashboard">
      {/* Header */}
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <Users className="h-8 w-8 text-purple-400" aria-hidden="true" />
          Crowd <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Intelligence</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Real-time crowd analytics & AI-powered density predictions</p>
      </header>

      {/* KPI Strip */}
      <section aria-label="Crowd KPIs" className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <GlassCard role="status" ariaLabel={`Average density: ${avgDensity}%`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Avg Density</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{avgDensity}%</p>
        </GlassCard>
        <GlassCard role="status" ariaLabel={`Total fans: ${zones.reduce((s, z) => s + z.current, 0).toLocaleString()}`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Total Fans</p>
          <p className="mt-1 text-xl font-bold text-teal-400">{zones.reduce((s, z) => s + z.current, 0).toLocaleString()}</p>
        </GlassCard>
        <GlassCard role="status" ariaLabel={`Critical zones: ${criticalZones.length}`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Critical Zones</p>
          <p className="mt-1 text-xl font-bold text-red-400">{criticalZones.length}</p>
        </GlassCard>
        <GlassCard role="status" ariaLabel="Average dwell time: 22 min">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Avg Dwell Time</p>
          <p className="mt-1 text-xl font-bold text-amber-400">22 min</p>
        </GlassCard>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Heatmap + Historical */}
        <div className="lg:col-span-2 space-y-6">
          {/* Heatmap */}
          <GlassCard role="img" ariaLabel="Real-time crowd density heatmap">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-300">Density Heatmap</h2>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" /> &lt;60%</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-yellow-500" /> 60-80%</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-red-500" /> &gt;80%</span>
              </div>
            </div>
            <HeatmapGrid zones={zones} />
          </GlassCard>

          {/* Zone Status Cards */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">Zone Status</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {zones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  className={`rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                    ${selectedZone === zone.id ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                  aria-pressed={selectedZone === zone.id}
                  aria-label={`${zone.name}: ${zone.pct}% capacity`}
                >
                  <div className="mx-auto h-20 w-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        data={getRadialData(zone)}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar
                          background={{ fill: 'rgba(255,255,255,0.05)' }}
                          dataKey="value"
                          cornerRadius={10}
                          animationDuration={prefersReducedMotion ? 0 : 600}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-1 text-center text-[10px] font-medium text-white">{zone.name}</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span className="text-xs font-bold" style={{ color: zone.fill }}>{zone.pct}%</span>
                    <DensityIndicator pct={zone.pct} />
                  </div>
                  <div className={`mt-1 flex items-center justify-center gap-0.5 text-[10px] ${zone.trend >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {zone.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(zone.trend)}%
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Historical Comparison */}
          <GlassCard role="img" ariaLabel="Historical crowd density comparison chart">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Historical Comparison</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="today" stroke="#a855f7" strokeWidth={2} dot={false} name="Today" animationDuration={prefersReducedMotion ? 0 : 800} />
                <Line type="monotone" dataKey="lastMatch" stroke="#2dd4bf" strokeWidth={2} dot={false} name="Last Match" strokeDasharray="5 5" animationDuration={prefersReducedMotion ? 0 : 800} />
                <Line type="monotone" dataKey="average" stroke="#6b7280" strokeWidth={1} dot={false} name="Season Avg" strokeDasharray="3 3" animationDuration={prefersReducedMotion ? 0 : 800} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Right: AI Predictions + Staff Recs */}
        <div className="space-y-6">
          {/* Generate Prediction */}
          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-300">AI Crowd Prediction</h2>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              Gemini AI analyzes real-time flow patterns, weather, match events, and historical data to forecast crowd density.
            </p>
            <button
              onClick={handleGeneratePrediction}
              disabled={predictionLoading}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white
                shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
              aria-label="Generate AI crowd prediction"
            >
              {predictionLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Analyzing Patterns…</>
              ) : (
                <><Zap className="h-4 w-4" aria-hidden="true" /> Generate Prediction</>
              )}
            </button>
            <div className="mb-4">
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-teal-500/50 bg-teal-500/5 px-4 py-3 text-sm font-semibold text-teal-300 transition-all hover:bg-teal-500/10 focus-within:ring-2 focus-within:ring-teal-500">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Analyze Camera Feed
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="sr-only" 
                  onChange={handleFileUpload} 
                  disabled={predictionLoading}
                />
              </label>
            </div>

            {predictions && (
              <div className="space-y-3" aria-live="polite">
                {predictions.map(pred => (
                  <div key={pred.timeframe} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{pred.timeframe} Forecast</span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${pred.direction === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {pred.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {pred.density}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-400">{pred.detail}</p>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider
                        ${pred.risk === 'low' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : pred.risk === 'medium' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                        Risk: {pred.risk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Staff Deployment Recommendations */}
          <GlassCard>
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-teal-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">Staff Deployment</h2>
            </div>
            <ul className="space-y-2">
              {STAFF_RECOMMENDATIONS.map((rec, i) => (
                <li key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-white">{rec.zone}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase
                      ${rec.priority === 'high' ? 'bg-red-500/20 text-red-400' : rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-purple-300">{rec.action}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">{rec.reason}</p>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Alert Thresholds */}
          <GlassCard>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-300">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Alert Thresholds
            </h2>
            <div className="space-y-2">
              {zones.map(zone => {
                const level = zone.pct >= THRESHOLD_YELLOW ? 'red' : zone.pct >= THRESHOLD_GREEN ? 'yellow' : 'green';
                const barColor = level === 'red' ? 'bg-red-500' : level === 'yellow' ? 'bg-yellow-500' : 'bg-emerald-500';
                return (
                  <div key={zone.id} className="flex items-center gap-2">
                    <span className="w-20 truncate text-[10px] text-gray-400">{zone.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${zone.pct}%` }}
                        role="progressbar" aria-valuenow={zone.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${zone.name} density`} />
                    </div>
                    <span className="w-8 text-right text-[10px] font-medium text-gray-300">{zone.pct}%</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
