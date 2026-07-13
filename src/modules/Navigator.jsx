import { useState, useCallback, useRef, useMemo } from 'react';
import {
  Navigation, MapPin, Clock, Accessibility, Eye, ChevronDown,
  Route, Footprints, LocateFixed, ArrowRight, Star, Coffee,
  Cross, ShieldCheck, Ticket, ChevronRight, Search, Loader2
} from 'lucide-react';

/** ─── CONSTANTS ─── */
const DESTINATIONS = [
  { id: 'gate-a', label: 'Gate A — Main Entrance', zone: 'North' },
  { id: 'gate-b', label: 'Gate B — VIP Entrance', zone: 'North-East' },
  { id: 'gate-c', label: 'Gate C — East Wing', zone: 'East' },
  { id: 'gate-d', label: 'Gate D — Family Section', zone: 'South-East' },
  { id: 'gate-e', label: 'Gate E — South Entrance', zone: 'South' },
  { id: 'gate-f', label: 'Gate F — Press & Media', zone: 'West' },
  { id: 'concessions-1', label: 'Concessions — Level 1', zone: 'Concourse' },
  { id: 'concessions-2', label: 'Concessions — Level 2', zone: 'Upper Concourse' },
  { id: 'restrooms-n', label: 'Restrooms — North', zone: 'North' },
  { id: 'restrooms-s', label: 'Restrooms — South', zone: 'South' },
  { id: 'medical', label: 'Medical Center', zone: 'West' },
  { id: 'accessible-seating', label: 'Accessible Seating — Section 100', zone: 'Lower Bowl' },
];

const ZONES = [
  { id: 'north', label: 'North Stand', color: 'from-purple-500/30 to-purple-500/5', crowd: 78 },
  { id: 'south', label: 'South Stand', color: 'from-teal-500/30 to-teal-500/5', crowd: 65 },
  { id: 'east', label: 'East Wing', color: 'from-amber-500/30 to-amber-500/5', crowd: 82 },
  { id: 'west', label: 'West Wing', color: 'from-blue-500/30 to-blue-500/5', crowd: 54 },
  { id: 'concourse', label: 'Main Concourse', color: 'from-pink-500/30 to-pink-500/5', crowd: 71 },
  { id: 'field', label: 'Field Level', color: 'from-emerald-500/30 to-emerald-500/5', crowd: 90 },
];

const POIS = [
  { name: 'Fan Festival Stage', distance: '120m', icon: Star, type: 'Entertainment' },
  { name: 'Coffee Corner — Concourse B', distance: '45m', icon: Coffee, type: 'Food & Drink' },
  { name: 'First Aid Station #2', distance: '80m', icon: Cross, type: 'Medical' },
  { name: 'Security Checkpoint — East', distance: '95m', icon: ShieldCheck, type: 'Security' },
  { name: 'Merchandise Store', distance: '60m', icon: Ticket, type: 'Shopping' },
  { name: 'Family Quiet Zone', distance: '150m', icon: Accessibility, type: 'Accessibility' },
];

const SIMULATED_ROUTES = {
  standard: [
    'Head north through Concourse B toward the main atrium.',
    'Continue past Concession Stand #4 on your left (approximately 45m).',
    'At the North Junction, take the right corridor toward Gate A signage.',
    'Proceed straight for 60m — Gate A entrance will be on your right.',
    'Estimated arrival: Gate A — Main Entrance.',
  ],
  wheelchair: [
    'From your current location, proceed to Elevator Bank C (30m ahead).',
    'Take elevator to Concourse Level 1 — accessible button at 90cm height.',
    'Exit elevator and turn left toward the wide-access corridor.',
    'Follow the tactile floor guide for 80m past accessible restrooms.',
    'Ramp access to Gate A is located 20m ahead on the right.',
    'Estimated arrival: Gate A — Main Entrance (Wheelchair Accessible).',
  ],
  visual: [
    'Audio beacon activated: follow the tone increasing in frequency.',
    'You will pass 3 tactile waypoints embedded in the floor surface.',
    'At waypoint 2, a staff member is stationed to assist (50m from start).',
    'The corridor narrows slightly — handrail is on your right side.',
    'Audio confirmation will sound upon reaching Gate A.',
    'Estimated arrival: Gate A — Main Entrance (Visual Assistance Route).',
  ],
};

