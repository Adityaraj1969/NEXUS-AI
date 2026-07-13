import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users, Activity, AlertTriangle, Star, MapPin, MessageSquare,
  Bus, RefreshCw, Clock, Shield, Wifi, Zap, ChevronRight,
  TrendingUp, TrendingDown, Building2
} from 'lucide-react';

/** ─── CONSTANTS ─── */
const BRIEFING_REFRESH_MS = 60_000;
const ALERT_SEVERITY_STYLES = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  info: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

const VENUE_STATUS = {
  operational: 'bg-emerald-500/20 text-emerald-400',
  caution: 'bg-yellow-500/20 text-yellow-400',
  alert: 'bg-red-500/20 text-red-400',
};

/** ─── SIMULATED DATA GENERATORS ─── */
function generateAttendanceData() {
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - (23 - i) * 3_600_000);
    const base = i < 8 ? 5000 : i < 14 ? 35000 + Math.random() * 20000
      : i < 20 ? 55000 + Math.random() * 15000 : 40000 - Math.random() * 10000;
    return {
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      attendance: Math.round(base + Math.random() * 3000),
      capacity: 80000,
    };
  });
}

function generateAlerts() {
  return [
    { id: 'ALT-001', message: 'Gate B queue exceeding 15-min wait threshold', severity: 'high', time: '2 min ago', zone: 'Gate B' },
    { id: 'ALT-002', message: 'Medical team dispatched to Section 214', severity: 'critical', time: '5 min ago', zone: 'Section 214' },
    { id: 'ALT-003', message: 'Concession stand #7 running low on beverages', severity: 'medium', time: '8 min ago', zone: 'Concourse C' },
    { id: 'ALT-004', message: 'VIP parking lot at 92% capacity', severity: 'medium', time: '12 min ago', zone: 'Lot V1' },
    { id: 'ALT-005', message: 'WiFi throughput stable across all zones', severity: 'info', time: '15 min ago', zone: 'All Zones' },
  ];
}

function generateVenues() {
  return [
    { name: 'MetLife Stadium', city: 'East Rutherford, NJ', attendance: 72400, capacity: 82500, status: 'operational', match: 'USA vs Brazil — Semi-Final' },
    { name: 'SoFi Stadium', city: 'Los Angeles, CA', attendance: 68200, capacity: 70240, status: 'caution', match: 'Germany vs Argentina — QF' },
    { name: 'AT&T Stadium', city: 'Arlington, TX', attendance: 45100, capacity: 80000, status: 'operational', match: 'Pre-match Setup' },
    { name: 'Estadio Azteca', city: 'Mexico City, MX', attendance: 81300, capacity: 87523, status: 'operational', match: 'Mexico vs France — QF' },
  ];
}

const AI_BRIEFINGS = [
  'Overall stadium operations are running at optimal capacity with 72,400 fans currently in attendance at MetLife Stadium for the USA vs Brazil semi-final. Gate B is experiencing elevated queue times — crowd management has been notified and additional staff are being deployed.',
  'Fan satisfaction scores have risen 4.2% this quarter, reaching an all-time high of 94.7% across all FIFA 2026 venues. One medical incident in Section 214 is being handled by on-site staff with no further escalation required.',
  'Real-time analytics show a 12% increase in concession spending compared to the quarter-final stage, with mobile ordering accounting for 68% of all transactions. Transportation systems are operating on schedule with metro service extended until midnight.',
];

/**
 * GlassCard — reusable glassmorphism container
 * @param {{ children: React.ReactNode, className?: string, role?: string, ariaLabel?: string }} props
 */
function GlassCard({ children, className = '', role, ariaLabel }) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl
        shadow-lg shadow-black/10 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * MetricCard — single KPI metric display
 * @param {{ title: string, value: string|number, icon: React.ElementType, trend?: number, trendLabel?: string, color?: string }} props
 */
