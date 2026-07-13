import { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import {
  Accessibility as AccessibilityIcon, Eye, Ear, Brain,
  Users, Dog, AlertTriangle, Volume2, VolumeX,
  MessageSquare, Star, Loader2,
  Navigation, CheckCircle2, Phone, Clock, ArrowRight, Send
} from 'lucide-react';

/** ─── CONSTANTS ─── */
const ACCESS_MODES = [
  { id: 'wheelchair', label: 'Wheelchair', icon: AccessibilityIcon, color: 'text-purple-400' },
  { id: 'visual', label: 'Visual Impairment', icon: Eye, color: 'text-teal-400' },
  { id: 'hearing', label: 'Hearing Impairment', icon: Ear, color: 'text-amber-400' },
  { id: 'sensory', label: 'Sensory Sensitivity', icon: Brain, color: 'text-pink-400' },
];

const SENSORY_ZONES = [
  { name: 'Quiet Room — Level 2, Room 204', calmScore: 9, capacity: 20, available: 12, features: ['Dim lighting', 'Sound dampening', 'Weighted blankets'] },
  { name: 'Meditation Space — Concourse A', calmScore: 8, capacity: 15, available: 8, features: ['Natural sounds', 'Aromatherapy', 'Low-stim'] },
  { name: 'Family Sensory Pod — Section 106', calmScore: 10, capacity: 6, available: 4, features: ['Soundproof', 'Match live stream', 'Adjustable lighting'] },
  { name: 'Low-Stim Viewing — Section 300', calmScore: 7, capacity: 50, available: 22, features: ['Reduced PA volume', 'No pyrotechnics', 'Earplugs available'] },
];

const COMPANION_SEATING = [
  { section: '100A', level: 'Lower Bowl', total: 24, available: 8, type: 'Wheelchair + Companion', location: 'Behind goal — North' },
  { section: '200B', level: 'Mid-Level', total: 18, available: 5, type: 'Wheelchair + Companion', location: 'Sideline — East' },
  { section: '100C', level: 'Lower Bowl', total: 16, available: 3, type: 'Wheelchair + 2 Companions', location: 'Corner — South-East' },
  { section: '300A', level: 'Upper Level', total: 12, available: 12, type: 'Flexible Seating', location: 'Behind goal — South' },
  { section: '150D', level: 'Club Level', total: 8, available: 2, type: 'Premium Accessible', location: 'Midfield — West' },
];

const SERVICE_ANIMAL_AREAS = [
  { name: 'Relief Area — Gate A (Outdoor)', distance: '45m', hours: 'Open all day', surface: 'Grass' },
  { name: 'Relief Area — Concourse B (Indoor)', distance: '80m', hours: 'Open all day', surface: 'Synthetic turf' },
  { name: 'Water Station — Section 108', distance: '30m', hours: 'Match hours', surface: 'N/A' },
  { name: 'Relief Area — Gate E (Outdoor)', distance: '120m', hours: 'Open all day', surface: 'Grass + shade' },
];

const EMERGENCY_ALERTS = [
  { id: 'EA-001', message: 'Elevator Bank C — temporarily out of service. Use Elevator Bank D (50m east) for wheelchair access to Level 2.', severity: 'medium', time: '10 min ago' },
  { id: 'EA-002', message: 'Sign language interpreter available at Guest Services (Gate A) until end of match.', severity: 'info', time: '25 min ago' },
  { id: 'EA-003', message: 'All accessible restrooms operational. Reduced wait times in South Concourse.', severity: 'info', time: '1 hour ago' },
];

const ROUTE_RESULTS = {
  wheelchair: {
    steps: ['Take Elevator Bank D to Level 1', 'Follow wide-access corridor 60m north', 'Accessible ramp at Section 100A', 'Companion seating on your left'],
    time: '7 min', distance: '180m',
  },
  visual: {
    steps: ['Audio beacon guides activated on your device', 'Follow tactile floor path from Gate A', 'Staff escort available at Info Kiosk #3', 'Audio description headset pickup at seat'],
    time: '9 min', distance: '160m',
  },
  hearing: {
    steps: ['Visual alert device available at Guest Services', 'Follow digital signage to Section 200B', 'Captioning display active in your section', 'Emergency alerts via vibration wristband'],
    time: '5 min', distance: '120m',
  },
  sensory: {
    steps: ['Low-traffic route via Service Corridor C', 'Quiet transition zone available at midpoint', 'Reduced-stimulus entrance at Gate D side', 'Sensory kit pickup at your seat'],
    time: '8 min', distance: '150m',
  },
};

const RATING_LABELS = ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

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
 * Accessibility — accessibility center for FIFA World Cup 2026
 * Features: accessible route planner, sensory zones, companion seating, service animal areas,
 * emergency alerts, audio description toggle, and feedback form.
 * @returns {JSX.Element}
 */
export default function Accessibility() {
  const [selectedMode, setSelectedMode] = useState('wheelchair');
  const [routeFrom, setRouteFrom] = useState('Gate A — Main Entrance');
  const [routeTo, setRouteTo] = useState('Section 100A — Accessible Seating');
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [audioDesc, setAudioDesc] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  /** Plan accessible route */
  const handlePlanRoute = useCallback(() => {
    setRouteLoading(true);
    setRouteResult(null);
    setTimeout(() => {
      setRouteResult(ROUTE_RESULTS[selectedMode] || ROUTE_RESULTS.wheelchair);
      setRouteLoading(false);
    }, 1500);
  }, [selectedMode]);

  /** Submit feedback */
  const handleSubmitFeedback = useCallback(() => {
    const cleanText = DOMPurify.sanitize(feedbackText.trim());
    if (!feedbackRating || !cleanText) {return;}

    setFeedbackLoading(true);
    setTimeout(() => {
      setFeedbackSubmitted(true);
      setFeedbackLoading(false);
    }, 1000);
  }, [feedbackRating, feedbackText]);

  /** Reset feedback form */
  const handleResetFeedback = useCallback(() => {
    setFeedbackRating(0);
    setFeedbackText('');
    setFeedbackSubmitted(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-4 md:p-6 lg:p-8" role="main" aria-label="Accessibility Center">
      {/* Header */}
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <AccessibilityIcon className="h-8 w-8 text-purple-400" aria-hidden="true" />
          <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">Accessibility</span> Center
        </h1>
        <p className="mt-1 text-sm text-gray-400">Inclusive experience tools — FIFA World Cup 2026 • Everyone&apos;s Game</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accessible Route Planner */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-purple-300">
              <Navigation className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Accessible Route Planner
            </h2>

            {/* Mode Selection */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACCESS_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    setRouteResult(ROUTE_RESULTS[mode.id] || ROUTE_RESULTS.wheelchair);
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-[11px] font-medium transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                    ${selectedMode === mode.id
                      ? 'border-purple-500/40 bg-purple-500/15 text-purple-300'
                      : 'border-white/10 bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300'
                    }`}
                  aria-pressed={selectedMode === mode.id}
                  aria-label={`${mode.label} route`}
                >
                  <mode.icon className={`h-5 w-5 ${mode.color}`} aria-hidden="true" />
                  {mode.label}
                </button>
              ))}
            </div>

            {/* From/To */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="route-from" className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">From</label>
                <select id="route-from" value={routeFrom} onChange={e => setRouteFrom(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500">
                  <option value="Gate A — Main Entrance" className="bg-gray-900">Gate A — Main Entrance</option>
                  <option value="Gate B — VIP Entrance" className="bg-gray-900">Gate B — VIP Entrance</option>
                  <option value="Parking Lot A" className="bg-gray-900">Parking Lot A</option>
                  <option value="Metro Station Exit" className="bg-gray-900">Metro Station Exit</option>
                </select>
              </div>
              <div>
                <label htmlFor="route-to" className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">To</label>
                <select id="route-to" value={routeTo} onChange={e => setRouteTo(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500">
                  <option value="Section 100A — Accessible Seating" className="bg-gray-900">Section 100A — Accessible Seating</option>
                  <option value="Section 200B — Mid-Level" className="bg-gray-900">Section 200B — Mid-Level</option>
                  <option value="Quiet Room — Level 2" className="bg-gray-900">Quiet Room — Level 2</option>
                  <option value="Guest Services" className="bg-gray-900">Guest Services</option>
                  <option value="Medical Center" className="bg-gray-900">Medical Center</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePlanRoute}
              disabled={routeLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white
                shadow-lg shadow-purple-500/20 transition-all hover:brightness-110
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
              aria-label="Plan accessible route"
            >
              {routeLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Planning Accessible Route…</>
              ) : (
                <><ArrowRight className="h-4 w-4" aria-hidden="true" /> Plan Route</>
              )}
            </button>

            {/* Route Result */}
            {routeResult && (
              <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4" aria-live="polite">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-purple-300">Accessible Route</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {routeResult.time}</span>
                    <span>{routeResult.distance}</span>
                  </div>
                </div>
                <ol className="space-y-2">
                  {routeResult.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">
                        {i + 1}
                      </span>
                      <span className="text-xs text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </GlassCard>

          {/* Sensory-Friendly Zones */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-300">
              <Brain className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Sensory-Friendly Zones
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SENSORY_ZONES.map(zone => (
                <div key={zone.name} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-medium text-white">{zone.name}</h3>
                    <div className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5">
                      <span className="text-[10px] font-bold text-teal-400">{zone.calmScore}/10</span>
                      <span className="text-[9px] text-gray-500">calm</span>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-3 text-[10px] text-gray-400">
                    <span>Capacity: {zone.capacity}</span>
                    <span className={zone.available > 5 ? 'text-emerald-400' : 'text-amber-400'}>
                      {zone.available} available
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {zone.features.map(f => (
                      <span key={f} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-gray-400">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Companion Seating Table */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              <Users className="mr-2 inline-block h-4 w-4 text-purple-400" aria-hidden="true" />
              Companion Seating Availability
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label="Companion seating availability">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Section</th>
                    <th className="pb-2 pr-4 font-medium">Level</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Location</th>
                    <th className="pb-2 pr-4 font-medium text-right">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPANION_SEATING.map(seat => (
                    <tr key={seat.section} className="border-b border-white/5 text-gray-300">
                      <td className="py-2.5 pr-4 font-medium text-white">{seat.section}</td>
                      <td className="py-2.5 pr-4">{seat.level}</td>
                      <td className="py-2.5 pr-4 text-[10px]">{seat.type}</td>
                      <td className="py-2.5 pr-4 text-[10px] text-gray-500">{seat.location}</td>
                      <td className="py-2.5 pr-4 text-right">
                        <span className={`font-bold ${seat.available > 5 ? 'text-emerald-400' : seat.available > 2 ? 'text-amber-400' : 'text-red-400'}`}>
                          {seat.available}/{seat.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Audio Description Toggle */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {audioDesc ? <Volume2 className="h-4 w-4 text-teal-400" aria-hidden="true" /> : <VolumeX className="h-4 w-4 text-gray-500" aria-hidden="true" />}
                <h2 className="text-sm font-semibold text-white">Audio Description</h2>
              </div>
              <button
                onClick={() => setAudioDesc(!audioDesc)}
                role="switch"
                aria-checked={audioDesc}
                aria-label="Toggle audio description"
                className={`relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                  ${audioDesc ? 'bg-teal-500' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform
                  ${audioDesc ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              {audioDesc
                ? 'Audio descriptions of match events and stadium visuals are now broadcasting to your connected device.'
                : 'Enable to receive audio descriptions of live match events, visual displays, and stadium announcements.'}
            </p>
          </GlassCard>

          {/* Service Animal Relief Areas */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-amber-300">
              <Dog className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Service Animal Areas
            </h2>
            <ul className="space-y-2">
              {SERVICE_ANIMAL_AREAS.map(area => (
                <li key={area.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-xs font-medium text-white">{area.name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
                    <span>{area.distance}</span>
                    <span>{area.hours}</span>
                    <span>Surface: {area.surface}</span>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Emergency Accessibility Alerts */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-300">
              <AlertTriangle className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
              Accessibility Alerts
            </h2>
            <ul className="space-y-2" role="log" aria-label="Emergency accessibility alerts">
              {EMERGENCY_ALERTS.map(alert => (
                <li key={alert.id} className={`rounded-xl border p-3 ${
                  alert.severity === 'medium' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5 bg-white/[0.02]'
                }`}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase
                      ${alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-sky-500/20 text-sky-400'}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-gray-600">{alert.time}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300">{alert.message}</p>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Emergency Contact */}
          <GlassCard>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-300">
              <Phone className="mr-2 inline-block h-4 w-4 text-purple-400" aria-hidden="true" />
              Accessibility Assistance
            </h2>
            <div className="space-y-2">
              <a href="tel:+12025551234" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition-all hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                <span>📞 Call Accessibility Desk</span>
                <span className="text-purple-400">+1 (202) 555-1234</span>
              </a>
              <p className="text-[10px] text-gray-600 text-center">Text ASSIST to 2026 for SMS support</p>
            </div>
          </GlassCard>

          {/* Feedback Form */}
          <GlassCard>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              <MessageSquare className="mr-2 inline-block h-4 w-4 text-teal-400" aria-hidden="true" />
              Accessibility Feedback
            </h2>

            {feedbackSubmitted ? (
              <div className="py-4 text-center" aria-live="polite">
                <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-400" aria-hidden="true" />
                <p className="text-sm font-medium text-white">Thank you for your feedback!</p>
                <p className="mt-1 text-xs text-gray-400">Your input helps us improve accessibility for all fans.</p>
                <button
                  onClick={handleResetFeedback}
                  className="mt-3 rounded-lg bg-white/5 px-4 py-2 text-xs text-gray-300 transition-colors hover:bg-white/10
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <div>
                {/* Star Rating */}
                <div className="mb-3">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">Your Rating</p>
                  <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                        role="radio"
                        aria-checked={feedbackRating === star}
                        aria-label={`${star} star — ${RATING_LABELS[star - 1]}`}
                      >
                        <Star className={`h-6 w-6 transition-colors ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                      </button>
                    ))}
                    {feedbackRating > 0 && (
                      <span className="ml-2 text-xs text-gray-400">{RATING_LABELS[feedbackRating - 1]}</span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-3">
                  <label htmlFor="feedback-text" className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                    Comments
                  </label>
                  <textarea
                    id="feedback-text"
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder="Share your accessibility experience…"
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-600
                      focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="mt-0.5 text-right text-[10px] text-gray-600">{feedbackText.length}/500</p>
                </div>

                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackRating || !feedbackText.trim() || feedbackLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white
                    shadow-lg shadow-purple-500/20 transition-all hover:brightness-110
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
                >
                  {feedbackLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</>
                  ) : (
                    <><Send className="h-4 w-4" aria-hidden="true" /> Submit Feedback</>
                  )}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
