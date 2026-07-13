/**
 * @fileoverview NEXUS AI platform constants — FIFA World Cup 2026 venues,
 * match schedule, alert thresholds, chart colors, zone definitions,
 * and feature flags. All venue data reflects real-world 2026 host cities.
 * @module lib/constants
 */

/* ═══════════════════════════════════════════════════════════════
   FIFA WORLD CUP 2026 — 16 HOST VENUES
   Real data: stadium names, cities, countries, capacities, coordinates
   ═══════════════════════════════════════════════════════════════ */

/**
 * All 16 FIFA World Cup 2026 host venues with real-world data.
 * @type {Array<Object>}
 */
export const VENUES = Object.freeze([
  {
    id: 'venue_1',
    name: 'MetLife Stadium',
    city: 'East Rutherford',
    state: 'New Jersey',
    country: 'USA',
    capacity: 82500,
    coordinates: { lat: 40.8128, lng: -74.0742 },
    timezone: 'America/New_York',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Prayer Room', 'Baby Care'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    sections: { lower: 36, mezzanine: 20, upper: 30 },
    hostCity: 'New York / New Jersey',
    notes: 'FIFA World Cup 2026 Final venue',
  },
  {
    id: 'venue_2',
    name: 'SoFi Stadium',
    city: 'Inglewood',
    state: 'California',
    country: 'USA',
    capacity: 70240,
    coordinates: { lat: 33.9535, lng: -118.3392 },
    timezone: 'America/Los_Angeles',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'YouTube Theater'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: { lower: 30, club: 18, upper: 24 },
    hostCity: 'Los Angeles',
    notes: 'Largest indoor-outdoor venue',
  },
  {
    id: 'venue_3',
    name: 'AT&T Stadium',
    city: 'Arlington',
    state: 'Texas',
    country: 'USA',
    capacity: 80000,
    coordinates: { lat: 32.7473, lng: -97.0945 },
    timezone: 'America/Chicago',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Art Gallery'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    sections: { lower: 32, mezzanine: 16, upper: 28 },
    hostCity: 'Dallas',
    notes: 'Retractable roof, world\'s largest column-free interior',
  },
  {
    id: 'venue_4',
    name: 'NRG Stadium',
    city: 'Houston',
    state: 'Texas',
    country: 'USA',
    capacity: 72220,
    coordinates: { lat: 29.6847, lng: -95.4107 },
    timezone: 'America/Chicago',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: { lower: 28, club: 12, upper: 24 },
    hostCity: 'Houston',
    notes: 'First NFL stadium with retractable roof',
  },
  {
    id: 'venue_5',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    state: 'Georgia',
    country: 'USA',
    capacity: 71000,
    coordinates: { lat: 33.7553, lng: -84.4006 },
    timezone: 'America/New_York',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', '360° Halo Board'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    sections: { lower: 32, club: 14, upper: 26 },
    hostCity: 'Atlanta',
    notes: 'LEED Platinum certified, unique retractable oculus roof',
  },
  {
    id: 'venue_6',
    name: 'Hard Rock Stadium',
    city: 'Miami Gardens',
    state: 'Florida',
    country: 'USA',
    capacity: 64767,
    coordinates: { lat: 25.958, lng: -80.2389 },
    timezone: 'America/New_York',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Canopy Shade'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: { lower: 30, club: 12, upper: 22 },
    hostCity: 'Miami',
    notes: 'Innovative rooftop canopy for shade and rain protection',
  },
  {
    id: 'venue_7',
    name: 'Lincoln Financial Field',
    city: 'Philadelphia',
    state: 'Pennsylvania',
    country: 'USA',
    capacity: 69176,
    coordinates: { lat: 39.9008, lng: -75.1675 },
    timezone: 'America/New_York',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: { lower: 28, mezzanine: 14, upper: 24 },
    hostCity: 'Philadelphia',
    notes: 'Solar-powered, one of the greenest stadiums in NFL',
  },
  {
    id: 'venue_8',
    name: 'Lumen Field',
    city: 'Seattle',
    state: 'Washington',
    country: 'USA',
    capacity: 68740,
    coordinates: { lat: 47.5952, lng: -122.3316 },
    timezone: 'America/Los_Angeles',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Hawk\'s Nest'],
    gates: ['A', 'B', 'C', 'D', 'E'],
    sections: { lower: 26, club: 12, upper: 24 },
    hostCity: 'Seattle',
    notes: 'Known for record crowd noise levels',
  },
  {
    id: 'venue_9',
    name: 'Levi\'s Stadium',
    city: 'Santa Clara',
    state: 'California',
    country: 'USA',
    capacity: 68500,
    coordinates: { lat: 37.4033, lng: -121.9694 },
    timezone: 'America/Los_Angeles',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Green Roof'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: { lower: 26, club: 14, upper: 22 },
    hostCity: 'San Francisco Bay Area',
    notes: 'LEED Gold certified, extensive solar panel array',
  },
  {
    id: 'venue_10',
    name: 'Arrowhead Stadium',
    city: 'Kansas City',
    state: 'Missouri',
    country: 'USA',
    capacity: 76416,
    coordinates: { lat: 39.0489, lng: -94.484 },
    timezone: 'America/Chicago',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Chiefs Hall of Honor'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    sections: { lower: 30, club: 12, upper: 26 },
    hostCity: 'Kansas City',
    notes: 'Guinness World Record for loudest crowd roar',
  },
  {
    id: 'venue_11',
    name: 'Gillette Stadium',
    city: 'Foxborough',
    state: 'Massachusetts',
    country: 'USA',
    capacity: 65878,
    coordinates: { lat: 42.0909, lng: -71.2643 },
    timezone: 'America/New_York',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Patriot Place'],
    gates: ['A', 'B', 'C', 'D', 'E'],
    sections: { lower: 28, club: 10, upper: 22 },
    hostCity: 'Boston',
    notes: 'Adjacent to Patriot Place shopping and entertainment complex',
  },
  {
    id: 'venue_12',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    state: 'CDMX',
    country: 'Mexico',
    capacity: 87523,
    coordinates: { lat: 19.3029, lng: -99.1505 },
    timezone: 'America/Mexico_City',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Museum', 'Prayer Room'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    sections: { lower: 40, mezzanine: 20, upper: 34 },
    hostCity: 'Mexico City',
    notes: 'Only stadium to host two FIFA World Cup Finals (1970, 1986)',
  },
  {
    id: 'venue_13',
    name: 'Estadio BBVA',
    city: 'Guadalupe',
    state: 'Nuevo León',
    country: 'Mexico',
    capacity: 53500,
    coordinates: { lat: 25.6698, lng: -100.2447 },
    timezone: 'America/Monterrey',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise'],
    gates: ['A', 'B', 'C', 'D', 'E'],
    sections: { lower: 22, club: 10, upper: 18 },
    hostCity: 'Monterrey',
    notes: 'State-of-the-art stadium opened 2015, home of CF Monterrey',
  },
  {
    id: 'venue_14',
    name: 'Estadio Akron',
    city: 'Zapopan',
    state: 'Jalisco',
    country: 'Mexico',
    capacity: 49850,
    coordinates: { lat: 20.6826, lng: -103.4625 },
    timezone: 'America/Mexico_City',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise'],
    gates: ['A', 'B', 'C', 'D'],
    sections: { lower: 20, mezzanine: 8, upper: 16 },
    hostCity: 'Guadalajara',
    notes: 'Volcanic rock-inspired architecture, home of Chivas',
  },
  {
    id: 'venue_15',
    name: 'BMO Field',
    city: 'Toronto',
    state: 'Ontario',
    country: 'Canada',
    capacity: 45736,
    coordinates: { lat: 43.6332, lng: -79.4186 },
    timezone: 'America/Toronto',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Lakeside View'],
    gates: ['A', 'B', 'C', 'D', 'E'],
    sections: { lower: 20, club: 8, upper: 16 },
    hostCity: 'Toronto',
    notes: 'Expansion to 45,000+ for World Cup, waterfront location',
  },
  {
    id: 'venue_16',
    name: 'BC Place',
    city: 'Vancouver',
    state: 'British Columbia',
    country: 'Canada',
    capacity: 54500,
    coordinates: { lat: 49.2768, lng: -123.112 },
    timezone: 'America/Vancouver',
    facilities: ['First Aid', 'Family Zone', 'VIP Lounge', 'Accessible Seating', 'Food Court', 'Merchandise', 'Retractable Roof'],
    gates: ['A', 'B', 'C', 'D', 'E', 'F'],
    sections: { lower: 24, club: 10, upper: 20 },
    hostCity: 'Vancouver',
    notes: 'World\'s largest cable-supported retractable roof',
  },
]);