function MetricCard({ title, value, icon: Icon, trend, trendLabel = '', color = 'text-purple-400' }) {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  return (
    <GlassCard role="status" ariaLabel={`${title}: ${value}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendIcon className="h-3 w-3" aria-hidden="true" />
              <span>{isPositive ? '+' : ''}{trend}% {trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl bg-white/5 p-2.5 ${color}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </GlassCard>
  );
}

/**
 * SeverityBadge — colored badge for alert severity
 * @param {{ severity: string }} props
 */
function SeverityBadge({ severity }) {
  const style = ALERT_SEVERITY_STYLES[severity] || ALERT_SEVERITY_STYLES.info;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {severity}
    </span>
  );
}

const DASHBOARD_T = {
  en: { cmd: "Command", dash: "Dashboard", liveOverview: "Live Operations Overview", totalAtt: "Total Attendance", avgDens: "Avg Crowd Density", activeAlt: "Active Alerts", fanSat: "Fan Satisfaction", briefing: "AI Executive Briefing", liveAtt: "Live Attendance", venues: "Venue Status", recentAlt: "Recent Alerts", quickAct: "Quick Actions", map: "View Crowd Map", concierge: "Open Concierge", transport: "Check Transport" },
  es: { cmd: "Panel", dash: "de Comando", liveOverview: "Operaciones en Vivo", totalAtt: "Asistencia Total", avgDens: "Densidad Media", activeAlt: "Alertas Activas", fanSat: "Satisfacción", briefing: "Informe de IA", liveAtt: "Asistencia", venues: "Estado de Sedes", recentAlt: "Alertas", quickAct: "Acciones Rápidas", map: "Ver Mapa", concierge: "Conserje IA", transport: "Transporte" },
  fr: { cmd: "Tableau", dash: "de Bord", liveOverview: "Opérations en Direct", totalAtt: "Présence Totale", avgDens: "Densité Moyenne", activeAlt: "Alertes Actives", fanSat: "Satisfaction", briefing: "Briefing IA", liveAtt: "Présence", venues: "Statut des Sites", recentAlt: "Alertes", quickAct: "Actions Rapides", map: "Voir Carte", concierge: "Concierge IA", transport: "Transport" },
  de: { cmd: "Kommando", dash: "Zentrale", liveOverview: "Live-Betriebsübersicht", totalAtt: "Gesamtbesucherzahl", avgDens: "Mittlere Dichte", activeAlt: "Aktive Alarme", fanSat: "Zufriedenheit", briefing: "KI-Briefing", liveAtt: "Zuschauer", venues: "Stadionstatus", recentAlt: "Letzte Alarme", quickAct: "Schnellaktionen", map: "Karte ansehen", concierge: "KI-Concierge", transport: "Verkehr" },
  ar: { cmd: "لوحة", dash: "القيادة", liveOverview: "نظرة عامة على العمليات الحية", totalAtt: "إجمالي الحضور", avgDens: "متوسط الكثافة", activeAlt: "تنبيهات نشطة", fanSat: "الرضا", briefing: "موجز الذكاء الاصطناعي", liveAtt: "حضور حي", venues: "حالة الملاعب", recentAlt: "تنبيهات حديثة", quickAct: "إجراءات سريعة", map: "عرض الخريطة", concierge: "الذكاء الاصطناعي", transport: "النقل" },
  pt: { cmd: "Painel", dash: "de Comando", liveOverview: "Operações ao Vivo", totalAtt: "Público Total", avgDens: "Densidade Média", activeAlt: "Alertas Ativos", fanSat: "Satisfação", briefing: "Resumo de IA", liveAtt: "Público Atual", venues: "Status dos Locais", recentAlt: "Alertas Recentes", quickAct: "Ações Rápidas", map: "Ver Mapa", concierge: "Concierge IA", transport: "Transporte" },
  ru: { cmd: "Командная", dash: "Панель", liveOverview: "Обзор Операций", totalAtt: "Всего Зрителей", avgDens: "Средняя Плотность", activeAlt: "Активные Тревоги", fanSat: "Удовлетворенность", briefing: "Сводка ИИ", liveAtt: "Посещаемость", venues: "Статус Объектов", recentAlt: "Последние Тревоги", quickAct: "Быстрые Действия", map: "Карта Толпы", concierge: "ИИ Консьерж", transport: "Транспорт" },
};

/**
 * Dashboard — main overview dashboard for NEXUS AI
 * Displays KPI metrics, AI briefing, live attendance chart, venue status, alerts, and quick actions.
 * @returns {JSX.Element}
 */
export default function Dashboard({ language = 'en' }) {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState(generateAttendanceData);
  const [alerts] = useState(generateAlerts);
  const [venues] = useState(generateVenues);
  const [briefing, setBriefing] = useState(AI_BRIEFINGS[0]);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const briefingIndex = useRef(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  );

  /** Simulate AI briefing refresh */
  const refreshBriefing = useCallback(() => {
    setBriefingLoading(true);
    setTimeout(() => {
      briefingIndex.current = (briefingIndex.current + 1) % AI_BRIEFINGS.length;
      setBriefing(AI_BRIEFINGS[briefingIndex.current]);
      setBriefingLoading(false);
    }, 1200);
  }, []);

  /** Auto-refresh briefing every 60s */
  useEffect(() => {
    const id = setInterval(refreshBriefing, BRIEFING_REFRESH_MS);
    return () => clearInterval(id);
  }, [refreshBriefing]);

  /** Live attendance data tick */
  useEffect(() => {
    const id = setInterval(() => {
      setAttendanceData(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const now = new Date();
        next.push({
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          attendance: Math.min(80000, Math.max(0, last.attendance + Math.round((Math.random() - 0.45) * 1500))),
          capacity: 80000,
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const latestAttendance = attendanceData[attendanceData.length - 1]?.attendance ?? 0;
  const t = DASHBOARD_T[language] || DASHBOARD_T.en;

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 p-4 md:p-6 lg:p-8"
      role="main"
      aria-label="NEXUS AI Dashboard"
    >
      {/* ── Page Header ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          {t.cmd} <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">{t.dash}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          FIFA World Cup 2026 — {t.liveOverview} • {new Date().toLocaleDateString(language === 'en' ? 'en-US' : language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      {/* ── KPI Metrics ── */}
      <section aria-label="Key performance indicators" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title={t.totalAtt} value={latestAttendance.toLocaleString()} icon={Users} trend={3.2} trendLabel="vs last match" color="text-purple-400" />
        <MetricCard title={t.avgDens} value="73.4%" icon={Activity} trend={-1.8} trendLabel="vs 30 min ago" color="text-teal-400" />
        <MetricCard title={t.activeAlt} value={alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} icon={AlertTriangle} trend={-12} trendLabel="vs yesterday" color="text-amber-400" />
        <MetricCard title={t.fanSat} value="94.7%" icon={Star} trend={4.2} trendLabel="this quarter" color="text-yellow-400" />
      </section>

      {/* ── Main Grid: Briefing + Chart ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* AI Executive Briefing */}
        <GlassCard className="lg:col-span-1" role="region" ariaLabel="AI Executive Briefing">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-300">{t.briefing}</h2>
            </div>
            <button
              onClick={refreshBriefing}
              disabled={briefingLoading}
              className="rounded-lg bg-white/5 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50"
              aria-label="Refresh AI briefing"
            >
              <RefreshCw className={`h-4 w-4 ${briefingLoading && !reducedMotion.current ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>

          {briefingLoading ? (
            <div className="space-y-3" aria-live="polite" aria-busy="true">
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-4/6 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-gray-300" aria-live="polite">{briefing}</p>
          )}

          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-500">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Auto-refreshes every 60s • Powered by Gemini AI</span>
          </div>
        </GlassCard>

        {/* Live Attendance Chart */}
        <GlassCard className="lg:col-span-2" role="img" ariaLabel="Live attendance over time chart">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-300">{t.liveAtt}</h2>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              LIVE
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={attendanceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} interval={3} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(17,17,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e7eb' }}
                formatter={(val) => [val.toLocaleString(), 'Attendance']}
              />
              <Area type="monotone" dataKey="attendance" stroke="#a855f7" strokeWidth={2} fill="url(#attendanceGradient)" animationDuration={reducedMotion.current ? 0 : 800} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* ── Bottom Grid: Venues + Alerts + Quick Actions ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Venue Status Grid */}
        <GlassCard className="lg:col-span-2" role="region" ariaLabel="Venue status grid">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">{t.venues}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {venues.map(venue => {
              const pct = Math.round((venue.attendance / venue.capacity) * 100);
              return (
                <div key={venue.name} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-400" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-white">{venue.name}</h3>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${VENUE_STATUS[venue.status]}`}>
                      {venue.status}
                    </span>
                  </div>
                  <p className="mb-1 text-[11px] text-gray-500">{venue.city}</p>
                  <p className="mb-2 text-xs text-gray-400">{venue.match}</p>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${venue.name} capacity`}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-300">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Right Column: Alerts + Quick Actions */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <GlassCard role="log" ariaLabel="Recent alerts feed">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">{t.recentAlt}</h2>
            <ul className="space-y-3">
              {alerts.map(alert => (
                <li key={alert.id} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-[10px] text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-300">{alert.message}</p>
                    <p className="mt-0.5 text-[10px] text-gray-500">Zone: {alert.zone}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard role="navigation" ariaLabel="Quick actions">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">{t.quickAct}</h2>
            <div className="space-y-2">
              {[
                { label: t.map, icon: MapPin, color: 'text-teal-400', route: '/crowd' },
                { label: t.concierge, icon: MessageSquare, color: 'text-purple-400', route: '/concierge' },
                { label: t.transport, icon: Bus, color: 'text-amber-400', route: '/transport' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.route)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left
                    text-sm text-gray-300 transition-all hover:bg-white/[0.08] hover:text-white
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  aria-label={action.label}
                >
                  <action.icon className={`h-4 w-4 ${action.color}`} aria-hidden="true" />
                  <span className="flex-1">{action.label}</span>
                  <ChevronRight className="h-4 w-4 text-gray-600" aria-hidden="true" />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ── Footer Status Bar ── */}
      <footer className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[10px] text-gray-600" aria-label="System status">
        <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> All Systems Operational</span>
        <span>•</span>
        <span>Data Latency: 1.2s</span>
        <span>•</span>
        <span>NEXUS AI v2.0 — FIFA World Cup 2026™</span>
      </footer>
    </main>
  );
}
