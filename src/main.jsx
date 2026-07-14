import {  StrictMode  } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/**
 * NEXUS AI — Application Entry Point
 *
 * Bootstraps the React 19 application with:
 * - StrictMode for development warnings and double-render detection
 * - BrowserRouter for client-side routing (SPA)
 * - Root App component as the application shell
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'NEXUS AI: Root element #root not found. Ensure index.html contains <div id="root"></div>.'
  );
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
