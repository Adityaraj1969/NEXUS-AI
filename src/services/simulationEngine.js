/**
 * @fileoverview High-fidelity Simulation Engine for NEXUS AI.
 * Generates realistic, context-aware responses for all 7 modules
 * when the live Gemini API is unavailable or rate-limited.
 * @module services/simulationEngine
 */

/** Seeded pseudo-random for reproducible but varied output */
let _seed = Date.now();
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}

/** Pick a random item from an array */
function pick(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}

/** Generate a random integer between min and max (inclusive) */
function randInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

// ──────────────────────────────────────────────
// BRIEFING / DASHBOARD SIMULATIONS
// ──────────────────────────────────────────────
const EXECUTIVE_BRIEFINGS = [
  'Gate C ingress rate has increased 34% in the last 10 minutes, suggesting a late-arriving fan surge from the Metro Blue Line. Recommend opening auxiliary screening lane C-3 and redirecting overflow to Gate D.',
  'Concession cluster North-7 is experiencing a 22-minute average wait time, well above the 8-minute target. Suggest activating mobile vendor units in Sections 201-205 to redistribute demand.',
  'Crowd density in the East Stand lower bowl has reached 4.2 people/m², approaching the 4.5 caution threshold. Stewards in zones E1-E4 should begin gentle crowd spreading protocols.',
  'Weather radar shows a 15°C temperature drop expected in 45 minutes. HVAC systems in covered zones should pre-warm by 3°C, and outdoor merchandise vendors should prepare rain cover deployment.',
  'Medical incident rate is 40% below historical average for this match phase. Current staffing levels are optimal; consider redeploying one medical unit from Section 100 to the fan festival perimeter.',
  'Transportation data indicates 62% of fans arrived via public transit today, up from 48% at the previous match. Parking lots P3 and P4 have 340 vacant spaces that could be released to rideshare staging.',
  'Waste diversion rate has reached 73%, exceeding the 65% sustainability target. The composting station near Gate A is nearing capacity; schedule an additional collection run within 20 minutes.',
  'Security screening throughput at Gate F has dropped to 420 fans/hour due to a malfunctioning scanner. Backup unit deployment recommended; current queue wait is estimated at 18 minutes.',
];

const DASHBOARD_INSIGHTS = [
  'Fan satisfaction scores are trending 12% higher than the tournament average, driven by reduced wait times at concessions.',
  'Current attendance is tracking 3% above forecast. Suggest pre-positioning additional crowd management resources for the second half.',
  'Energy consumption is 8% below projected levels due to effective zone-based HVAC management.',
  'Today\'s carbon footprint is on track to be the lowest of the tournament, thanks to the 62% public transit adoption rate.',
];

// ──────────────────────────────────────────────
// CROWD INTELLIGENCE SIMULATIONS
// ──────────────────────────────────────────────
function simulateCrowdPrediction() {
  const zones = ['North Stand', 'South Stand', 'East Stand', 'West Stand', 'Concourse A', 'Concourse B', 'Gate Area', 'VIP Section'];
  const predictions = zones.map((zone) => {
    const current = randInt(40, 95);
    return {
      zone,
      currentDensity: current,
      prediction15min: Math.min(100, current + randInt(-5, 15)),
      prediction30min: Math.min(100, current + randInt(-10, 20)),
      prediction60min: Math.min(100, current + randInt(-15, 10)),
      risk: current > 85 ? 'high' : current > 65 ? 'medium' : 'low',
    };
  });

  const staffRecommendations = [
    { action: `Deploy 3 additional stewards to ${pick(zones)}`, priority: 'high', reason: 'Density approaching caution threshold' },
    { action: `Open auxiliary exit at ${pick(['Gate C', 'Gate D', 'Gate E'])}`, priority: 'medium', reason: 'Projected congestion in 15 minutes' },
    { action: `Activate crowd flow signage in ${pick(['Concourse A', 'Concourse B'])}`, priority: 'low', reason: 'Optimize pedestrian distribution' },
  ];

  return {
    timestamp: new Date().toISOString(),
    zones: predictions,
    overallDensity: Math.round(predictions.reduce((s, z) => s + z.currentDensity, 0) / predictions.length),
    staffRecommendations,
    alertLevel: predictions.some((z) => z.currentDensity > 85) ? 'elevated' : 'normal',
  };
}

