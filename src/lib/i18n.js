/**
 * @fileoverview Internationalization (i18n) system for NEXUS AI.
 * Supports 7 FIFA official languages: en, es, fr, de, ar, pt, ru.
 * Provides translation lookup, RTL support, locale-aware formatting.
 * @module lib/i18n
 */

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE CONFIG
   ═══════════════════════════════════════════════════════════════ */

/** Default language */
const DEFAULT_LANG = 'en';

/** Current language (module-level state) */
let currentLanguage = DEFAULT_LANG;

/** Languages that use right-to-left text direction */
const RTL_LANGUAGES = new Set(['ar']);

/** localStorage key for persisted language choice */
const STORAGE_KEY = 'nexus-language';

/* ═══════════════════════════════════════════════════════════════
   TRANSLATIONS — 40+ keys × 7 languages
   ═══════════════════════════════════════════════════════════════ */

/**
 * Translation dictionary. Each key maps to an object of lang → string.
 * @type {Object<string, Object<string, string>>}
 */
const translations = {
  // ── Navigation Labels ──
  'nav.dashboard': {
    en: 'Command Center', es: 'Centro de Mando', fr: 'Centre de Commandement',
    de: 'Kommandozentrale', ar: 'مركز القيادة', pt: 'Centro de Comando', ru: 'Центр управления',
  },
  'nav.crowd': {
    en: 'Crowd Intelligence', es: 'Inteligencia de Multitudes', fr: 'Intelligence des Foules',
    de: 'Crowd-Intelligenz', ar: 'ذكاء الحشود', pt: 'Inteligência de Multidões', ru: 'Анализ толпы',
  },
  'nav.navigation': {
    en: 'Wayfinding', es: 'Orientación', fr: 'Orientation',
    de: 'Wegfindung', ar: 'الملاحة', pt: 'Orientação', ru: 'Навигация',
  },
  'nav.transport': {
    en: 'Transport Hub', es: 'Centro de Transporte', fr: 'Hub Transport',
    de: 'Verkehrszentrale', ar: 'مركز النقل', pt: 'Centro de Transporte', ru: 'Транспортный узел',
  },
  'nav.operations': {
    en: 'Operations', es: 'Operaciones', fr: 'Opérations',
    de: 'Betrieb', ar: 'العمليات', pt: 'Operações', ru: 'Операции',
  },
  'nav.sustainability': {
    en: 'Sustainability', es: 'Sostenibilidad', fr: 'Durabilité',
    de: 'Nachhaltigkeit', ar: 'الاستدامة', pt: 'Sustentabilidade', ru: 'Устойчивость',
  },
  'nav.concierge': {
    en: 'AI Concierge', es: 'Conserje IA', fr: 'Concierge IA',
    de: 'KI-Concierge', ar: 'مساعد الذكاء الاصطناعي', pt: 'Concierge IA', ru: 'ИИ Консьерж',
  },

  // ── Dashboard Metrics ──
  'dashboard.totalAttendance': {
    en: 'Total Attendance', es: 'Asistencia Total', fr: 'Assistance Totale',
    de: 'Gesamtbesucherzahl', ar: 'إجمالي الحضور', pt: 'Presença Total', ru: 'Общая посещаемость',
  },
  'dashboard.activeVenues': {
    en: 'Active Venues', es: 'Sedes Activas', fr: 'Sites Actifs',
    de: 'Aktive Veranstaltungsorte', ar: 'الأماكن النشطة', pt: 'Locais Ativos', ru: 'Активные площадки',
  },
  'dashboard.liveMatches': {
    en: 'Live Matches', es: 'Partidos en Vivo', fr: 'Matchs en Direct',
    de: 'Live-Spiele', ar: 'المباريات المباشرة', pt: 'Jogos ao Vivo', ru: 'Матчи в прямом эфире',
  },
  'dashboard.alertsActive': {
    en: 'Active Alerts', es: 'Alertas Activas', fr: 'Alertes Actives',
    de: 'Aktive Warnungen', ar: 'التنبيهات النشطة', pt: 'Alertas Ativos', ru: 'Активные оповещения',
  },
  'dashboard.crowdDensity': {
    en: 'Crowd Density', es: 'Densidad de Multitud', fr: 'Densité de Foule',
    de: 'Menschendichte', ar: 'كثافة الحشود', pt: 'Densidade da Multidão', ru: 'Плотность толпы',
  },
  'dashboard.energyUsage': {
    en: 'Energy Usage', es: 'Uso de Energía', fr: 'Consommation d\'Énergie',
    de: 'Energieverbrauch', ar: 'استهلاك الطاقة', pt: 'Uso de Energia', ru: 'Энергопотребление',
  },
  'dashboard.aiInsight': {
    en: 'AI Insight', es: 'Perspectiva IA', fr: 'Analyse IA',
    de: 'KI-Einblick', ar: 'رؤية الذكاء الاصطناعي', pt: 'Insight de IA', ru: 'Анализ ИИ',
  },

  // ── Common Phrases ──
  'common.loading': {
    en: 'Loading…', es: 'Cargando…', fr: 'Chargement…',
    de: 'Wird geladen…', ar: 'جارٍ التحميل…', pt: 'Carregando…', ru: 'Загрузка…',
  },
  'common.error': {
    en: 'An error occurred', es: 'Ocurrió un error', fr: 'Une erreur est survenue',
    de: 'Ein Fehler ist aufgetreten', ar: 'حدث خطأ', pt: 'Ocorreu um erro', ru: 'Произошла ошибка',
  },
  'common.retry': {
    en: 'Retry', es: 'Reintentar', fr: 'Réessayer',
    de: 'Wiederholen', ar: 'إعادة المحاولة', pt: 'Tentar novamente', ru: 'Повторить',
  },
  'common.search': {
    en: 'Search', es: 'Buscar', fr: 'Rechercher',
    de: 'Suchen', ar: 'بحث', pt: 'Pesquisar', ru: 'Поиск',
  },
  'common.close': {
    en: 'Close', es: 'Cerrar', fr: 'Fermer',
    de: 'Schließen', ar: 'إغلاق', pt: 'Fechar', ru: 'Закрыть',
  },
  'common.save': {
    en: 'Save', es: 'Guardar', fr: 'Enregistrer',
    de: 'Speichern', ar: 'حفظ', pt: 'Salvar', ru: 'Сохранить',
  },
  'common.cancel': {
    en: 'Cancel', es: 'Cancelar', fr: 'Annuler',
    de: 'Abbrechen', ar: 'إلغاء', pt: 'Cancelar', ru: 'Отмена',
  },
  'common.confirm': {
    en: 'Confirm', es: 'Confirmar', fr: 'Confirmer',
    de: 'Bestätigen', ar: 'تأكيد', pt: 'Confirmar', ru: 'Подтвердить',
  },
  'common.noData': {
    en: 'No data available', es: 'Sin datos disponibles', fr: 'Aucune donnée disponible',
    de: 'Keine Daten verfügbar', ar: 'لا تتوفر بيانات', pt: 'Sem dados disponíveis', ru: 'Данные недоступны',
  },
  'common.lastUpdated': {
    en: 'Last updated', es: 'Última actualización', fr: 'Dernière mise à jour',
    de: 'Zuletzt aktualisiert', ar: 'آخر تحديث', pt: 'Última atualização', ru: 'Последнее обновление',
  },

  // ── Button Labels ──
  'btn.viewDetails': {
    en: 'View Details', es: 'Ver Detalles', fr: 'Voir les Détails',
    de: 'Details anzeigen', ar: 'عرض التفاصيل', pt: 'Ver Detalhes', ru: 'Подробнее',
  },
  'btn.generateReport': {
    en: 'Generate Report', es: 'Generar Informe', fr: 'Générer un Rapport',
    de: 'Bericht erstellen', ar: 'إنشاء تقرير', pt: 'Gerar Relatório', ru: 'Создать отчёт',
  },
  'btn.exportData': {
    en: 'Export Data', es: 'Exportar Datos', fr: 'Exporter les Données',
    de: 'Daten exportieren', ar: 'تصدير البيانات', pt: 'Exportar Dados', ru: 'Экспорт данных',
  },
  'btn.refreshData': {
    en: 'Refresh', es: 'Actualizar', fr: 'Actualiser',
    de: 'Aktualisieren', ar: 'تحديث', pt: 'Atualizar', ru: 'Обновить',
  },
  'btn.selectVenue': {
    en: 'Select Venue', es: 'Seleccionar Sede', fr: 'Sélectionner le Site',
    de: 'Veranstaltungsort wählen', ar: 'اختيار المكان', pt: 'Selecionar Local', ru: 'Выбрать площадку',
  },
  'btn.sendMessage': {
    en: 'Send', es: 'Enviar', fr: 'Envoyer',
    de: 'Senden', ar: 'إرسال', pt: 'Enviar', ru: 'Отправить',
  },
  'btn.planRoute': {
    en: 'Plan Route', es: 'Planificar Ruta', fr: 'Planifier l\'Itinéraire',
    de: 'Route planen', ar: 'تخطيط المسار', pt: 'Planejar Rota', ru: 'Построить маршрут',
  },

  // ── Accessibility Terms ──
  'a11y.highContrast': {
    en: 'High Contrast', es: 'Alto Contraste', fr: 'Contraste Élevé',
    de: 'Hoher Kontrast', ar: 'تباين عالي', pt: 'Alto Contraste', ru: 'Высокий контраст',
  },
  'a11y.largeText': {
    en: 'Large Text', es: 'Texto Grande', fr: 'Grand Texte',
    de: 'Großer Text', ar: 'نص كبير', pt: 'Texto Grande', ru: 'Крупный текст',
  },
  'a11y.reducedMotion': {
    en: 'Reduced Motion', es: 'Movimiento Reducido', fr: 'Mouvement Réduit',
    de: 'Reduzierte Bewegung', ar: 'حركة مخفضة', pt: 'Movimento Reduzido', ru: 'Сниженная анимация',
  },
  'a11y.screenReader': {
    en: 'Screen Reader Mode', es: 'Modo Lector de Pantalla', fr: 'Mode Lecteur d\'Écran',
    de: 'Bildschirmleser-Modus', ar: 'وضع قارئ الشاشة', pt: 'Modo Leitor de Tela', ru: 'Режим чтения с экрана',
  },
  'a11y.settings': {
    en: 'Accessibility Settings', es: 'Configuración de Accesibilidad', fr: 'Paramètres d\'Accessibilité',
    de: 'Barrierefreiheit', ar: 'إعدادات إمكانية الوصول', pt: 'Configurações de Acessibilidade', ru: 'Настройки доступности',
  },
  'a11y.wheelchairAccess': {
    en: 'Wheelchair Accessible', es: 'Accesible en Silla de Ruedas', fr: 'Accessible en Fauteuil Roulant',
    de: 'Rollstuhlgerecht', ar: 'متاح لذوي الكراسي المتحركة', pt: 'Acessível para Cadeirantes', ru: 'Доступно для инвалидных колясок',
  },
  'a11y.audioDescription': {
    en: 'Audio Description', es: 'Audiodescripción', fr: 'Audiodescription',
    de: 'Audiobeschreibung', ar: 'وصف صوتي', pt: 'Audiodescrição', ru: 'Аудиоописание',
  },

  // ── Status Labels ──
  'status.live': {
    en: 'LIVE', es: 'EN VIVO', fr: 'EN DIRECT',
    de: 'LIVE', ar: 'مباشر', pt: 'AO VIVO', ru: 'ПРЯМОЙ ЭФИР',
  },
  'status.upcoming': {
    en: 'Upcoming', es: 'Próximamente', fr: 'À venir',
    de: 'Bevorstehend', ar: 'قادم', pt: 'Em breve', ru: 'Предстоящий',
  },
  'status.completed': {
    en: 'Completed', es: 'Finalizado', fr: 'Terminé',
    de: 'Abgeschlossen', ar: 'مكتمل', pt: 'Finalizado', ru: 'Завершён',
  },
  'status.normal': {
    en: 'Normal', es: 'Normal', fr: 'Normal',
    de: 'Normal', ar: 'طبيعي', pt: 'Normal', ru: 'Норма',
  },
  'status.warning': {
    en: 'Warning', es: 'Advertencia', fr: 'Avertissement',
    de: 'Warnung', ar: 'تحذير', pt: 'Aviso', ru: 'Предупреждение',
  },
  'status.critical': {
    en: 'Critical', es: 'Crítico', fr: 'Critique',
    de: 'Kritisch', ar: 'حرج', pt: 'Crítico', ru: 'Критический',
  },

  // ── Concierge / Chat ──
  'chat.placeholder': {
    en: 'Ask about venues, schedules, or directions…', es: 'Pregunte sobre sedes, horarios o direcciones…',
    fr: 'Posez vos questions sur les sites, horaires ou itinéraires…',
    de: 'Fragen zu Veranstaltungsorten, Zeitplänen oder Wegbeschreibungen…',
    ar: 'اسأل عن الأماكن أو الجداول أو الاتجاهات…',
    pt: 'Pergunte sobre locais, horários ou direções…',
    ru: 'Спросите о площадках, расписании или маршрутах…',
  },
  'chat.welcome': {
    en: 'Welcome to NEXUS AI Concierge! How can I help you today?',
    es: '¡Bienvenido al Conserje NEXUS IA! ¿En qué puedo ayudarle hoy?',
    fr: 'Bienvenue au Concierge NEXUS IA ! Comment puis-je vous aider aujourd\'hui ?',
    de: 'Willkommen beim NEXUS KI-Concierge! Wie kann ich Ihnen heute helfen?',
    ar: 'مرحبًا بك في مساعد NEXUS الذكي! كيف يمكنني مساعدتك اليوم؟',
    pt: 'Bem-vindo ao Concierge NEXUS IA! Como posso ajudar você hoje?',
    ru: 'Добро пожаловать в NEXUS ИИ Консьерж! Чем я могу вам помочь?',
  },
};

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════ */

