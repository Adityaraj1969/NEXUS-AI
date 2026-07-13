import { GoogleGenAI } from '@google/genai';
import { simulateResponse } from './simulationEngine.js';

/**
 * @fileoverview HybridGeminiClient — Uses live Gemini API when key is present,
 * falls back to deterministic simulation for zero-config operation.
 * Handles HTTP 429 rate limits gracefully with automatic recovery.
 * @module services/gemini
 */

/** Retry delay after rate-limiting (ms) */
const RATE_LIMIT_RECOVERY_MS = 60_000;

/**
 * HybridGeminiClient — Dual-mode AI client.
 *
 * When `VITE_GEMINI_API_KEY` is set, routes requests to the live
 * Gemini 2.5 Flash model. On 429 or missing key, transparently
 * delegates to the high-fidelity simulation engine so the platform
 * always delivers insights regardless of API availability.
 *
 * @class
 * @example
 * ```js
 * import { geminiClient } from './services/gemini';
 * const insight = await geminiClient.generateInsight(prompt, 'dashboard');
 * ```
 */
export class HybridGeminiClient {
  constructor() {
    /** @type {string|undefined} */
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    /** @type {boolean} Whether a valid API key was detected */
    this.useLiveAI = Boolean(this.apiKey);

    /** @type {boolean} Whether we are currently rate-limited */
    this.rateLimited = false;

    /** @type {number|null} Timer handle for rate-limit recovery */
    this._recoveryTimer = null;

    if (this.useLiveAI) {
      /** @type {GoogleGenAI|undefined} */
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Generate a plain-text insight from a prompt.
   * @param {string} prompt — Natural-language prompt
   * @param {string} contextType — Module context (dashboard | crowd | operations …)
   * @returns {Promise<string>} Generated insight text
   */
  async generateInsight(prompt, contextType) {
    if (this.useLiveAI && !this.rateLimited) {
      try {
        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text;
      } catch (error) {
        return this._handleError(error, contextType, prompt);
      }
    }
    return simulateResponse(contextType, prompt);
  }

  /**
   * Generate structured JSON via Gemini's native JSON mode.
   * @param {string} prompt — Natural-language prompt requesting structured data
   * @param {string} contextType — Module context for simulation fallback
   * @returns {Promise<Object>} Parsed JSON object
   */
  async generateJSON(prompt, contextType) {
    if (this.useLiveAI && !this.rateLimited) {
      try {
        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        return JSON.parse(response.text);
      } catch (error) {
        return this._handleError(error, contextType, prompt);
      }
    }
    return simulateResponse(contextType, prompt);
  }

  /**
   * Conversational chat for the AI Concierge module.
   * @param {string} messages — Concatenated user messages
   * @param {string} [language='en'] — ISO 639-1 language code
   * @returns {Promise<string>} Assistant reply
   */
  async chat(messages, language = 'en') {
    const systemPrompt = [
      'You are NEXUS AI Concierge for FIFA World Cup 2026.',
      `Respond in ${language}.`,
      'Be helpful, concise, and knowledgeable about venues, schedules,',
      'navigation, accessibility, and transportation.',
    ].join(' ');

    if (this.useLiveAI && !this.rateLimited) {
      try {
        const response = await this.client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt + '\n\n' + messages,
        });
        return response.text;
      } catch (error) {
        return this._handleError(error, 'chat', messages);
      }
    }
    return simulateResponse('chat', messages);
  }

  /**
   * Centralized error handler — detects 429 rate limits, dispatches
   * toast notification, and falls back to simulation.
   * @param {Error} error — Caught error
   * @param {string} contextType — Module context
   * @param {string} prompt — Original prompt for simulation
   * @returns {*} Simulated response
   * @private
   */
  _handleError(error, contextType, prompt) {
    const is429 =
      error?.status === 429 || error?.message?.includes('429');

    if (is429) {
      this.rateLimited = true;
      console.warn(
        '[NEXUS AI] API rate limit reached (HTTP 429). Switching to simulation.'
      );

      // Notify the UI via custom event
      window.dispatchEvent(
        new CustomEvent('nexus-toast', {
          detail: {
            message:
              'API rate limit reached. Switched to high-fidelity simulation.',
            type: 'warning',
          },
        })
      );

      // Schedule automatic recovery
      clearTimeout(this._recoveryTimer);
      this._recoveryTimer = setTimeout(() => {
        this.rateLimited = false;
        console.info('[NEXUS AI] Rate-limit cooldown elapsed. Re-enabling live API.');
      }, RATE_LIMIT_RECOVERY_MS);
    } else {
      console.warn(
        '[NEXUS AI] API error, falling back to simulation:',
        error?.message
      );
    }

    return simulateResponse(contextType, prompt);
  }

  /**
   * Whether the client is currently routing to the live Gemini API.
   * @type {boolean}
   */
  get isLiveMode() {
    return this.useLiveAI && !this.rateLimited;
  }
}

/**
 * Singleton HybridGeminiClient instance shared across the application.
 * @type {HybridGeminiClient}
 */
export const geminiClient = new HybridGeminiClient();