// ──────────────────────────────────────────────
// NAVIGATION SIMULATIONS
// ──────────────────────────────────────────────
function simulateNavigation(prompt) {
  const destination = prompt?.toLowerCase() || 'gate a';
  const steps = [
    { step: 1, instruction: 'From your current location, head towards the main concourse.', distance: '50m', time: '1 min' },
    { step: 2, instruction: 'Follow the illuminated signs towards the East corridor.', distance: '120m', time: '2 min' },
    { step: 3, instruction: `Continue straight past Concession Stand #4. Your destination will be on the ${pick(['left', 'right'])}.`, distance: '80m', time: '1.5 min' },
    { step: 4, instruction: `You have arrived at your destination. ${destination.includes('gate') ? 'Present your ticket at the scanner.' : 'Welcome!'}`, distance: '0m', time: '0 min' },
  ];

  return {
    destination: destination.charAt(0).toUpperCase() + destination.slice(1),
    totalDistance: '250m',
    estimatedTime: '4.5 min',
    steps,
    accessibilityNote: 'Wheelchair-accessible route available via Elevator B on Level 1. Add approximately 2 minutes.',
    nearbyFacilities: [
      { name: 'Restroom', distance: '30m', direction: 'Left at the junction' },
      { name: 'First Aid Station', distance: '85m', direction: 'End of East corridor' },
      { name: 'Water Fountain', distance: '15m', direction: 'Adjacent to Concession #4' },
    ],
  };
}

// ──────────────────────────────────────────────
// CHAT / CONCIERGE SIMULATIONS
// ──────────────────────────────────────────────
const CHAT_RESPONSES = {
  gate: 'Gate A is located on the North side of the stadium. From the main entrance, walk straight for approximately 200 meters. Follow the overhead signs marked "Gates A-C". The gate opens 3 hours before kickoff.',
  match: 'The next match is Brazil vs. Germany, kicking off at 7:00 PM local time today at MetLife Stadium. Gates open at 4:00 PM. Current ticket availability: Limited seats in Sections 200-220.',
  restroom: 'The nearest restroom is 40 meters ahead on your right, past Concession Stand #2. Accessible restrooms are available 60 meters ahead near Elevator C. Current wait time: approximately 3 minutes.',
  wheelchair: 'Wheelchair-accessible seating is available in Sections 105, 115, 205, and 315. Accessible routes are marked with blue floor indicators. Companion seating is available adjacent to all accessible locations. Need me to plan a route?',
  food: 'Nearby food options include: 🍕 Stadium Pizzeria (30m, ~8 min wait), 🌮 Taco Junction (50m, ~5 min wait), 🍔 Grill House (75m, ~12 min wait). Halal and kosher options available at Stand #9 on Concourse B.',
  parking: 'Parking lots P1-P3 have available spaces. P1 (closest) has 45 spots remaining. Current shuttle wait from P3: ~6 minutes. Accessible parking is in Lot A with direct ramp access to Gate F.',
  weather: 'Current conditions at the stadium: 24°C / 75°F, partly cloudy, 10% chance of rain. UV index: 6 (moderate). Sunscreen and hats recommended for exposed seating areas.',
  default: 'I can help you with directions, match schedules, accessibility information, transportation, and food options at the FIFA World Cup 2026 venues. What would you like to know?',
};

function simulateChat(prompt) {
  const lower = (prompt || '').toLowerCase();
  if (lower.includes('gate')) {return CHAT_RESPONSES.gate;}
  if (lower.includes('match') || lower.includes('next') || lower.includes('schedule')) {return CHAT_RESPONSES.match;}
  if (lower.includes('restroom') || lower.includes('bathroom') || lower.includes('toilet')) {return CHAT_RESPONSES.restroom;}
  if (lower.includes('wheelchair') || lower.includes('accessible') || lower.includes('disability')) {return CHAT_RESPONSES.wheelchair;}
  if (lower.includes('food') || lower.includes('eat') || lower.includes('drink') || lower.includes('restaurant')) {return CHAT_RESPONSES.food;}
  if (lower.includes('parking') || lower.includes('car') || lower.includes('drive')) {return CHAT_RESPONSES.parking;}
  if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature')) {return CHAT_RESPONSES.weather;}
  return CHAT_RESPONSES.default;
}

