import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Courses from '../../pages/educator/Courses';

describe('Educator Courses', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { items: [] } }) });
    localStorage.setItem('token', 'test.token.value');
  });

  it('renders heading', async () => {
    render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );
    expect(await screen.findByText(/My Courses/i)).toBeTruthy();
  });
});


