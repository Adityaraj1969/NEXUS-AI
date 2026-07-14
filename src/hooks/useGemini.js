import { useState, useCallback, useRef, useEffect } from 'react';
import { geminiClient } from '../services/gemini';

/**
 * @fileoverview React hook wrapping the HybridGeminiClient.
 * Provides loading/error states and request deduplication.
 * @module hooks/useGemini
 */

/**
 * React hook for interacting with the Gemini AI client.
 * Manages loading and error states, and deduplicates concurrent requests.
 *
 * @returns {{
 *   generateInsight: (prompt: string, contextType: string) => Promise<string>,
 *   generateJSON: (prompt: string, contextType: string) => Promise<Object>,
 *   chat: (messages: string, language?: string) => Promise<string>,
 *   isLiveMode: boolean,
 *   loading: boolean,
 *   error: string|null
 * }}
 */
export function useGemini() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(geminiClient.isLiveMode);
  const pendingRef = useRef(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLiveMode(geminiClient.isLiveMode);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Wraps an async AI call with loading/error state management
   * and request deduplication.
   * @param {string} key - Deduplication key
   * @param {Function} fn - Async function to execute
   * @returns {Promise<*>}
   * @private
   */
  const execute = useCallback(async (key, fn) => {
    // Deduplicate: if same key is already in-flight, return that promise
    if (pendingRef.current.has(key)) {
      return pendingRef.current.get(key);
    }

    const promise = (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        return result;
      } catch (err) {
        const message = err?.message || 'An unexpected error occurred';
        setError(message);
        console.error('[useGemini] Error:', message);
        return null;
      } finally {
        setLoading(false);
        pendingRef.current.delete(key);
      }
    })();

    pendingRef.current.set(key, promise);
    return promise;
  }, []);

  /** Generate a text insight */
  const generateInsight = useCallback(
    (prompt, contextType) =>
      execute(`insight:${contextType}:${prompt.slice(0, 50)}`, () =>
        geminiClient.generateInsight(prompt, contextType)
      ),
    [execute]
  );

  /** Generate structured JSON via True JSON Mode */
  const generateJSON = useCallback(
    (prompt, contextType) =>
      execute(`json:${contextType}:${prompt.slice(0, 50)}`, () =>
        geminiClient.generateJSON(prompt, contextType)
      ),
    [execute]
  );

  /** Conversational chat */
  const chat = useCallback(
    (messages, language = 'en') =>
      execute(`chat:${language}:${messages.slice(0, 50)}`, () =>
        geminiClient.chat(messages, language)
      ),
    [execute]
  );

  return {
    generateInsight,
    generateJSON,
    chat,
    isLiveMode,
    loading,
    error,
  };
}