/* ═══════════════════════════════════════════════════════════════
   MATCH SCHEDULE — Sample Matches
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sample match schedule for demonstration. 12 matches across venues.
 * @type {Array<Object>}
 */
export const MATCH_SCHEDULE = Object.freeze([
  {
    id: 'match_1',
    venueId: 'venue_12',
    homeTeam: 'Mexico',
    awayTeam: 'Canada',
    date: '2026-06-11T18:00:00-05:00',
    stage: 'Group Stage',
    group: 'A',
    status: 'completed',
    score: { home: 2, away: 1 },
  },
  {
    id: 'match_2',
    venueId: 'venue_1',
    homeTeam: 'USA',
    awayTeam: 'Brazil',
    date: '2026-06-12T20:00:00-04:00',
    stage: 'Group Stage',
    group: 'B',
    status: 'completed',
    score: { home: 1, away: 1 },
  },
  {
    id: 'match_3',
    venueId: 'venue_2',
    homeTeam: 'Argentina',
    awayTeam: 'Japan',
    date: '2026-06-13T17:00:00-07:00',
    stage: 'Group Stage',
    group: 'C',
    status: 'completed',
    score: { home: 3, away: 0 },
  },
  {
    id: 'match_4',
    venueId: 'venue_5',
    homeTeam: 'Germany',
    awayTeam: 'France',
    date: '2026-06-14T19:00:00-04:00',
    stage: 'Group Stage',
    group: 'D',
    status: 'completed',
    score: { home: 2, away: 2 },
  },
  {
    id: 'match_5',
    venueId: 'venue_3',
    homeTeam: 'England',
    awayTeam: 'Spain',
    date: '2026-06-15T20:00:00-05:00',
    stage: 'Group Stage',
    group: 'E',
    status: 'live',
    score: { home: 1, away: 0 },
    minute: 67,
  },
  {
    id: 'match_6',
    venueId: 'venue_6',
    homeTeam: 'Portugal',
    awayTeam: 'Netherlands',
    date: '2026-06-16T18:00:00-04:00',
    stage: 'Group Stage',
    group: 'F',
    status: 'upcoming',
    score: null,
  },
  {
    id: 'match_7',
    venueId: 'venue_8',
    homeTeam: 'South Korea',
    awayTeam: 'Italy',
    date: '2026-06-17T16:00:00-07:00',
    stage: 'Group Stage',
    group: 'G',
    status: 'upcoming',
    score: null,
  },
  {
    id: 'match_8',
    venueId: 'venue_15',
    homeTeam: 'Canada',
    awayTeam: 'Belgium',
    date: '2026-06-18T19:00:00-04:00',
    stage: 'Group Stage',
    group: 'H',
    status: 'upcoming',
    score: null,
  },
  {
    id: 'match_9',
    venueId: 'venue_1',
    homeTeam: 'USA',
    awayTeam: 'Germany',
    date: '2026-07-05T20:00:00-04:00',
    stage: 'Round of 16',
    group: null,
    status: 'completed',
    score: { home: 2, away: 1 },
  },
  {
    id: 'match_10',
    venueId: 'venue_12',
    homeTeam: 'Mexico',
    awayTeam: 'Argentina',
    date: '2026-07-06T18:00:00-05:00',
    stage: 'Round of 16',
    group: null,
    status: 'live',
    score: { home: 0, away: 1 },
    minute: 34,
  },
  {
    id: 'match_11',
    venueId: 'venue_1',
    homeTeam: 'TBD',
    awayTeam: 'TBD',
    date: '2026-07-17T20:00:00-04:00',
    stage: 'Semi-Final',
    group: null,
    status: 'upcoming',
    score: null,
  },
  {
    id: 'match_12',
    venueId: 'venue_1',
    homeTeam: 'TBD',
    awayTeam: 'TBD',
    date: '2026-07-19T18:00:00-04:00',
    stage: 'Final',
    group: null,
    status: 'upcoming',
    score: null,
  },
]);

