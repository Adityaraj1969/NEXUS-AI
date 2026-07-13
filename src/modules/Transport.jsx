import { useState, useMemo, useCallback, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Bus, Car, Footprints, ParkingCircle, Clock, MapPin,
  Navigation, AlertTriangle, TrendingUp, Zap, Train,
  CircleDollarSign, ArrowRight, Loader2, ChevronRight,
  Timer, Gauge
} from 'lucide-react';

/** ─── CONSTANTS ─── */
const TRANSPORT_MODES = [
  { id: 'transit', label: 'Transit', icon: Train },
  { id: 'rideshare', label: 'Ride-Share', icon: Car },
  { id: 'walking', label: 'Walking', icon: Footprints },
  { id: 'parking', label: 'Parking', icon: ParkingCircle },
];

const TRAVEL_TIME_DATA = [
  { mode: 'Metro', time: 25, color: '#a855f7' },
  { mode: 'Bus', time: 38, color: '#2dd4bf' },
  { mode: 'Ride-Share', time: 22, color: '#f59e0b' },
  { mode: 'Walk', time: 55, color: '#3b82f6' },
  { mode: 'Taxi', time: 28, color: '#ec4899' },
];

const PARKING_DATA = [
  { name: 'Occupied', value: 3420, fill: '#a855f7' },
  { name: 'Available', value: 1080, fill: '#2dd4bf' },
  { name: 'Reserved', value: 500, fill: '#f59e0b' },
];

const TRANSIT_LINES = [
  {
    name: 'NJ Transit — Meadowlands Line',
    status: 'on-time',
    nextArrival: '6 min',
    frequency: 'Every 8 min',
    capacity: 72,
    delay: null,
  },
  {
    name: 'Metro — Line 7 Extension',
    status: 'minor-delay',
    nextArrival: '12 min',
    frequency: 'Every 10 min',
    capacity: 88,
    delay: '4 min delay at Secaucus Junction',
  },
  {
    name: 'Event Shuttle — Route S1',
    status: 'on-time',
    nextArrival: '3 min',
    frequency: 'Every 5 min',
    capacity: 45,
    delay: null,
  },
];

const POPULAR_ORIGINS = [
  'Manhattan — Times Square',
  'Newark Penn Station',
  'Secaucus Junction',
  'Hoboken Terminal',
  'Jersey City — Exchange Place',
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
 * TransitStatusCard — live transit line status
 * @param {{ line: Object }} props
 */
function TransitStatusCard({ line }) {
  const statusStyles = {
    'on-time': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'minor-delay': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'major-delay': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-white">{line.name}</h3>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${statusStyles[line.status]}`}>
          {line.status.replace('-', ' ')}
        </span>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-gray-500">Next</p>
          <p className="text-xs font-medium text-purple-400">{line.nextArrival}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Frequency</p>
          <p className="text-xs font-medium text-teal-400">{line.frequency}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Capacity</p>
          <p className={`text-xs font-medium ${line.capacity > 80 ? 'text-red-400' : line.capacity > 60 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {line.capacity}%
          </p>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-500 ${line.capacity > 80 ? 'bg-red-500' : line.capacity > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
          style={{ width: `${line.capacity}%` }}
          role="progressbar"
          aria-valuenow={line.capacity}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${line.name} capacity`}
        />
      </div>

      {line.delay && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-2 py-1.5 text-[10px] text-yellow-400">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {line.delay}
        </div>
      )}
    </div>
  );
}

/**
 * Transport — transportation hub dashboard for FIFA World Cup 2026
 * Features: journey planner, mode tabs, AI departure recommendation, BarChart travel times,
 * live transit status, PieChart parking availability, surge pricing indicator.
 * @returns {JSX.Element}
 */
