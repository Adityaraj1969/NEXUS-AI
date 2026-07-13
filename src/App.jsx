import {  lazy, Suspense, useState, useEffect, useCallback  } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

/**
 * @fileoverview Root application component for NEXUS AI.
 * Manages routing, layout, global state (language, accessibility),
 * and toast notifications from the Gemini client.
 * @module App
 */

// ── Lazy-loaded module pages ──
const Dashboard = lazy(() => import('./modules/Dashboard'));
const Navigator = lazy(() => import('./modules/Navigator'));
const CrowdIntel = lazy(() => import('./modules/CrowdIntel'));
const Concierge = lazy(() => import('./modules/Concierge'));
const Transport = lazy(() => import('./modules/Transport'));
const Sustainability = lazy(() => import('./modules/Sustainability'));
const AccessibilityPage = lazy(() => import('./modules/Accessibility'));
const Operations = lazy(() => import('./modules/Operations'));

/**
 * Loading skeleton displayed while lazy-loaded modules initialize.
 * @returns {JSX.Element}
 */
function LoadingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center p-12" role="status" aria-label="Loading module">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-xl bg-nexus-primary/20" />
        <div className="h-4 w-32 animate-pulse rounded-lg bg-white/5" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Error boundary fallback component.
 * @param {Object} props
 * @param {Error} props.error
 * @returns {JSX.Element}
 */
function ErrorFallback({ error }) {
  return (
    <div className="flex h-full items-center justify-center p-12" role="alert">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-nexus-danger">Something went wrong</h2>
        <p className="text-sm text-nexus-text-secondary">{error?.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-nexus-primary px-4 py-2 text-sm font-medium text-white
            transition-colors hover:bg-nexus-primary/80"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

/**
 * Root application component.
 * Provides the dashboard layout (sidebar + header + content),
 * React Router routes, and global toast notification system.
 * @returns {JSX.Element}
 */
function App() {
  const [language, setLanguage] = useState('en');
  const [showA11yPanel, setShowA11yPanel] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for toast notifications from HybridGeminiClient
  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail || {};
      if (message) {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type: type || 'info' }]);
      }
    };
    window.addEventListener('nexus-toast', handleToast);
    return () => window.removeEventListener('nexus-toast', handleToast);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (e) => {
      console.error('[NEXUS AI] Uncaught error:', e.error);
      setError(e.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <div
      className="min-h-screen bg-nexus-bg-primary font-inter flex overflow-hidden"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} language={language} />

      {/* Main Content Area dynamically adjusts its margin! */}
      <div 
        className={`flex-1 transition-all duration-300 flex flex-col h-screen overflow-y-auto ${
          sidebarCollapsed ? 'ml-0' : 'ml-[260px]'
        }`}
      >
        {/* Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          onToggleA11y={() => setShowA11yPanel(!showA11yPanel)}
        />

        {/* Page Content */}
        <main
          id="main-content"
          role="main"
          className="min-h-[calc(100vh-64px)] p-4 md:p-8 max-w-[1600px] mx-auto w-full"
        >
          <Suspense fallback={<LoadingSkeleton />}>
            <Routes>
              <Route path="/" element={<Dashboard language={language} />} />
              <Route path="/navigator" element={<Navigator />} />
              <Route path="/crowd" element={<CrowdIntel />} />
              <Route path="/concierge" element={<Concierge language={language} />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/operations" element={<Operations />} />
              <Route
                path="*"
                element={
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-bold text-nexus-text-primary">404</h2>
                      <p className="mt-2 text-nexus-text-secondary">Page not found</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;
