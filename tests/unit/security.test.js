import { describe, it, expect } from 'vitest';
import { sanitize, validateInput, RateLimiter, createAuditLog } from '../../src/lib/security.js';

/**
 * @fileoverview Unit tests for the Security module.
 * Tests DOMPurify sanitization, input validation, rate limiting, and audit logging.
 */

describe('Security Module', () => {
  describe('sanitize()', () => {
    it('should strip dangerous script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      const clean = sanitize(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Hello');
    });

    it('should strip onclick event handlers', () => {
      const dirty = '<button onclick="alert(1)">Click</button>';
      const clean = sanitize(dirty);
      expect(clean).not.toContain('onclick');
    });

    it('should strip javascript: protocol URLs', () => {
      const dirty = '<a href="javascript:alert(1)">Link</a>';
      const clean = sanitize(dirty);
      expect(clean).not.toContain('javascript:');
    });

    it('should preserve safe HTML', () => {
      const safe = '<p>Welcome to <strong>NEXUS AI</strong></p>';
      const result = sanitize(safe);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('NEXUS AI');
    });

    it('should handle empty input gracefully', () => {
      expect(sanitize('')).toBe('');
      expect(sanitize(null)).toBe('');
      expect(sanitize(undefined)).toBe('');
    });
  });

  describe('validateInput()', () => {
    it('should validate correct language codes', () => {
      expect(validateInput('en', 'languageCode').valid).toBe(true);
      expect(validateInput('es', 'languageCode').valid).toBe(true);
      expect(validateInput('ar', 'languageCode').valid).toBe(true);
    });

    it('should reject invalid language codes', () => {
      expect(validateInput('xx', 'languageCode').valid).toBe(false);
      expect(validateInput('', 'languageCode').valid).toBe(false);
    });

    it('should validate search queries within length limits', () => {
      expect(validateInput('Gate A', 'searchQuery').valid).toBe(true);
      expect(validateInput('', 'searchQuery').valid).toBe(false);
    });

    it('should reject excessively long search queries', () => {
      const longQuery = 'a'.repeat(600);
      expect(validateInput(longQuery, 'searchQuery').valid).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    it('should allow requests within token limit', () => {
      const limiter = new RateLimiter(5, 1);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
    });

    it('should deny requests when tokens exhausted', () => {
      const limiter = new RateLimiter(2, 1);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(true);
      expect(limiter.tryConsume()).toBe(false);
    });
  });

  describe('createAuditLog()', () => {
    it('should return structured log entry with timestamp', () => {
      const log = createAuditLog('USER_INPUT', { query: 'test' });
      expect(log).toHaveProperty('event', 'USER_INPUT');
      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('details');
      expect(log.details.query).toBe('test');
    });
  });
});
