import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * @fileoverview Unit tests for the HybridGeminiClient.
 * Tests live mode, simulation fallback, JSON mode, 429 handling,
 * and rate-limit recovery.
 */

// Mock the GoogleGenAI module
vi.mock('../../src/services/simulationEngine.js', () => ({
  simulateResponse: vi.fn().mockReturnValue('Simulated response'),
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      constructor() {
        this.models = {
          generateContent: vi.fn().mockResolvedValue({ text: 'Mocked AI response' }),
        };
      }
    }
  };
});



describe('HybridGeminiClient', () => {
  let HybridGeminiClient;
  let simulateResponse;

  beforeEach(async () => {
    vi.resetModules();
    const simModule = await import('../../src/services/simulationEngine.js');
    simulateResponse = simModule.simulateResponse;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete import.meta.env.VITE_GEMINI_API_KEY;
  });

  describe('Constructor', () => {
    it('should initialize in simulation mode when no API key is set', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      expect(client.useLiveAI).toBe(false);
      expect(client.isLiveMode).toBe(false);
    });

    it('should initialize in live mode when API key is provided', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'test-key-123';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      expect(client.useLiveAI).toBe(true);
    });

    it('should not be rate limited initially', async () => {
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      expect(client.rateLimited).toBe(false);
    });
  });

  describe('generateInsight', () => {
    it('should return simulated response when no API key', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      const result = await client.generateInsight('test prompt', 'dashboard');
      expect(simulateResponse).toHaveBeenCalledWith('dashboard', 'test prompt');
      expect(result).toBe('Simulated response');
    });
  });

  describe('generateJSON', () => {
    it('should call simulation for JSON when no API key', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      const result = await client.generateJSON('predict crowd', 'crowd');
      expect(simulateResponse).toHaveBeenCalledWith('crowd', 'predict crowd');
    });
  });

  describe('chat', () => {
    it('should return simulated chat response when no API key', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      const result = await client.chat('Where is Gate A?', 'en');
      expect(simulateResponse).toHaveBeenCalledWith('chat', 'Where is Gate A?');
    });
  });

  describe('Error handling', () => {
    it('should set rateLimited flag on 429 error', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'test-key';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      
      // Simulate 429 error
      const error429 = new Error('429 Too Many Requests');
      error429.status = 429;
      client._handleError(error429, 'dashboard', 'test');
      
      expect(client.rateLimited).toBe(true);
    });

    it('should dispatch toast event on 429', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      import.meta.env.VITE_GEMINI_API_KEY = 'test-key';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      
      const error429 = new Error('429');
      error429.status = 429;
      client._handleError(error429, 'dashboard', 'test');
      
      expect(dispatchSpy).toHaveBeenCalled();
      const event = dispatchSpy.mock.calls[0][0];
      expect(event.type).toBe('nexus-toast');
      expect(event.detail.type).toBe('warning');
    });

    it('should fallback to simulation on non-429 errors', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'test-key';
      const mod = await import('../../src/services/gemini.js');
      const client = new mod.HybridGeminiClient();
      
      const result = client._handleError(new Error('Network error'), 'dashboard', 'test');
      expect(client.rateLimited).toBe(false);
      expect(simulateResponse).toHaveBeenCalled();
    });
  });
});
