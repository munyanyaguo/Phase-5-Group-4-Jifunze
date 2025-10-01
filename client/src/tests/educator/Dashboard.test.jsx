import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EducatorDashboard from '../../pages/educator/Dashboard';

describe('EducatorDashboard', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { messages: [] } }) });
    localStorage.setItem('token', 'test.token.value');
  });

  it('renders header and summary cards', async () => {
    render(
      <MemoryRouter>
        <EducatorDashboard />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Educator Dashboard|Overview/i)).toBeTruthy();
  });
});


