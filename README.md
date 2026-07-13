# 🏟️ NEXUS AI — Neural EXperience Unified Stadium Intelligence

> **GenAI-powered Smart Stadium Command Platform for FIFA World Cup 2026**
>
> Built with React 18, Gemini 2.5 Flash API, and zero-config deployment.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue.svg)
![Accessibility](https://img.shields.io/badge/WCAG-2.1_AA-green.svg)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?logo=vercel&logoColor=white)](https://nexus-ai-omega-ochre.vercel.app/)

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Architecture](#architecture)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Security](#security)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## 🎯 Problem Statement

**FIFA World Cup 2026 Challenge 4 — Smart Stadiums & Tournament Operations**

> Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff. The solution must leverage Generative AI to improve navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support during the FIFA World Cup 2026.

---

## 💡 Solution Overview

**NEXUS AI** is a unified command platform that brings all stadium intelligence into a single interface. It uses **Google's Gemini 2.5 Flash** to power 7 AI-driven modules spanning every aspect of the problem statement:

| Module | Problem Addressed | GenAI Integration |
|--------|-------------------|-------------------|
| **Stadium Navigator** | Navigation | AI-generated step-by-step directions with accessibility routing |
| **Crowd Intelligence** | Crowd Management | Structured JSON predictions via Gemini True JSON Mode |
| **AI Concierge** | Multilingual Assistance | 7-language conversational chatbot |
| **Transport Hub** | Transportation | AI-recommended departure times and route optimization |
| **Sustainability** | Sustainability | Contextual energy/waste recommendations |
| **Accessibility Center** | Accessibility | Adaptive routing, sensory zones, companion seating |
| **Operations Center** | Operational Intelligence | In-Memory RAG executive briefings |

### Key Innovation: Hybrid AI Architecture

```
User Request → HybridGeminiClient
                ├─ API Key Present? → Gemini 2.5 Flash (Live AI)
                │   ├─ Success → Return response
                │   └─ HTTP 429 → Toast notification → Simulation fallback
                └─ No API Key → High-Fidelity Simulation Engine (Zero-config)
```

**Why this matters**: Judges can evaluate the platform with **zero configuration** (simulation mode), or optionally add a Gemini API key to see live AI in action.

---

## 🏗️ Architecture

```
nexus-ai/
├── src/
│   ├── App.jsx                    # Root: Router + Layout + Toast system
│   ├── main.jsx                   # React 18 entry point
│   ├── index.css                  # Tailwind v4 + FIFA 2026 Design System
│   │
│   ├── components/                # 13 reusable UI components
│   │   ├── Sidebar.jsx            # Navigation with collapse + AI mode indicator
│   │   ├── Header.jsx             # Clock, language selector, notifications
│   │   ├── GlassCard.jsx          # Glassmorphism card with configurable glow
│   │   ├── MetricCard.jsx         # Animated KPI with sparkline chart
│   │   ├── StadiumMap.jsx         # Interactive SVG with keyboard navigation
│   │   ├── Heatmap.jsx            # Canvas-rendered crowd density visualization
│   │   ├── ChatBubble.jsx         # Chat message with typing indicator
│   │   └── ...                    # Badge, Modal, Toast, AlertBanner, etc.
│   │
│   ├── modules/                   # 8 feature pages (lazy-loaded)
│   │   ├── Dashboard.jsx          # Executive overview with AI briefings
│   │   ├── Navigator.jsx          # AI-powered wayfinding
│   │   ├── CrowdIntel.jsx         # Crowd prediction (True JSON Mode)
│   │   ├── Concierge.jsx          # Multilingual AI chatbot
│   │   ├── Transport.jsx          # Multi-modal transit planner
│   │   ├── Sustainability.jsx     # Environmental monitoring
│   │   ├── Accessibility.jsx      # Inclusive experience center
│   │   └── Operations.jsx         # In-Memory RAG command center
│   │
│   ├── services/
│   │   ├── gemini.js              # HybridGeminiClient (Live API + Fallback)
│   │   └── simulationEngine.js    # High-fidelity response simulator
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useGemini.js           # AI client with loading/deduplication
│   │   ├── useRealTimeData.js     # Simulated live data feeds
│   │   └── useAccessibility.js    # A11y preferences (localStorage-backed)
│   │
│   ├── lib/                       # Core utilities
│   │   ├── security.js            # DOMPurify, input validation, rate limiter
│   │   ├── i18n.js                # 7-language internationalization
│   │   └── constants.js           # 16 real FIFA 2026 venues + config
│   │
│   └── contexts/                  # React context providers
│       ├── LanguageContext.jsx
│       └── AccessibilityContext.jsx
│
├── tests/                         # Test suite
│   ├── unit/                      # Unit tests
│   └── integration/               # Integration tests
│
├── index.html                     # Semantic HTML5 + CSP + preconnect
├── tailwind.config.js             # Extended FIFA 2026 theme
├── vite.config.js                 # Build optimization + @tailwindcss/vite
├── vitest.config.js               # Test config with 80% coverage thresholds
├── eslint.config.js               # Flat config + React/Hooks rules
├── vercel.json                    # SPA routing for Vercel deployment
└── .env.example                   # Environment template
```

---

## 🧩 Modules

### 1. Dashboard
Executive overview with 4 animated KPI cards, AI-generated briefings (auto-refresh 60s), live attendance charts, venue status grid, and recent alerts.

### 2. Stadium Navigator
Interactive SVG stadium map with clickable zones. AI generates step-by-step directions with accessibility routing options (wheelchair, visual impairment).

### 3. Crowd Intelligence
Real-time crowd density heatmap with 8-zone monitoring. Uses **Gemini True JSON Mode** (`responseMimeType: 'application/json'`) for structured 15/30/60-minute predictions with staff deployment recommendations.

### 4. AI Concierge
Conversational chatbot supporting 7 FIFA languages (English, Spanish, French, German, Arabic, Portuguese, Russian) with RTL support. Quick-action buttons for common queries.

### 5. Transport Hub
Multi-modal journey planner (Metro, Bus, Ride-Share, Walking, Parking). AI-recommended optimal departure times. Real-time transit status and surge pricing indicators.

### 6. Sustainability
Environmental dashboard tracking carbon footprint, energy usage, and waste diversion rates. AI generates contextual recommendations (e.g., "Lower AC in zones 4-6 to save 12% energy").

### 7. Accessibility Center
Wheelchair-accessible route planner, sensory-friendly zone finder, companion seating availability, service animal relief areas, and an accessible feedback form with DOMPurify sanitization.

### 8. Operations Center
**In-Memory RAG** implementation: maintains the last 100 log events in React state, injects the 20 most recent into the Gemini prompt for executive briefings. Resource allocation controls, incident tracking, and emergency protocol buttons.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 + Vite 6 | Component architecture + instant HMR |
| **AI** | Gemini 2.5 Flash | GenAI insights, chat, JSON predictions |
| **AI SDK** | `@google/genai` | Official Google GenAI SDK |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **Charts** | Recharts | AreaChart, BarChart, PieChart, LineChart |
| **Icons** | Lucide React | Consistent, accessible iconography |
| **Security** | DOMPurify | XSS prevention via HTML sanitization |
| **Testing** | Vitest + RTL | Unit/integration tests with 80% coverage |
| **Linting** | ESLint 9 + Prettier | Code quality + consistent formatting |
| **Deployment** | Vercel | Zero-config SPA hosting |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nexus-ai.git
cd nexus-ai

# Install dependencies
npm install

# (Optional) Add your Gemini API key
cp .env.example .env
# Edit .env and add: VITE_GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

The app runs at `http://localhost:5173` and works **immediately without an API key** using the high-fidelity simulation engine.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🤖 API Integration

### Gemini 2.5 Flash — Hybrid Client

The `HybridGeminiClient` (`src/services/gemini.js`) provides three methods:

```javascript
import { geminiClient } from './services/gemini';

// 1. Text insights
const briefing = await geminiClient.generateInsight(
  'Summarize current stadium operations status',
  'dashboard'
);

// 2. Structured JSON (True JSON Mode)
const prediction = await geminiClient.generateJSON(
  'Predict crowd density for all zones in 15 minutes',
  'crowd'
);
// Returns parsed JSON object — guaranteed parsable via responseMimeType

// 3. Conversational chat
const reply = await geminiClient.chat(
  'Where is Gate A?',
  'es' // language code
);
```

### Rate Limit Handling (HTTP 429)

```
API 429 Error → Set rateLimited flag
             → Dispatch 'nexus-toast' event (UI notification)
             → Fallback to simulationEngine
             → Auto-recover after 60 seconds
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

| Suite | Tests | Coverage Area |
|-------|-------|---------------|
| `gemini.test.js` | 8 | HybridGeminiClient, 429 handling, simulation fallback |
| `simulationEngine.test.js` | 12 | All 8 context types, data shape validation |
| `security.test.js` | 9 | DOMPurify sanitization, input validation, rate limiter |
| `components.test.jsx` | 11 | Badge, GlassCard, Modal rendering + a11y |
| `app.test.jsx` | 8 | Routing, layout, navigation, 404 |

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Semantic HTML5**: `<main>`, `<nav>`, `<header>`, `<aside>` landmarks
- **ARIA Attributes**: `role`, `aria-label`, `aria-live`, `aria-modal`, `aria-expanded`
- **Keyboard Navigation**: Full Tab/Escape/Enter support, focus-visible styles
- **Focus Trap**: Modal dialog traps focus when open
- **Skip-to-Content**: First focusable element in `<body>`
- **RTL Support**: Arabic layout with `dir="rtl"`
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`
- **High Contrast**: Respects `prefers-contrast: high`
- **Color Contrast**: All text ≥ 4.5:1 ratio against backgrounds
- **Screen Reader**: Dynamic content uses `aria-live` regions

---

## 🔒 Security

- **Content Security Policy**: `<meta>` CSP in `index.html`
- **HTML Sanitization**: DOMPurify with strict allow-list (no `<script>`, `<iframe>`, event handlers)
- **Input Validation**: Allow-list patterns for all user inputs (venue IDs, coordinates, language codes, search queries)
- **Rate Limiting**: Token-bucket algorithm prevents API abuse
- **No Secrets in Code**: API key via environment variable only
- **Audit Logging**: Structured security event logging

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The `vercel.json` config handles SPA routing automatically.

### Manual Build

```bash
npm run build
# Serve the dist/ folder with any static file server
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

- **Google Gemini** — Generative AI powering all intelligent features
- **FIFA World Cup 2026** — Inspiration for the platform design
- **Hack2Skill & Google for Developers** — PromptWar Virtual Event

---

Built with ❤️ for FIFA World Cup 2026 by NEXUS AI Team
