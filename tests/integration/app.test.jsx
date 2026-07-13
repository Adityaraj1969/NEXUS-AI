import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import App from '../../src/App';

/**
 * @fileoverview Integration tests for the App component.
 * Tests routing, layout rendering, and global state.
 */

// Mock lazy-loaded modules to avoid actual component loading
vi.mock('../../src/modules/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Module</div>,
}));
vi.mock('../../src/modules/Navigator', () => ({
  default: () => <div data-testid="navigator-page">Navigator Module</div>,
}));
vi.mock('../../src/modules/CrowdIntel', () => ({
  default: () => <div data-testid="crowd-page">CrowdIntel Module</div>,
}));
vi.mock('../../src/modules/Concierge', () => ({
  default: () => <div data-testid="concierge-page">Concierge Module</div>,
}));
vi.mock('../../src/modules/Transport', () => ({
  default: () => <div data-testid="transport-page">Transport Module</div>,
}));
vi.mock('../../src/modules/Sustainability', () => ({
  default: () => <div data-testid="sustainability-page">Sustainability Module</div>,
}));
vi.mock('../../src/modules/Accessibility', () => ({
  default: () => <div data-testid="accessibility-page">Accessibility Module</div>,
}));
vi.mock('../../src/modules/Operations', () => ({
  default: () => <div data-testid="operations-page">Operations Module</div>,
}));

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
}

describe('App Integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render without crashing', () => {
    renderApp();
    expect(document.body).toBeTruthy();
  });

  it('should render the Sidebar navigation', () => {
    renderApp();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('should render the main content area', () => {
    renderApp();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should render Dashboard page on root route', async () => {
    renderApp('/');
    const dashboard = await screen.findByTestId('dashboard-page');
    expect(dashboard).toBeInTheDocument();
  });

  it('should render Navigator page on /navigator route', async () => {
    renderApp('/navigator');
    const navigator = await screen.findByTestId('navigator-page');
    expect(navigator).toBeInTheDocument();
  });

  it('should render CrowdIntel page on /crowd route', async () => {
    renderApp('/crowd');
    const crowd = await screen.findByTestId('crowd-page');
    expect(crowd).toBeInTheDocument();
  });

  it('should render 404 page on unknown route', async () => {
    renderApp('/nonexistent');
    const notFound = await screen.findByText('404');
    expect(notFound).toBeInTheDocument();
  });

  it('should have correct dir attribute for LTR languages', () => {
    renderApp();
    const root = document.querySelector('[dir]');
    expect(root).toHaveAttribute('dir', 'ltr');
  });
});