/**
 * GlassCard — reusable glassmorphism container
 * @param {{ children: React.ReactNode, className?: string }} props
 */
function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/10 p-5 ${className}`}>
      {children}
    </div>
  );
}

/**
 * StadiumMap — SVG-based interactive stadium zone map
 * @param {{ activeZone: string|null, onZoneClick: (id: string) => void }} props
 */
function StadiumMap({ activeZone, onZoneClick }) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg" role="img" aria-label="Interactive stadium zone map">
      {/* Stadium outline */}
      <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
        <ellipse cx="200" cy="150" rx="180" ry="130" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="2" />
        <ellipse cx="200" cy="150" rx="120" ry="80" fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        {/* Field */}
        <rect x="140" y="110" width="120" height="80" rx="8" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
        <text x="200" y="155" textAnchor="middle" fill="rgba(16,185,129,0.6)" fontSize="10">FIELD</text>
      </svg>

      {/* Zone buttons overlaid */}
      {ZONES.map((zone, i) => {
        const positions = [
          'top-2 left-1/2 -translate-x-1/2', // north
          'bottom-2 left-1/2 -translate-x-1/2', // south
          'top-1/2 right-2 -translate-y-1/2', // east
          'top-1/2 left-2 -translate-y-1/2', // west
          'bottom-1/4 left-1/2 -translate-x-1/2', // concourse
          'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', // field
        ];
        const isActive = activeZone === zone.id;
        return (
          <button
            key={zone.id}
            onClick={() => onZoneClick(zone.id)}
            className={`absolute ${positions[i]} rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
              ${isActive
                ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/10'
                : 'border-white/10 bg-black/40 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            aria-label={`${zone.label} — ${zone.crowd}% crowd density`}
            aria-pressed={isActive}
          >
            {zone.label}
            <span className={`ml-1.5 ${zone.crowd > 80 ? 'text-red-400' : zone.crowd > 60 ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {zone.crowd}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Navigator — stadium wayfinding and route planning module
 * Features: interactive zone map, AI route generation, accessibility-aware routing,
 * estimated walk times, and points of interest.
 * @returns {JSX.Element}
 */
export default function Navigator() {
  const [activeZone, setActiveZone] = useState(null);
  const [destination, setDestination] = useState('gate-a');
  const [accessMode, setAccessMode] = useState('standard');
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery) {return DESTINATIONS;}
    const q = searchQuery.toLowerCase();
    return DESTINATIONS.filter(d => d.label.toLowerCase().includes(q) || d.zone.toLowerCase().includes(q));
  }, [searchQuery]);

  const selectedDest = DESTINATIONS.find(d => d.id === destination);

  const walkTimes = useMemo(() => ({
    standard: Math.round(3 + Math.random() * 5),
    wheelchair: Math.round(5 + Math.random() * 7),
    visual: Math.round(6 + Math.random() * 6),
  }), []);

  /** Simulate AI route generation */
  const handleFindRoute = useCallback(() => {
    if (!destination) {return;}
    setRouteLoading(true);
    setRoute(null);
    setTimeout(() => {
      setRoute({
        steps: SIMULATED_ROUTES[accessMode] || SIMULATED_ROUTES.standard,
        walkTime: walkTimes[accessMode],
        distance: `${Math.round(150 + Math.random() * 200)}m`,
      });
      setRouteLoading(false);
    }, 1500);
  }, [destination, accessMode, walkTimes]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="Stadium Navigator">
      {/* ── Header ── */}
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <Navigation className="h-8 w-8 text-teal-400" aria-hidden="true" />
          Stadium <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">Navigator</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">MetLife Stadium — AI-Powered Wayfinding • FIFA World Cup 2026</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: Map + Zones ── */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">Venue Zone Map</h2>
            <StadiumMap activeZone={activeZone} onZoneClick={setActiveZone} />
          </GlassCard>

          {/* Points of Interest */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              <MapPin className="mr-2 inline-block h-4 w-4 text-purple-400" aria-hidden="true" />
              Points of Interest
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {POIS.map(poi => (
                <div key={poi.name} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]">
                  <div className="rounded-lg bg-white/5 p-2">
                    <poi.icon className="h-4 w-4 text-teal-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white">{poi.name}</p>
                    <p className="text-[10px] text-gray-500">{poi.type}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-gray-400">{poi.distance}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Right: Route Planner ── */}
        <div className="space-y-6">
          {/* Destination Selector */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-300">
              <LocateFixed className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Find Your Route
            </h2>

            {/* Current Location */}
            <div className="mb-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Your Location</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Section 118, Row 12
              </p>
            </div>

            {/* Destination Dropdown */}
            <div className="relative mb-3" ref={dropdownRef}>
              <label htmlFor="dest-search" className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Destination
              </label>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm
                  transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                <span className={selectedDest ? 'text-white' : 'text-gray-500'}>
                  {selectedDest ? selectedDest.label : 'Select destination…'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-xl">
                  <div className="sticky top-0 border-b border-white/5 bg-gray-900/95 p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                      <input
                        id="dest-search"
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search destinations…"
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-600
                          focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <ul role="listbox" aria-label="Destinations">
                    {filteredDestinations.map(d => (
                      <li key={d.id}>
                        <button
                          role="option"
                          aria-selected={destination === d.id}
                          onClick={() => { setDestination(d.id); setDropdownOpen(false); setSearchQuery(''); }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition-colors
                            hover:bg-white/5 focus-visible:outline-none focus-visible:bg-white/10
                            ${destination === d.id ? 'bg-purple-500/10 text-purple-300' : 'text-gray-300'}`}
                        >
                          <span>{d.label}</span>
                          <span className="text-[10px] text-gray-600">{d.zone}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Accessibility Toggles */}
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">Route Preference</p>
              <div className="flex gap-2">
                {[
                  { id: 'standard', label: 'Standard', icon: Route },
                  { id: 'wheelchair', label: 'Wheelchair', icon: Accessibility },
                  { id: 'visual', label: 'Visual Assist', icon: Eye },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setAccessMode(mode.id);
                      if (destination) {
                        setRoute({
                          steps: SIMULATED_ROUTES[mode.id] || SIMULATED_ROUTES.standard,
                          walkTime: walkTimes[mode.id] || 5,
                          distance: `${Math.round(150 + Math.random() * 200)}m`,
                        });
                      }
                    }}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[10px] font-medium transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                      ${accessMode === mode.id
                        ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                        : 'border-white/10 bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300'
                      }`}
                    aria-pressed={accessMode === mode.id}
                    aria-label={`${mode.label} route`}
                  >
                    <mode.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Find Route Button */}
            <button
              onClick={handleFindRoute}
              disabled={!destination || routeLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white
                shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Generate route with AI"
            >
              {routeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Generating Route…
                </>
              ) : (
                <>
                  <Footprints className="h-4 w-4" aria-hidden="true" />
                  Find My Route
                </>
              )}
            </button>
          </GlassCard>

          {/* Route Results */}
          {route && (
            <GlassCard>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">AI Route</h2>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-purple-400">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {route.walkTime} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Footprints className="h-3 w-3" aria-hidden="true" />
                    {route.distance}
                  </span>
                </div>
              </div>

              <ol className="space-y-3" aria-label="Step by step directions">
                {route.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold
                        ${i === route.steps.length - 1
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-purple-500/20 text-purple-400'}`}
                      >
                        {i + 1}
                      </div>
                      {i < route.steps.length - 1 && (
                        <div className="mt-1 h-full w-px bg-gradient-to-b from-purple-500/30 to-transparent" />
                      )}
                    </div>
                    <p className="pb-3 text-xs leading-relaxed text-gray-300">{step}</p>
                  </li>
                ))}
              </ol>
            </GlassCard>
          )}

          {/* Estimated Walk Times */}
          <GlassCard>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-300">Walk Time Estimates</h2>
            <div className="space-y-2">
              {[
                { label: 'Standard Route', time: `${walkTimes.standard} min`, icon: Route, color: 'text-teal-400' },
                { label: 'Wheelchair Route', time: `${walkTimes.wheelchair} min`, icon: Accessibility, color: 'text-purple-400' },
                { label: 'Visual Assist Route', time: `${walkTimes.visual} min`, icon: Eye, color: 'text-amber-400' },
              ].map(est => (
                <div key={est.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <est.icon className={`h-3.5 w-3.5 ${est.color}`} aria-hidden="true" />
                    <span className="text-xs text-gray-400">{est.label}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{est.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
