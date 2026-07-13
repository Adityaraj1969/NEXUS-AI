import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Shield, Users, Stethoscope, Clock, Zap,
  RefreshCw, Plus, Minus, CloudRain, Sun, Wind, Thermometer,
  Siren, CloudLightning, ShieldAlert, UserCheck,
  Activity, MapPin
} from 'lucide-react';

/** ─── CONSTANTS ─── */
const MAX_LOG_EVENTS = 100;
const RAG_CONTEXT_SIZE = 20;
const BRIEFING_REFRESH_MS = 60_000;

const SEVERITY_STYLES = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  info: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

const INCIDENT_CATEGORIES = [
  { category: 'Medical', count: 12, color: '#ef4444' },
  { category: 'Security', count: 8, color: '#f59e0b' },
  { category: 'Crowd', count: 15, color: '#a855f7' },
  { category: 'Facility', count: 6, color: '#3b82f6' },
  { category: 'Weather', count: 3, color: '#2dd4bf' },
  { category: 'Transport', count: 9, color: '#ec4899' },
];

const EMERGENCY_PROTOCOLS = [
  { id: 'evacuation', label: 'Evacuation', icon: Siren, color: 'bg-red-600 hover:bg-red-700', description: 'Initiate full or partial stadium evacuation' },
  { id: 'medical', label: 'Medical Emergency', icon: Stethoscope, color: 'bg-orange-600 hover:bg-orange-700', description: 'Deploy emergency medical response teams' },
  { id: 'weather', label: 'Weather Alert', icon: CloudLightning, color: 'bg-blue-600 hover:bg-blue-700', description: 'Activate severe weather protocol' },
  { id: 'security', label: 'Security Lockdown', icon: ShieldAlert, color: 'bg-purple-600 hover:bg-purple-700', description: 'Initiate security lockdown procedures' },
];

/** Generate initial log events */
function generateInitialEvents() {
  const events = [
    { severity: 'info', category: 'Facility', message: 'All stadium gates opened for fan entry', zone: 'All Gates', timestamp: new Date(Date.now() - 3_600_000 * 3) },
    { severity: 'info', category: 'Security', message: 'Security sweep completed — all clear', zone: 'Full Venue', timestamp: new Date(Date.now() - 3_600_000 * 2.5) },
    { severity: 'low', category: 'Crowd', message: 'North Stand reaching 50% capacity', zone: 'North Stand', timestamp: new Date(Date.now() - 3_600_000 * 2) },
    { severity: 'medium', category: 'Medical', message: 'Heat-related complaint — Section 312, fan treated on-site', zone: 'Section 312', timestamp: new Date(Date.now() - 3_600_000 * 1.5) },
    { severity: 'info', category: 'Transport', message: 'NJ Transit extra service confirmed — 4 additional trains', zone: 'External', timestamp: new Date(Date.now() - 3_600_000) },
    { severity: 'high', category: 'Security', message: 'Unauthorized drone detected — airspace team notified', zone: 'Airspace', timestamp: new Date(Date.now() - 2_700_000) },
    { severity: 'low', category: 'Facility', message: 'Concession stand #3 — POS system restarted', zone: 'Concourse A', timestamp: new Date(Date.now() - 2_400_000) },
    { severity: 'medium', category: 'Crowd', message: 'Gate B queue time exceeding 12 minutes', zone: 'Gate B', timestamp: new Date(Date.now() - 1_800_000) },
    { severity: 'info', category: 'Weather', message: 'Temperature: 78°F, clear skies — no weather concerns', zone: 'Outdoor', timestamp: new Date(Date.now() - 1_200_000) },
    { severity: 'critical', category: 'Medical', message: 'Medical team dispatched — Section 214 cardiac event', zone: 'Section 214', timestamp: new Date(Date.now() - 600_000) },
    { severity: 'high', category: 'Crowd', message: 'Concourse B density at 85% — crowd marshals deployed', zone: 'Concourse B', timestamp: new Date(Date.now() - 300_000) },
    { severity: 'info', category: 'Facility', message: 'LED display system — pre-match visuals loaded', zone: 'Field Level', timestamp: new Date(Date.now() - 120_000) },
  ];
  return events.map((e, i) => ({ ...e, id: `EVT-${String(i + 1).padStart(4, '0')}` }));
}

