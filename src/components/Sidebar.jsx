
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Users, MessageCircle, Train, Leaf,
  Accessibility, Settings, Zap, ChevronLeft, ChevronRight,
  Radio
} from 'lucide-react';
import { geminiClient } from '../services/gemini';

/**
 * @fileoverview Main navigation sidebar for NEXUS AI platform.
 * Features gradient branding, active route highlighting,
 * responsive collapse, and AI mode indicator.
 * @module components/Sidebar
 */

const NAV_ITEMS = [
  { path: '/', id: 'dash', icon: LayoutDashboard },
  { path: '/navigator', id: 'nav', icon: Map },
  { path: '/crowd', id: 'crowd', icon: Users },
  { path: '/concierge', id: 'ai', icon: MessageCircle },
  { path: '/transport', id: 'trans', icon: Train },
  { path: '/sustainability', id: 'sust', icon: Leaf },
  { path: '/accessibility', id: 'a11y', icon: Accessibility },
  { path: '/operations', id: 'ops', icon: Settings },
];

const TRANSLATIONS = {
  en: { dash: 'Dashboard', nav: 'Navigator', crowd: 'Crowd Intel', ai: 'AI Concierge', trans: 'Transport', sust: 'Sustainability', a11y: 'Accessibility', ops: 'Operations' },
  es: { dash: 'Tablero', nav: 'Navegador', crowd: 'Multitud', ai: 'Conserje IA', trans: 'Transporte', sust: 'Sostenibilidad', a11y: 'Accesibilidad', ops: 'Operaciones' },
  fr: { dash: 'Tableau de bord', nav: 'Navigateur', crowd: 'Foule', ai: 'Concierge IA', trans: 'Transport', sust: 'Durabilité', a11y: 'Accessibilité', ops: 'Opérations' },
  ar: { dash: 'لوحة القيادة', nav: 'الملاح', crowd: 'حشد الذكاء', ai: 'الذكاء الاصطناعي', trans: 'نقل', sust: 'استدامة', a11y: 'إمكانية الوصول', ops: 'العمليات' },
  de: { dash: 'Dashboard', nav: 'Navigator', crowd: 'Zuschauer', ai: 'KI-Concierge', trans: 'Verkehr', sust: 'Nachhaltigkeit', a11y: 'Barrierefreiheit', ops: 'Betrieb' },
  pt: { dash: 'Painel', nav: 'Navegador', crowd: 'Multidão', ai: 'Concierge de IA', trans: 'Transporte', sust: 'Sustentabilidade', a11y: 'Acessibilidade', ops: 'Operações' },
  ru: { dash: 'Панель', nav: 'Навигатор', crowd: 'Толпа', ai: 'ИИ Консьерж', trans: 'Транспорт', sust: 'Устойчивость', a11y: 'Доступность', ops: 'Операции' }
};

/**
 * Navigation sidebar with module links, AI mode indicator, and collapse toggle.
 * @returns {JSX.Element}
 */
export default function Sidebar({ collapsed, onToggle, language = 'en' }) {
  const location = useLocation();

  const isLive = geminiClient.isLiveMode;

  return (
    <>
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-nexus-border
          bg-gradient-to-b from-nexus-bg-primary/95 via-[#131124]/95 to-nexus-primary/20 backdrop-blur-2xl transition-all duration-300 w-[260px]
          ${collapsed ? '-translate-x-full' : 'translate-x-0'}`}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-nexus-border px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-nexus-primary to-nexus-secondary">
          <Zap className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="bg-gradient-to-r from-nexus-primary via-nexus-secondary to-nexus-accent bg-clip-text text-lg font-bold tracking-tight text-transparent">
              NEXUS AI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-nexus-text-secondary">
              FIFA 2026
            </p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Module navigation">
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map(({ path, id, icon: Icon }) => {
            const isActive = location.pathname === path;
            const label = TRANSLATIONS[language]?.[id] || TRANSLATIONS['en'][id];
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  aria-current={isActive ? 'page' : undefined}
                  title={label}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-nexus-primary/15 text-nexus-secondary shadow-sm shadow-nexus-primary/10'
                      : 'text-nexus-text-secondary hover:bg-white/5 hover:text-nexus-text-primary'
                    }`}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 h-8 w-[3px] rounded-r-full bg-gradient-to-b from-nexus-primary to-nexus-secondary"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? 'text-nexus-secondary' : 'text-nexus-text-secondary group-hover:text-nexus-text-primary'
                    }`}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-nexus-border px-3 py-4">
        {/* AI Mode Indicator */}
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
            isLive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-amber-500/10 text-amber-400'
          }`}
          role="status"
          aria-label={`AI Mode: ${isLive ? 'Live Gemini API' : 'Simulation'}`}
        >
          <Radio className={`h-3.5 w-3.5 ${isLive ? 'animate-pulse' : ''}`} aria-hidden="true" />
          {!collapsed && (
            <span className="font-medium">
              {isLive ? 'Live AI' : 'Simulation'}
            </span>
          )}
        </div>

        {/* Collapse Toggle */}
        {/* Old toggle button removed */}
      </div>
    </aside>

    {/* Floating Semi-Transparent Toggle Button */}
    <button
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={`fixed bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full 
        bg-nexus-primary/30 backdrop-blur-md text-white border border-white/10 shadow-lg 
        transition-all duration-300 hover:bg-nexus-primary/60 hover:scale-105 hover:shadow-nexus-glow
        ${collapsed ? 'left-6' : 'left-[238px]'}`}
    >
      {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
    </button>
    </>
  );
}