/**
 * Translate a key to the current language.
 * Falls back to English, then to the raw key if not found.
 * @param {string} key — Dot-notation translation key (e.g. 'nav.dashboard')
 * @param {Object} [vars] — Optional interpolation variables ({{name}} syntax)
 * @returns {string} Translated string
 *
 * @example
 * ```js
 * t('nav.dashboard'); // => 'Command Center' (in English)
 * ```
 */
export function t(key, vars) {
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key;
  }

  let text = entry[currentLanguage] || entry[DEFAULT_LANG] || key;

  // Simple interpolation: replace {{varName}} with vars.varName
  if (vars && typeof vars === 'object') {
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), String(value));
    });
  }

  return text;
}

/**
 * Get current language code.
 * @returns {string} ISO 639-1 language code
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Set the active language. Applies RTL direction for Arabic,
 * persists to localStorage, and dispatches a custom event.
 * @param {string} code — ISO 639-1 language code
 * @throws {Error} If the code is not supported
 *
 * @example
 * ```js
 * setLanguage('ar'); // switches to Arabic, enables RTL
 * ```
 */
export function setLanguage(code) {
  const supported = ['en', 'es', 'fr', 'de', 'ar', 'pt', 'ru'];
  if (!supported.includes(code)) {
    throw new Error(`[i18n] Unsupported language code: "${code}". Supported: ${supported.join(', ')}`);
  }

  currentLanguage = code;

  // Persist choice
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch { /* storage unavailable */ }

  // Apply direction to document
  const dir = getDirection();
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', code);

  // Notify listeners
  window.dispatchEvent(
    new CustomEvent('nexus-language-change', { detail: { language: code, direction: dir } })
  );
}

