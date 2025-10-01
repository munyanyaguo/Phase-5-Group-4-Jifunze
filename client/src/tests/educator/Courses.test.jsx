import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Courses from '../../pages/educator/Courses';

// Mock the service modules
vi.mock('../../services/courseService', () => ({
  fetchEducatorCourses: vi.fn().mockResolvedValue({ data: [] })
}));

describe('Educator Courses', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ 
      ok: true, 
      json: async () => ({ success: true, data: [] }) 
    });
    localStorage.setItem('token', 'test.token.value');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Courses />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});