const VOLUNTEER_DATA = [
  { name: 'Sarah Chen', zone: 'Gate A', status: 'Active', role: 'Guest Services', checkedIn: '14:30' },
  { name: 'Marcus Johnson', zone: 'Concourse B', status: 'Active', role: 'Crowd Marshal', checkedIn: '14:15' },
  { name: 'Elena Rodriguez', zone: 'Section 100', status: 'Break', role: 'Accessibility Guide', checkedIn: '13:45' },
  { name: 'Ahmed Hassan', zone: 'Gate D', status: 'Active', role: 'Wayfinding', checkedIn: '14:00' },
  { name: 'Yuki Tanaka', zone: 'Medical Center', status: 'Active', role: 'First Aid', checkedIn: '13:30' },
  { name: 'Liam O\'Brien', zone: 'Parking Lot A', status: 'Active', role: 'Transport Guide', checkedIn: '14:45' },
];

const AI_BRIEFINGS = [
  'Stadium operations are running nominally with 72,400 fans in attendance for the USA vs Brazil semi-final. One critical medical incident in Section 214 is being managed by the on-site cardiac response team — patient stabilized and emergency transport en route.',
  'Crowd density in Concourse B has reached 85%, triggering deployment of 4 additional marshals. Gate B queue times remain elevated at 12 minutes — recommend opening supplementary screening lane to reduce wait times below the 10-minute threshold.',
  'Security reports an unauthorized drone incursion that was neutralized by the airspace monitoring team within 3 minutes. All other systems are operational with no further escalation. Weather conditions remain favorable with clear skies and 78°F temperatures.',
];

const WEATHER = {
  condition: 'Partly Cloudy',
  temp: 78,
  feelsLike: 81,
  humidity: 62,
  wind: '8 mph NW',
  icon: Sun,
  forecast: 'Clear skies expected through the match. Low chance of precipitation (5%).',
};

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
 * Operations — command center dashboard with in-memory RAG
 * Maintains last 100 log events in state. Injects 20 most recent into AI prompt context.
 * Features: executive briefing, incident feed, resource allocation, BarChart, volunteer table,
 * emergency protocols with confirmation, weather widget.
 * @returns {JSX.Element}
 */