/* ═══════════════════════════════════════════════════════════════
   ZONE DEFINITIONS — Crowd Management
   ═══════════════════════════════════════════════════════════════ */

/**
 * Zone definitions for crowd density management.
 * Each venue is divided into logical zones for monitoring.
 * @type {Array<Object>}
 */
export const CROWD_ZONES = Object.freeze([
  { id: 'zone_north_gate', label: 'North Gate', type: 'entry', maxCapacity: 8000, position: { x: 50, y: 5 } },
  { id: 'zone_south_gate', label: 'South Gate', type: 'entry', maxCapacity: 8000, position: { x: 50, y: 95 } },
  { id: 'zone_east_gate', label: 'East Gate', type: 'entry', maxCapacity: 6000, position: { x: 95, y: 50 } },
  { id: 'zone_west_gate', label: 'West Gate', type: 'entry', maxCapacity: 6000, position: { x: 5, y: 50 } },
  { id: 'zone_lower_bowl', label: 'Lower Bowl', type: 'seating', maxCapacity: 30000, position: { x: 50, y: 50 } },
  { id: 'zone_upper_deck', label: 'Upper Deck', type: 'seating', maxCapacity: 25000, position: { x: 50, y: 35 } },
  { id: 'zone_concourse_a', label: 'Concourse Level A', type: 'concourse', maxCapacity: 5000, position: { x: 30, y: 65 } },
  { id: 'zone_concourse_b', label: 'Concourse Level B', type: 'concourse', maxCapacity: 5000, position: { x: 70, y: 65 } },
  { id: 'zone_vip', label: 'VIP / Hospitality', type: 'hospitality', maxCapacity: 3000, position: { x: 50, y: 20 } },
  { id: 'zone_fan_plaza', label: 'Fan Festival Plaza', type: 'external', maxCapacity: 15000, position: { x: 50, y: 110 } },
  { id: 'zone_parking_north', label: 'Parking Lot North', type: 'parking', maxCapacity: 10000, position: { x: 35, y: -10 } },
  { id: 'zone_parking_south', label: 'Parking Lot South', type: 'parking', maxCapacity: 10000, position: { x: 65, y: 110 } },
  { id: 'zone_transit_hub', label: 'Transit Hub', type: 'transit', maxCapacity: 12000, position: { x: 15, y: 85 } },
  { id: 'zone_medical', label: 'Medical / First Aid', type: 'services', maxCapacity: 200, position: { x: 80, y: 25 } },
]);