export default function Transport() {
  const [activeMode, setActiveMode] = useState('transit');
  const [origin, setOrigin] = useState('');
  const [departureTime, setDepartureTime] = useState('18:30');
  const [journeyResult, setJourneyResult] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const prefersReducedMotion = useMemo(() => {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  }, []);

  const surgeMultiplier = 2.4;
  const totalParking = useMemo(() => PARKING_DATA.reduce((s, d) => s + d.value, 0), []);
  const availableParking = PARKING_DATA.find(d => d.name === 'Available')?.value || 0;
  const parkingPct = Math.round((availableParking / totalParking) * 100);

  /** Simulate journey planning */
  const handlePlanJourney = useCallback(() => {
    if (!origin) {return;}
    setJourneyLoading(true);
    setJourneyResult(null);

    setTimeout(() => {
      setJourneyResult({
        recommended: '17:45',
        reason: 'Based on real-time traffic patterns and match start time (20:00), departing at 17:45 gives you optimal arrival with a 30-minute buffer for security screening.',
        estimatedTime: activeMode === 'transit' ? '25 min' : activeMode === 'rideshare' ? '22 min' : activeMode === 'walking' ? '55 min' : '18 min',
        fare: activeMode === 'transit' ? '$4.50' : activeMode === 'rideshare' ? `$38.00 (${surgeMultiplier}x surge)` : activeMode === 'walking' ? 'Free' : '$45.00 (lot)',
        co2: activeMode === 'transit' ? '0.8 kg' : activeMode === 'rideshare' ? '2.4 kg' : activeMode === 'walking' ? '0 kg' : '3.1 kg',
      });
      setJourneyLoading(false);
    }, 1500);
  }, [origin, activeMode, surgeMultiplier]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="Transportation Hub">
      {/* Header */}
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <Bus className="h-8 w-8 text-teal-400" aria-hidden="true" />
          Transport <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">Journey planning & real-time transit for MetLife Stadium</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Journey Planner + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Planner */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
              <Navigation className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Journey Planner
            </h2>

            {/* Mode Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl bg-white/[0.03] p-1">
              {TRANSPORT_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                    ${activeMode === mode.id
                      ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                    }`}
                  aria-pressed={activeMode === mode.id}
                  aria-label={`${mode.label} mode`}
                >
                  <mode.icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="origin-input" className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Origin
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
                  <select
                    id="origin-input"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white
                      focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-900">Select origin…</option>
                    {POPULAR_ORIGINS.map(o => (
                      <option key={o} value={o} className="bg-gray-900">{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="departure-time" className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Departure Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" aria-hidden="true" />
                  <input
                    id="departure-time"
                    type="time"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white
                      focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Destination (fixed) */}
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <MapPin className="h-4 w-4 text-teal-400" aria-hidden="true" />
              <div>
                <p className="text-[10px] text-gray-500">Destination</p>
                <p className="text-sm font-medium text-white">MetLife Stadium — East Rutherford, NJ</p>
              </div>
            </div>

            {/* Plan Button */}
            <button
              onClick={handlePlanJourney}
              disabled={!origin || journeyLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white
                shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/30 hover:brightness-110
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50"
              aria-label="Plan journey"
            >
              {journeyLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Planning Route…</>
              ) : (
                <><ArrowRight className="h-4 w-4" aria-hidden="true" /> Plan Journey</>
              )}
            </button>

            {/* Journey Result */}
            {journeyResult && (
              <div className="mt-4 space-y-3" aria-live="polite">
                {/* AI Recommended Time */}
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-400" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-purple-300">AI-Recommended Departure</h3>
                  </div>
                  <p className="mb-1 text-2xl font-bold text-white">{journeyResult.recommended}</p>
                  <p className="text-xs leading-relaxed text-gray-400">{journeyResult.reason}</p>
                </div>

                {/* Journey Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <Timer className="mx-auto mb-1 h-4 w-4 text-teal-400" aria-hidden="true" />
                    <p className="text-[10px] text-gray-500">Travel Time</p>
                    <p className="text-sm font-bold text-white">{journeyResult.estimatedTime}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <CircleDollarSign className="mx-auto mb-1 h-4 w-4 text-amber-400" aria-hidden="true" />
                    <p className="text-[10px] text-gray-500">Fare</p>
                    <p className="text-sm font-bold text-white">{journeyResult.fare}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                    <Gauge className="mx-auto mb-1 h-4 w-4 text-emerald-400" aria-hidden="true" />
                    <p className="text-[10px] text-gray-500">CO₂</p>
                    <p className="text-sm font-bold text-white">{journeyResult.co2}</p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Travel Time Comparison */}
          <GlassCard role="img" ariaLabel="Estimated travel times by transport mode">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Estimated Travel Times
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={TRAVEL_TIME_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="mode" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${v}m`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                  formatter={(val) => [`${val} min`, 'Travel Time']}
                />
                <Bar dataKey="time" radius={[8, 8, 0, 0]} animationDuration={prefersReducedMotion ? 0 : 800}>
                  {TRAVEL_TIME_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Right: Transit Status + Parking + Surge */}
        <div className="space-y-6">
          {/* Live Transit Status */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-300">
                <Train className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
                Live Transit
              </h2>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </div>
            </div>
            <div className="space-y-3">
              {TRANSIT_LINES.map(line => (
                <TransitStatusCard key={line.name} line={line} />
              ))}
            </div>
          </GlassCard>

          {/* Parking Availability */}
          <GlassCard role="img" ariaLabel={`Parking availability: ${parkingPct}% available`}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
              <ParkingCircle className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Parking Availability
            </h2>
            <div className="mx-auto h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PARKING_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={prefersReducedMotion ? 0 : 800}
                  >
                    {PARKING_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                    formatter={(val) => [val.toLocaleString(), 'Spaces']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <p className="text-2xl font-bold text-teal-400">{availableParking.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500">Spaces available of {totalParking.toLocaleString()}</p>
            </div>
            <div className="mt-3 flex justify-center gap-4">
              {PARKING_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.name}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Surge Pricing Indicator */}
          <GlassCard role="status" ariaLabel={`Ride-share surge pricing: ${surgeMultiplier}x`}>
            <div className="mb-3 flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">Surge Pricing</h2>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
              <p className="text-3xl font-bold text-amber-400">{surgeMultiplier}x</p>
              <p className="mt-1 text-xs text-gray-400">Current ride-share multiplier</p>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Standard fare</span>
                <span className="text-gray-300">$15.80</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Current fare</span>
                <span className="font-bold text-amber-400">${(15.80 * surgeMultiplier).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Expected to drop by</span>
                <span className="text-emerald-400">11:30 PM</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-2 py-1.5 text-[10px] text-yellow-400">
              <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
              High demand — consider public transit for best value
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