/**
 * Get text direction for the current language.
 * @returns {'ltr'|'rtl'} Text direction
 */
export function getDirection() {
  return RTL_LANGUAGES.has(currentLanguage) ? 'rtl' : 'ltr';
}

/**
 * Format a number according to the current locale.
 * @param {number} num — Number to format
 * @param {Object} [options] — Intl.NumberFormat options
 * @returns {string} Formatted number string
 *
 * @example
 * ```js
 * setLanguage('de');
 * formatNumber(1234567.89); // => '1.234.567,89'
 * ```
 */
export function formatNumber(num, options = {}) {
  const localeMap = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    ar: 'ar-SA', pt: 'pt-BR', ru: 'ru-RU',
  };
  const locale = localeMap[currentLanguage] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch {
    return String(num);
  }
}

/**
 * Format a date according to the current locale.
 * @param {Date|string|number} date — Date value
 * @param {Object} [options] — Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 *
 * @example
 * ```js
 * setLanguage('fr');
 * formatDate(new Date()); // => '6 juill. 2026'
 * ```
 */
export function formatDate(date, options = {}) {
  const localeMap = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    ar: 'ar-SA', pt: 'pt-BR', ru: 'ru-RU',
  };
  const locale = localeMap[currentLanguage] || 'en-US';

  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  try {
    return new Intl.DateTimeFormat(locale, { ...defaults, ...options }).format(new Date(date));
  } catch {
    return String(date);
  }
}

/**
 * Format a time according to the current locale.
 * @param {Date|string|number} date — Date value
 * @param {Object} [options] — Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export function formatTime(date, options = {}) {
  const localeMap = {
    en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
    ar: 'ar-SA', pt: 'pt-BR', ru: 'ru-RU',
  };
  const locale = localeMap[currentLanguage] || 'en-US';

  const defaults = {
    hour: '2-digit',
    minute: '2-digit',
  };

  try {
    return new Intl.DateTimeFormat(locale, { ...defaults, ...options }).format(new Date(date));
  } catch {
    return String(date);
  }
}

/**
 * Get all available translation keys.
 * @returns {string[]} Array of translation keys
 */
export function getTranslationKeys() {
  return Object.keys(translations);
}

/**
 * Check if a translation key exists.
 * @param {string} key — Translation key
 * @returns {boolean}
 */
export function hasTranslation(key) {
  return key in translations;
}

/* ── Initialize from persisted preference ── */
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['en', 'es', 'fr', 'de', 'ar', 'pt', 'ru'].includes(stored)) {
    currentLanguage = stored;
    document.documentElement.setAttribute('dir', getDirection());
    document.documentElement.setAttribute('lang', stored);
  }
} catch { /* SSR or storage unavailable */ }