/* ═══════════════════════════════════════════════════════════════
   ALERT THRESHOLDS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Alert-level thresholds for the platform.
 * All density values are percentages of zone max capacity.
 * @type {Object}
 */
export const ALERT_THRESHOLDS = Object.freeze({
  crowd: {
    normal: 60,      // ≤ 60 % — green
    elevated: 75,    // 61–75 % — yellow
    high: 85,        // 76–85 % — orange
    critical: 95,    // 86–95 % — red
    emergency: 100,  // > 95 % — flashing red
  },
  temperature: {
    comfortable: 28,  // °C
    warm: 33,
    hot: 38,
    extreme: 42,
  },
  airQuality: {
    good: 50,       // AQI
    moderate: 100,
    unhealthy: 150,
    hazardous: 200,
  },
  noise: {
    normal: 85,     // dB
    elevated: 100,
    high: 115,
    extreme: 130,
  },
  energy: {
    efficient: 70,     // % of target
    normal: 90,
    overuse: 110,
    critical: 130,
  },
});

/**
 * Map alert levels to semantic colors (Tailwind classes).
 * @param {number} value — Current value
 * @param {Object} thresholds — Threshold object with numeric levels
 * @returns {{ level: string, color: string, bgClass: string, textClass: string }}
 */
export function getAlertLevel(value, thresholds) {
  const entries = Object.entries(thresholds);
  let level = entries[0][0];
  let idx = 0;

  for (let i = 0; i < entries.length; i++) {
    if (value > entries[i][1]) {
      level = entries[Math.min(i + 1, entries.length - 1)][0];
      idx = Math.min(i + 1, entries.length - 1);
    }
  }

  const COLOR_MAP = [
    { color: '#22c55e', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
    { color: '#eab308', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' },
    { color: '#f97316', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
    { color: '#ef4444', bgClass: 'bg-red-500/20', textClass: 'text-red-400' },
    { color: '#dc2626', bgClass: 'bg-red-600/30', textClass: 'text-red-300' },
  ];

  const mapping = COLOR_MAP[Math.min(idx, COLOR_MAP.length - 1)];

  return { level, ...mapping };
}

/* ═══════════════════════════════════════════════════════════════
   CHART COLORS & THEME
   ═══════════════════════════════════════════════════════════════ */

/**
 * Chart color palette — FIFA 2026 brand-aligned.
 * @type {Object}
 */
export const CHART_COLORS = Object.freeze({
  primary: '#8b5cf6',    // Purple — brand primary
  secondary: '#14b8a6',  // Teal — brand secondary
  accent: '#f59e0b',     // Gold — brand accent
  success: '#22c55e',
  warning: '#f97316',
  danger: '#ef4444',
  info: '#3b82f6',
  neutral: '#64748b',

  /** Gradient palette for multi-series charts */
  series: [
    '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6',
    '#ef4444', '#22c55e', '#ec4899', '#06b6d4',
    '#84cc16', '#f97316', '#6366f1', '#a855f7',
  ],

  /** Crowd density heatmap gradient stops */
  heatmap: [
    { stop: 0, color: '#22c55e' },
    { stop: 0.3, color: '#84cc16' },
    { stop: 0.5, color: '#eab308' },
    { stop: 0.7, color: '#f97316' },
    { stop: 0.85, color: '#ef4444' },
    { stop: 1, color: '#dc2626' },
  ],
});

/**
 * Recharts-compatible axis/grid styling for dark backgrounds.
 * @type {Object}
 */
export const CHART_THEME = Object.freeze({
  axisStroke: '#475569',
  axisTickFill: '#94a3b8',
  gridStroke: '#1e293b',
  tooltipBg: 'rgba(15, 23, 42, 0.95)',
  tooltipBorder: 'rgba(139, 92, 246, 0.3)',
  fontSize: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
});

/* ═══════════════════════════════════════════════════════════════
   FEATURE FLAGS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Feature flags for progressive rollout.
 * @type {Object<string, boolean>}
 */
export const FEATURE_FLAGS = Object.freeze({
  /** Enable live Gemini API (otherwise simulation only) */
  enableLiveAI: true,
  /** Enable real-time crowd heatmap */
  enableCrowdHeatmap: true,
  /** Enable AR navigation overlay */
  enableARNavigation: false,
  /** Enable biometric authentication */
  enableBiometricAuth: false,
  /** Enable multi-language support */
  enableI18n: true,
  /** Enable sustainability dashboard */
  enableSustainability: true,
  /** Enable predictive crowd modeling */
  enablePredictiveModeling: true,
  /** Enable staff dispatch automation */
  enableAutoDispatch: true,
  /** Show dev tools / debug panel */
  enableDevTools: import.meta.env.DEV,
  /** Enable WebSocket real-time feeds (vs polling) */
  enableWebSocket: false,
  /** Enable offline mode with service worker */
  enableOfflineMode: false,
  /** Enable voice commands for concierge */
  enableVoiceCommands: false,
});

/* ═══════════════════════════════════════════════════════════════
   TRANSPORT MODES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Available transport modes for journey planning.
 * @type {Array<Object>}
 */
export const TRANSPORT_MODES = Object.freeze([
  { id: 'metro', label: 'Metro / Subway', icon: 'Train', color: '#3b82f6', avgSpeed: 35 },
  { id: 'bus', label: 'Shuttle Bus', icon: 'Bus', color: '#22c55e', avgSpeed: 20 },
  { id: 'rideshare', label: 'Rideshare', icon: 'Car', color: '#f59e0b', avgSpeed: 25 },
  { id: 'walk', label: 'Walking', icon: 'Footprints', color: '#8b5cf6', avgSpeed: 5 },
  { id: 'bike', label: 'Bike / E-Scooter', icon: 'Bike', color: '#14b8a6', avgSpeed: 15 },
  { id: 'accessible', label: 'Accessible Transport', icon: 'Accessibility', color: '#ec4899', avgSpeed: 18 },
]);

/* ═══════════════════════════════════════════════════════════════
   SUSTAINABILITY METRICS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sustainability metric definitions.
 * @type {Array<Object>}
 */
export const SUSTAINABILITY_METRICS = Object.freeze([
  { id: 'energy', label: 'Energy Consumption', unit: 'MWh', icon: 'Zap', target: 45, color: '#f59e0b' },
  { id: 'water', label: 'Water Usage', unit: 'm³', icon: 'Droplets', target: 1200, color: '#3b82f6' },
  { id: 'waste', label: 'Waste Diverted', unit: '%', icon: 'Recycle', target: 90, color: '#22c55e' },
  { id: 'carbon', label: 'Carbon Offset', unit: 'tonnes CO₂', icon: 'Leaf', target: 500, color: '#14b8a6' },
  { id: 'solar', label: 'Solar Generation', unit: 'kWh', icon: 'Sun', target: 8000, color: '#eab308' },
  { id: 'transit', label: 'Public Transit Usage', unit: '%', icon: 'Train', target: 75, color: '#8b5cf6' },
]);

/* ═══════════════════════════════════════════════════════════════
   MISCELLANEOUS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Data refresh intervals (ms).
 * @type {Object}
 */
export const REFRESH_INTERVALS = Object.freeze({
  crowdDensity: 3_000,
  transportStatus: 5_000,
  energyMetrics: 10_000,
  weatherData: 60_000,
  matchEvents: 2_000,
  dashboardSummary: 15_000,
});

/**
 * FIFA 2026 supported languages.
 * @type {Array<Object>}
 */
export const SUPPORTED_LANGUAGES = Object.freeze([
  { code: 'en', label: 'English', nativeLabel: 'English', direction: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', direction: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', direction: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', direction: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', direction: 'rtl' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', direction: 'ltr' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', direction: 'ltr' },
]);

/**
 * Module definitions for navigation.
 * @type {Array<Object>}
 */
export const MODULES = Object.freeze([
  { id: 'dashboard', label: 'Command Center', icon: 'LayoutDashboard', path: '/' },
  { id: 'crowd', label: 'Crowd Intelligence', icon: 'Users', path: '/crowd' },
  { id: 'navigation', label: 'Wayfinding', icon: 'Map', path: '/navigation' },
  { id: 'transport', label: 'Transport Hub', icon: 'Train', path: '/transport' },
  { id: 'operations', label: 'Operations', icon: 'Cog', path: '/operations' },
  { id: 'sustainability', label: 'Sustainability', icon: 'Leaf', path: '/sustainability' },
  { id: 'concierge', label: 'AI Concierge', icon: 'MessageSquare', path: '/concierge' },
]);