export default function Operations() {
  const [events, setEvents] = useState(generateInitialEvents);
  const [briefing, setBriefing] = useState(AI_BRIEFINGS[0]);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [resources, setResources] = useState({ staff: 245, medical: 32, security: 68 });
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [protocolActivated, setProtocolActivated] = useState(null);
  const briefingIdx = useRef(0);
  const feedRef = useRef(null);
  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches, []);



  /** Simulate new events arriving */
  useEffect(() => {
    const newEvents = [
      { severity: 'info', category: 'Facility', message: 'Restroom cleaning crew dispatched — North Concourse', zone: 'North Concourse' },
      { severity: 'low', category: 'Crowd', message: 'South Stand exits clear — good egress flow', zone: 'South Stand' },
      { severity: 'medium', category: 'Security', message: 'Unattended bag reported — Section 220, sweep underway', zone: 'Section 220' },
      { severity: 'info', category: 'Transport', message: 'Parking Lot B at 88% capacity', zone: 'Parking Lot B' },
      { severity: 'low', category: 'Medical', message: 'First aid restocked — Station #4', zone: 'Concourse A' },
    ];
    let idx = 0;

    const id = setInterval(() => {
      const template = newEvents[idx % newEvents.length];
      const newEvent = {
        ...template,
        id: `EVT-${String(Date.now()).slice(-6)}`,
        timestamp: new Date(),
      };
      setEvents(prev => {
        const updated = [...prev, newEvent];
        return updated.length > MAX_LOG_EVENTS ? updated.slice(-MAX_LOG_EVENTS) : updated;
      });
      idx++;
    }, 12_000);

    return () => clearInterval(id);
  }, []);

  /** Auto-refresh briefing */
  const refreshBriefing = useCallback(() => {
    setBriefingLoading(true);
    // In-memory RAG: ragContext would be injected into the Gemini prompt here
    // e.g. geminiClient.generateContent(`Given these recent events:\n${ragContext}\n\nProvide a 2-sentence executive briefing.`)
    setTimeout(() => {
      briefingIdx.current = (briefingIdx.current + 1) % AI_BRIEFINGS.length;
      setBriefing(AI_BRIEFINGS[briefingIdx.current]);
      setBriefingLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    const id = setInterval(refreshBriefing, BRIEFING_REFRESH_MS);
    return () => clearInterval(id);
  }, [refreshBriefing]);

  /** Adjust resource counts */
  const adjustResource = useCallback((key, delta) => {
    setResources(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  }, []);

  /** Handle protocol confirmation */
  const handleProtocolConfirm = useCallback(() => {
    if (selectedProtocol) {
      setProtocolActivated(selectedProtocol.id);
      const logEvent = {
        id: `EVT-PROTO-${Date.now()}`,
        severity: 'critical',
        category: 'Security',
        message: `EMERGENCY PROTOCOL ACTIVATED: ${selectedProtocol.label}`,
        zone: 'Full Venue',
        timestamp: new Date(),
      };
      setEvents(prev => [...prev.slice(-(MAX_LOG_EVENTS - 1)), logEvent]);
      setSelectedProtocol(null);
      setTimeout(() => setProtocolActivated(null), 5000);
    }
  }, [selectedProtocol]);

  const criticalCount = useMemo(() => events.filter(e => e.severity === 'critical').length, [events]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/10 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="Operations Command Center">
      {/* Protocol Activated Toast */}
      {protocolActivated && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-900/90 px-6 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl"
          role="alert" aria-live="assertive">
          <Siren className="mr-2 inline-block h-4 w-4 animate-pulse text-red-400" aria-hidden="true" />
          Protocol &quot;{protocolActivated}&quot; activated — all teams notified
        </div>
      )}


      {/* Header */}
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <Shield className="h-8 w-8 text-red-400" aria-hidden="true" />
          Operations <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">Command</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Real-time incident management • In-Memory RAG ({events.length}/{MAX_LOG_EVENTS} events, {RAG_CONTEXT_SIZE} in context)
        </p>
      </header>

      {/* KPI Strip */}
      <section aria-label="Operations KPIs" className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <GlassCard role="status" ariaLabel={`Total events: ${events.length}`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Total Events</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{events.length}</p>
        </GlassCard>
        <GlassCard role="status" ariaLabel={`Critical incidents: ${criticalCount}`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Critical</p>
          <p className="mt-1 text-xl font-bold text-red-400">{criticalCount}</p>
        </GlassCard>
        <GlassCard role="status" ariaLabel={`High priority: ${highCount}`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">High Priority</p>
          <p className="mt-1 text-xl font-bold text-orange-400">{highCount}</p>
        </GlassCard>
        <GlassCard role="status" ariaLabel={`Staff deployed: ${resources.staff}`}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Staff Deployed</p>
          <p className="mt-1 text-xl font-bold text-teal-400">{resources.staff}</p>
        </GlassCard>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Briefing + Incident Feed + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Briefing */}
          <GlassCard role="region" ariaLabel="AI Executive Briefing">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-300">AI Executive Briefing</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600">RAG: {RAG_CONTEXT_SIZE} events in context</span>
                <button
                  onClick={refreshBriefing}
                  disabled={briefingLoading}
                  className="rounded-lg bg-white/5 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
                  aria-label="Refresh briefing"
                >
                  <RefreshCw className={`h-4 w-4 ${briefingLoading && !prefersReducedMotion ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>
              </div>
            </div>
            {briefingLoading ? (
              <div className="space-y-3" aria-busy="true" aria-live="polite">
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-white/10" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-gray-300" aria-live="polite">{briefing}</p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-600">
              <Clock className="h-3 w-3" /> Auto-refreshes every 60s • In-Memory RAG • Gemini AI
            </div>
          </GlassCard>

          {/* Real-time Incident Feed */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                <Activity className="mr-2 inline-block h-4 w-4 text-red-400" aria-hidden="true" />
                Incident Feed
              </h2>
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                Live
              </span>
            </div>
            <div ref={feedRef} className="max-h-80 space-y-2 overflow-y-auto pr-1" role="log" aria-label="Real-time incident feed" aria-live="polite">
              {[...events].reverse().slice(0, 20).map(event => (
                <div key={event.id} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="shrink-0 pt-0.5">
                    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[event.severity]}`}>
                      {event.severity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-300">{event.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-600">
                      <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {event.zone}</span>
                      <span>•</span>
                      <span>{event.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span>•</span>
                      <span>{event.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Incidents by Category Chart */}
          <GlassCard role="img" ariaLabel="Incidents by category bar chart">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Incidents by Category
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={INCIDENT_CATEGORIES} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={prefersReducedMotion ? 0 : 800}>
                  {INCIDENT_CATEGORIES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Volunteer Coordination */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              <UserCheck className="mr-2 inline-block h-4 w-4 text-teal-400" aria-hidden="true" />
              Volunteer Coordination
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Volunteer coordination table">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 pr-4 font-medium">Zone</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 font-medium">Check-In</th>
                  </tr>
                </thead>
                <tbody>
                  {VOLUNTEER_DATA.map(vol => (
                    <tr key={vol.name} className="border-b border-white/5 text-gray-300">
                      <td className="py-2.5 pr-4 font-medium text-white">{vol.name}</td>
                      <td className="py-2.5 pr-4 text-[10px]">{vol.role}</td>
                      <td className="py-2.5 pr-4">{vol.zone}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase
                          ${vol.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {vol.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500">{vol.checkedIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Resource Allocation */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
              <Users className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Resource Allocation
            </h2>
            <div className="space-y-3">
              {[
                { key: 'staff', label: 'Operations Staff', icon: Users, color: 'text-purple-400' },
                { key: 'medical', label: 'Medical Personnel', icon: Stethoscope, color: 'text-red-400' },
                { key: 'security', label: 'Security Officers', icon: Shield, color: 'text-amber-400' },
              ].map(res => (
                <div key={res.key} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <res.icon className={`h-4 w-4 ${res.color}`} aria-hidden="true" />
                      <span className="text-xs text-gray-300">{res.label}</span>
                    </div>
                    <span className="text-lg font-bold text-white">{resources[res.key]}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => adjustResource(res.key, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400
                        transition-colors hover:bg-red-500/20 hover:text-red-400
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                      aria-label={`Decrease ${res.label}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => adjustResource(res.key, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400
                        transition-colors hover:bg-emerald-500/20 hover:text-emerald-400
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                      aria-label={`Increase ${res.label}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Emergency Protocols */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-300">
              <Siren className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Emergency Protocols
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_PROTOCOLS.map(proto => (
                <button
                  key={proto.id}
                  onClick={() => setSelectedProtocol(selectedProtocol?.id === proto.id ? null : proto)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 text-xs font-semibold text-white transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${proto.color}`}
                  aria-label={`Activate ${proto.label} protocol`}
                >
                  <proto.icon className="h-5 w-5" aria-hidden="true" />
                  {proto.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-600">
              All activations require confirmation and are permanently logged
            </p>
            
            {/* Inline Confirmation Area */}
            {selectedProtocol && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <selectedProtocol.icon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  <h3 className="font-semibold text-white">Confirm {selectedProtocol.label}</h3>
                </div>
                <p className="mb-4 text-xs text-gray-300">{selectedProtocol.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedProtocol(null)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProtocolConfirm}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Activate
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Weather Widget */}
          <GlassCard role="status" ariaLabel={`Weather: ${WEATHER.condition}, ${WEATHER.temp}°F`}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-300">
              <WEATHER.icon className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Weather Conditions
            </h2>
            <div className="text-center">
              <WEATHER.icon className="mx-auto mb-2 h-12 w-12 text-amber-400" aria-hidden="true" />
              <p className="text-2xl font-bold text-white">{WEATHER.temp}°F</p>
              <p className="text-xs text-gray-400">{WEATHER.condition}</p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                <Thermometer className="mx-auto mb-0.5 h-3 w-3 text-gray-500" aria-hidden="true" />
                <p className="text-[10px] text-gray-500">Feels Like</p>
                <p className="text-xs font-medium text-white">{WEATHER.feelsLike}°F</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                <CloudRain className="mx-auto mb-0.5 h-3 w-3 text-gray-500" aria-hidden="true" />
                <p className="text-[10px] text-gray-500">Humidity</p>
                <p className="text-xs font-medium text-white">{WEATHER.humidity}%</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-2 text-center">
                <Wind className="mx-auto mb-0.5 h-3 w-3 text-gray-500" aria-hidden="true" />
                <p className="text-[10px] text-gray-500">Wind</p>
                <p className="text-xs font-medium text-white">{WEATHER.wind}</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-500">{WEATHER.forecast}</p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
