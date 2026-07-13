import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import Badge from '../../src/components/Badge';
import GlassCard from '../../src/components/GlassCard';
import Modal from '../../src/components/Modal';

/**
 * @fileoverview Component unit tests for Badge, GlassCard, and Modal.
 * Tests rendering, props, accessibility attributes, and interactions.
 */

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Badge Component', () => {
  it('should render with label text', () => {
    render(<Badge label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply success variant styles', () => {
    render(<Badge label="Online" variant="success" />);
    const badge = screen.getByText('Online');
    expect(badge.className).toContain('text-emerald');
  });

  it('should apply danger variant styles', () => {
    render(<Badge label="Critical" variant="danger" />);
    const badge = screen.getByText('Critical');
    expect(badge.className).toContain('text-red');
  });

  it('should show pulse animation when pulse prop is true', () => {
    const { container } = render(<Badge label="Live" variant="success" pulse={true} />);
    const pulseEl = container.querySelector('.animate-pulse');
    expect(pulseEl).toBeInTheDocument();
  });
});

describe('GlassCard Component', () => {
  it('should render title and children', () => {
    render(<GlassCard title="Test Card">Card content</GlassCard>);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should have region role with aria-label', () => {
    render(<GlassCard title="Status">Content</GlassCard>);
    const card = screen.getByRole('region');
    expect(card).toHaveAttribute('aria-label', 'Status');
  });

  it('should render subtitle when provided', () => {
    render(<GlassCard title="Main" subtitle="Sub info">Body</GlassCard>);
    expect(screen.getByText('Sub info')).toBeInTheDocument();
  });

  it('should render as button when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<GlassCard title="Clickable" onClick={handleClick}>Click me</GlassCard>);
    const card = screen.getByRole('region');
    expect(card.tagName.toLowerCase()).toBe('button');
  });
});

describe('Modal Component', () => {
  it('should not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Test">Content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Confirm Action">Body text</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="ARIA Test">Accessible</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Close Test">Content</Modal>);
    
    const closeBtn = screen.getByLabelText('Close dialog');
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Escape Test">Content</Modal>);
    
    const dialog = screen.getByRole('dialog');
    dialog.focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
