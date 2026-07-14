import DOMPurify from 'dompurify';

/**
 * @fileoverview Security utilities for NEXUS AI platform.
 * Provides HTML sanitization, input validation with allow-list approach,
 * token-bucket rate limiting, and structured audit logging.
 * @module lib/security
 */

/* ───────────────────────── Sanitization ───────────────────────── */

/**
 * Strict DOMPurify configuration — allows only safe inline formatting.
 * @type {Object}
 */
const SANITIZE_CONFIG = Object.freeze({
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'span', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class', 'aria-label', 'role', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus'],
});

/**
 * Sanitize HTML content using DOMPurify with a strict allow-list.
 * @param {string} html — Untrusted HTML string
 * @returns {string} Sanitized HTML safe for rendering
 * @example
 * ```js
 * const safe = sanitize('<script>alert(1)</script><b>Hello</b>');
 * // => '<b>Hello</b>'
 * ```
 */
export function sanitize(html) {
  if (typeof html !== 'string') {return '';}
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

/* ────────────────────── Input Validation ───────────────────── */

/**
 * Allow-list patterns for different input types.
 * @type {Object<string, RegExp>}
 */
const VALIDATION_PATTERNS = Object.freeze({
  /** FIFA 2026 venue ID: 'venue_' followed by 1-3 digits */
  venueId: /^venue_\d{1,3}$/,

  /** Latitude/Longitude pair: e.g. "40.4168,-3.7038" */
  coordinates: /^-?\d{1,3}\.\d{1,8},\s?-?\d{1,3}\.\d{1,8}$/,

  /** ISO 639-1 language code from FIFA's official languages */
  languageCode: /^(en|es|fr|de|ar|pt|ru|ja)$/,

  /** Search query: alphanumeric, spaces, basic punctuation, 1-200 chars */
  searchQuery: /^[\p{L}\p{N}\s.,!?'":\-()]{1,200}$/u,

  /** Zone ID: alphanumeric with underscores, 1-50 chars */
  zoneId: /^[a-zA-Z0-9_]{1,50}$/,

  /** Match ID: 'match_' followed by 1-4 digits */
  matchId: /^match_\d{1,4}$/,

  /** Gate ID: single uppercase letter optionally followed by digit */
  gateId: /^[A-Z]\d?$/,

  /** Generic safe text: no angle brackets or backticks, 1-500 chars */
  safeText: /^[^<>`]{1,500}$/,
});

/**
 * Validate input against an allow-list pattern.
 * @param {string} value — Value to validate
 * @param {'venueId'|'coordinates'|'languageCode'|'searchQuery'|'zoneId'|'matchId'|'gateId'|'safeText'} type — Validation type
 * @returns {{ valid: boolean, error?: string }} Validation result
 * @example
 * ```js
 * const result = validateInput('venue_12', 'venueId');
 * // => { valid: true }
 * ```
 */
export function validateInput(value, type) {
  if (typeof value !== 'string') {
    return { valid: false, error: 'Input must be a string.' };
  }

  const pattern = VALIDATION_PATTERNS[type];
  if (!pattern) {
    return { valid: false, error: `Unknown validation type: "${type}".` };
  }

  if (!pattern.test(value.trim())) {
    return {
      valid: false,
      error: `Input failed "${type}" validation. Value: "${value.slice(0, 50)}${value.length > 50 ? '…' : ''}"`,
    };
  }

  return { valid: true };
}

/* ──────────────────────── Rate Limiter ─────────────────────── */

/** Default bucket capacity */
const DEFAULT_CAPACITY = 10;

/** Default refill rate (tokens per second) */
const DEFAULT_REFILL_RATE = 1;

/**
 * Token-bucket rate limiter for API request throttling.
 *
 * @class
 * @example
 * ```js
 * const limiter = new RateLimiter(10, 1);
 * if (limiter.tryConsume()) {
 *   // proceed with request
 * } else {
 *   // show "slow down" message
 * }
 * ```
 */
export class RateLimiter {
  /**
   * @param {number} [capacity=10] — Maximum tokens in the bucket
   * @param {number} [refillRate=1] — Tokens added per second
   */
  constructor(capacity = DEFAULT_CAPACITY, refillRate = DEFAULT_REFILL_RATE) {
    /** @type {number} */
    this.capacity = capacity;

    /** @type {number} */
    this.tokens = capacity;

    /** @type {number} Tokens added per second */
    this.refillRate = refillRate;

    /** @type {number} Timestamp of last refill (ms) */
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on elapsed time since last refill.
   * @private
   */
  _refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Try to consume one token. Returns true if allowed, false if rate-limited.
   * @param {number} [count=1] — Number of tokens to consume
   * @returns {boolean} Whether the request is allowed
   */
  tryConsume(count = 1) {
    this._refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  /**
   * Get remaining tokens (after refill).
   * @returns {number} Current token count
   */
  get remaining() {
    this._refill();
    return Math.floor(this.tokens);
  }

  /**
   * Reset the bucket to full capacity.
   */
  reset() {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

/* ──────────────────────── Audit Logging ─────────────────────── */

/**
 * Maximum number of audit log entries retained in memory.
 * @type {number}
 */
const MAX_AUDIT_LOG_SIZE = 500;

/**
 * In-memory audit log buffer.
 * @type {Array<Object>}
 */
const auditLog = [];

/**
 * Create a structured audit log entry for security events.
 * Entries are stored in memory and can be exported for analysis.
 *
 * @param {string} event — Event identifier (e.g. 'AUTH_FAILURE', 'INPUT_REJECTED')
 * @param {Object} [details={}] — Additional event metadata
 * @param {string} [details.userId] — Associated user identifier
 * @param {string} [details.source] — Source module or component
 * @param {string} [details.severity] — 'low' | 'medium' | 'high' | 'critical'
 * @returns {Object} The created log entry
 *
 * @example
 * ```js
 * createAuditLog('INPUT_REJECTED', {
 *   source: 'CrowdDensity',
 *   severity: 'medium',
 *   reason: 'Invalid zone ID',
 * });
 * ```
 */
export function createAuditLog(event, details = {}) {
  const entry = {
    id: crypto.randomUUID?.() || `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    event,
    severity: details.severity || 'low',
    source: details.source || 'unknown',
    details: { ...details },
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
  };

  // Remove duplicated fields from nested details
  delete entry.details.severity;
  delete entry.details.source;

  auditLog.push(entry);

  // Trim old entries to prevent memory leak
  if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
    auditLog.splice(0, auditLog.length - MAX_AUDIT_LOG_SIZE);
  }

  // Log high-severity events to console
  if (entry.severity === 'high' || entry.severity === 'critical') {
    console.warn(`[NEXUS Security] ${entry.severity.toUpperCase()}: ${event}`, entry);
  }

  return entry;
}

/**
 * Retrieve a snapshot of the current audit log.
 * @param {number} [limit=50] — Maximum entries to return (most recent first)
 * @returns {Array<Object>} Audit log entries
 */
export function getAuditLog(limit = 50) {
  return auditLog.slice(-limit).reverse();
}

/**
 * Clear all audit log entries (for testing or periodic flush).
 */
export function clearAuditLog() {
  auditLog.length = 0;
}