// ──────────────────────────────────────────────
// TRANSPORT SIMULATIONS
// ──────────────────────────────────────────────
function simulateTransport() {
  return {
    recommendedDeparture: '5:15 PM',
    reason: 'Optimal departure to avoid peak congestion; 87% chance of arriving 30+ minutes before kickoff.',
    modes: [
      { mode: 'Metro', duration: '28 min', cost: '$2.90', status: 'On Time', crowding: 'Moderate', route: 'Blue Line → Transfer at Central → Red Line' },
      { mode: 'Bus', duration: '42 min', cost: '$2.50', status: '5 min delay', crowding: 'Low', route: 'Route 47 Direct to Stadium' },
      { mode: 'Ride-Share', duration: '18 min', cost: '$24-32', status: 'Surge 1.4x', crowding: 'N/A', route: 'Via Interstate 95' },
      { mode: 'Walking', duration: '35 min', cost: 'Free', status: 'Available', crowding: 'N/A', route: 'Via Riverside Path (scenic, well-lit)' },
    ],
    parking: {
      available: randInt(120, 450),
      total: 5000,
      nearestLot: 'P2 — 350m from Gate B',
      evCharging: `${randInt(5, 15)} spots available`,
    },
  };
}

// ──────────────────────────────────────────────
// SUSTAINABILITY SIMULATIONS
// ──────────────────────────────────────────────
const SUSTAINABILITY_RECOMMENDATIONS = [
  'Ambient temperature is dropping to 19°C. Gemini recommends lowering AC intensity in zones 4-6 to save an estimated 12% energy over the next hour, reducing carbon output by 0.8 tonnes CO₂e.',
  'Solar panel output is at 94% efficiency. Recommend switching lighting in Concourses C and D to solar-powered grid to reduce fossil fuel dependency during the second half.',
  'Waste bin sensors indicate recyclable containers in Section 300 are 85% full. Dispatch collection team within 15 minutes to maintain the 72% diversion rate target.',
  'Post-match transit demand is projected at 38,000 fans within 45 minutes. Recommend staggered exit messaging to reduce idling vehicle emissions by an estimated 2.1 tonnes CO₂e.',
  'Water consumption is 15% below forecast due to moderate temperatures. Recommend reducing fountain flow rates by 20% in low-traffic concourses to conserve 12,000 liters.',
];

function simulateSustainability() {
  return pick(SUSTAINABILITY_RECOMMENDATIONS);
}

// ──────────────────────────────────────────────
// OPERATIONS SIMULATIONS
// ──────────────────────────────────────────────
function simulateOperations() {
  return pick(EXECUTIVE_BRIEFINGS);
}

// ──────────────────────────────────────────────
// ACCESSIBILITY SIMULATIONS
// ──────────────────────────────────────────────
function simulateAccessibility(prompt) {
  return {
    route: 'Wheelchair-accessible route from Gate F to Section 105: Use Ramp R2 → Level 1 Corridor → Elevator E3 to Level 2 → Follow blue tactile guides to Section 105. Total distance: 280m, estimated time: 6 minutes.',
    sensoryZones: [
      { name: 'Quiet Room A', location: 'Level 1, near Gate B', calmScore: 9, features: ['Noise-cancelling', 'Dim lighting', 'Comfortable seating'] },
      { name: 'Sensory Suite B', location: 'Level 3, Section 310', calmScore: 8, features: ['Match view', 'Adjustable volume', 'Fidget tools'] },
    ],
    companionSeating: [
      { section: '105', available: 4, type: 'Wheelchair + Companion' },
      { section: '205', available: 6, type: 'Wheelchair + Companion' },
      { section: '315', available: 2, type: 'Enhanced Accessibility' },
    ],
    emergencyInfo: 'Accessible evacuation routes are marked with illuminated green signs and tactile floor indicators. Assembly point for mobility-impaired fans: Parking Lot A (staffed with trained personnel).',
  };
}

// ──────────────────────────────────────────────
// MAIN DISPATCHER
// ──────────────────────────────────────────────

/**
 * Main simulation dispatcher. Returns context-aware, realistic
 * responses for any module type.
 *
 * @param {string} contextType - Module context identifier
 * @param {string} [prompt=''] - Optional prompt for context-specific responses
 * @returns {*} Simulated response (string or object depending on context)
 */
export function simulateResponse(contextType, prompt = '') {
  // Reset seed per call for variety
  _seed = Date.now() + Math.floor(Math.random() * 10000);

  switch (contextType) {
    case 'dashboard':
      return pick(DASHBOARD_INSIGHTS);

    case 'crowd':
      return simulateCrowdPrediction();

    case 'navigation':
      return simulateNavigation(prompt);

    case 'chat':
      return simulateChat(prompt);

    case 'transport':
      return simulateTransport();

    case 'sustainability':
      return simulateSustainability();

    case 'operations':
      return simulateOperations();

    case 'accessibility':
      return simulateAccessibility(prompt);

    default:
      return `[NEXUS AI Simulation] Insight for "${contextType}": All systems operational. Current venue metrics are within normal parameters across all monitored zones.`;
  }
}
