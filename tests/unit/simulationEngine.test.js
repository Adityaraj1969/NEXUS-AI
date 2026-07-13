import { describe, it, expect } from 'vitest';
import { simulateResponse } from '../../src/services/simulationEngine.js';

/**
 * @fileoverview Unit tests for the Simulation Engine.
 * Validates all context types return correct data shapes.
 */

describe('SimulationEngine', () => {
  describe('simulateResponse dispatcher', () => {
    it('should return a string for dashboard context', () => {
      const result = simulateResponse('dashboard');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);
    });

    it('should return structured crowd prediction for crowd context', () => {
      const result = simulateResponse('crowd');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('zones');
      expect(result).toHaveProperty('overallDensity');
      expect(result).toHaveProperty('staffRecommendations');
      expect(result).toHaveProperty('alertLevel');
      expect(Array.isArray(result.zones)).toBe(true);
      expect(result.zones.length).toBe(8);
    });

    it('should return zone objects with required fields', () => {
      const result = simulateResponse('crowd');
      result.zones.forEach((zone) => {
        expect(zone).toHaveProperty('zone');
        expect(zone).toHaveProperty('currentDensity');
        expect(zone).toHaveProperty('prediction15min');
        expect(zone).toHaveProperty('prediction30min');
        expect(zone).toHaveProperty('prediction60min');
        expect(zone).toHaveProperty('risk');
        expect(zone.currentDensity).toBeGreaterThanOrEqual(0);
        expect(zone.currentDensity).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high']).toContain(zone.risk);
      });
    });

    it('should return navigation object with steps for navigation context', () => {
      const result = simulateResponse('navigation', 'Gate A');
      expect(result).toHaveProperty('destination');
      expect(result).toHaveProperty('totalDistance');
      expect(result).toHaveProperty('estimatedTime');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('accessibilityNote');
      expect(result).toHaveProperty('nearbyFacilities');
      expect(Array.isArray(result.steps)).toBe(true);
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('should return relevant chat response based on prompt keywords', () => {
      const gateResponse = simulateResponse('chat', 'Where is gate A?');
      expect(gateResponse.toLowerCase()).toContain('gate');

      const matchResponse = simulateResponse('chat', 'What is the next match?');
      expect(matchResponse.toLowerCase()).toContain('match');

      const restroomResponse = simulateResponse('chat', 'I need a restroom');
      expect(restroomResponse.toLowerCase()).toContain('restroom');

      const wheelchairResponse = simulateResponse('chat', 'wheelchair accessibility');
      expect(wheelchairResponse.toLowerCase()).toContain('wheelchair');
    });

    it('should return default response for unknown chat prompts', () => {
      const result = simulateResponse('chat', 'xyzabc123');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);
    });

    it('should return transport data with modes for transport context', () => {
      const result = simulateResponse('transport');
      expect(result).toHaveProperty('recommendedDeparture');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('modes');
      expect(result).toHaveProperty('parking');
      expect(Array.isArray(result.modes)).toBe(true);
      expect(result.modes.length).toBe(4);
      result.modes.forEach((mode) => {
        expect(mode).toHaveProperty('mode');
        expect(mode).toHaveProperty('duration');
        expect(mode).toHaveProperty('cost');
        expect(mode).toHaveProperty('status');
      });
    });

    it('should return string recommendation for sustainability context', () => {
      const result = simulateResponse('sustainability');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(20);
    });

    it('should return string briefing for operations context', () => {
      const result = simulateResponse('operations');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(20);
    });

    it('should return accessibility object for accessibility context', () => {
      const result = simulateResponse('accessibility');
      expect(result).toHaveProperty('route');
      expect(result).toHaveProperty('sensoryZones');
      expect(result).toHaveProperty('companionSeating');
      expect(result).toHaveProperty('emergencyInfo');
      expect(Array.isArray(result.sensoryZones)).toBe(true);
    });

    it('should return fallback string for unknown context types', () => {
      const result = simulateResponse('unknown_context');
      expect(typeof result).toBe('string');
      expect(result).toContain('NEXUS AI Simulation');
    });
  });

  describe('Data variance', () => {
    it('should produce varying crowd predictions on successive calls', () => {
      const result1 = simulateResponse('crowd');
      const result2 = simulateResponse('crowd');
      // At least some zone densities should differ
      const densities1 = result1.zones.map((z) => z.currentDensity);
      const densities2 = result2.zones.map((z) => z.currentDensity);
      const allSame = densities1.every((d, i) => d === densities2[i]);
      expect(allSame).toBe(false);
    });
  });
});
