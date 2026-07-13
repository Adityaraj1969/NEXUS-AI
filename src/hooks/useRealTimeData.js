import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @fileoverview Simulated real-time data feed for NEXUS AI.
 * Generates live-updating crowd density, transport status,
 * energy metrics, and weather data.
 * @module hooks/useRealTimeData
 */

/**
 * Generates a random number between min and max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Simulates crowd patterns that vary with time of day.
 * Builds pre-match, peaks at kickoff, ebbs at halftime.
 * @returns {Object} Crowd density data by zone
 */
function generateCrowdData() {
  const hour = new Date().getHours();
  // Base multiplier simulates match-day pattern
  const multiplier =
    hour < 10 ? 0.2 : hour < 14 ? 0.5 : hour < 17 ? 0.75 : hour < 20 ? 0.95 : 0.6;

  const zones = [
    { id: 'north', name: 'North Stand', capacity: 18000 },
    { id: 'south', name: 'South Stand', capacity: 18000 },
    { id: 'east', name: 'East Stand', capacity: 15000 },
    { id: 'west', name: 'West Stand', capacity: 15000 },
    { id: 'concourseA', name: 'Concourse A', capacity: 5000 },
    { id: 'concourseB', name: 'Concourse B', capacity: 5000 },
    { id: 'gateArea', name: 'Gate Area', capacity: 8000 },
    { id: 'vip', name: 'VIP Section', capacity: 3000 },
  ];

  return zones.map((zone) => {
    const density = Math.min(100, Math.round(multiplier * rand(50, 100)));
    const occupancy = Math.round((density / 100) * zone.capacity);
    return {
      ...zone,
      density,
      occupancy,
      status: density > 85 ? 'critical' : density > 65 ? 'warning' : 'normal',
    };
  });
}

/**
 * Generate simulated transport data.
 * @returns {Object} Transport status
 */
function generateTransportData() {
  return {
    transitLines: [
      { name: 'Metro Blue Line', status: Math.random() > 0.8 ? 'Delayed' : 'On Time', delay: Math.random() > 0.8 ? `${Math.round(rand(3, 12))} min` : '0 min', load: Math.round(rand(40, 95)) },
      { name: 'Express Bus 47', status: Math.random() > 0.7 ? 'Delayed' : 'On Time', delay: Math.random() > 0.7 ? `${Math.round(rand(2, 8))} min` : '0 min', load: Math.round(rand(30, 85)) },
      { name: 'Shuttle Service', status: 'On Time', delay: '0 min', load: Math.round(rand(20, 70)) },
    ],
    parkingAvailable: Math.round(rand(80, 500)),
    parkingTotal: 5000,
    rideshareSurge: +(rand(1.0, 2.2)).toFixed(1),
  };
}

/**
 * Generate simulated energy/sustainability data.
 * @returns {Object} Energy and sustainability metrics
 */
function generateEnergyData() {
  return {
    energyUsage: +(rand(2.1, 4.8)).toFixed(1),     // MWh
    solarOutput: +(rand(0.5, 1.8)).toFixed(1),      // MWh
    carbonFootprint: +(rand(12, 28)).toFixed(1),     // tonnes CO2e
    wasteDiversion: Math.round(rand(60, 82)),        // %
    waterUsage: Math.round(rand(15000, 35000)),      // liters
    temperature: Math.round(rand(18, 32)),           // °C
  };
}

/**
 * Generate simulated weather data.
 * @returns {Object} Weather conditions
 */
function generateWeatherData() {
  const conditions = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Sunny'];
  return {
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    temperature: Math.round(rand(18, 34)),
    humidity: Math.round(rand(30, 75)),
    windSpeed: Math.round(rand(5, 25)),
    uvIndex: Math.round(rand(2, 9)),
    rainProbability: Math.round(rand(0, 40)),
  };
}

/**
 * Hook that provides simulated real-time data updates.
 *
 * @param {Object} [options]
 * @param {number} [options.interval=3000] - Update interval in ms
 * @param {boolean} [options.enabled=true] - Whether data updates are active
 * @returns {{
 *   crowd: Array,
 *   transport: Object,
 *   energy: Object,
 *   weather: Object,
 *   lastUpdated: Date|null,
 *   isUpdating: boolean,
 *   refresh: () => void
 * }}
 */
export function useRealTimeData({ interval = 3000, enabled = true } = {}) {
  const [crowd, setCrowd] = useState(() => generateCrowdData());
  const [transport, setTransport] = useState(() => generateTransportData());
  const [energy, setEnergy] = useState(() => generateEnergyData());
  const [weather, setWeather] = useState(() => generateWeatherData());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const intervalRef = useRef(null);

  const refresh = useCallback(() => {
    setIsUpdating(true);
    setCrowd(generateCrowdData());
    setTransport(generateTransportData());
    setEnergy(generateEnergyData());
    setWeather(generateWeatherData());
    setLastUpdated(new Date());
    // Brief flash for visual feedback
    setTimeout(() => setIsUpdating(false), 300);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(refresh, interval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, refresh]);

  return { crowd, transport, energy, weather, lastUpdated, isUpdating, refresh };
}
