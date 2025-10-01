import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EducatorMessages from '../../pages/educator/Messages';

describe('Educator Messages', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { items: [] } }) });
    localStorage.setItem('token', 'test.token.value');
  });

  it('renders Messages header', async () => {
    render(
      <MemoryRouter>
        <EducatorMessages />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Messages/i)).toBeTruthy();
  });
});


