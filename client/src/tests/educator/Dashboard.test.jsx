import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EducatorDashboard from '../../pages/educator/Dashboard';

// Mock the service modules
vi.mock('../../services/courseService', () => ({
  fetchEducatorCourses: vi.fn().mockResolvedValue({ data: [] })
}));

describe('EducatorDashboard', () => {
  beforeEach(() => {
    // Mock fetch for other API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] })
    });
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQifQ.test');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <EducatorDashboard />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});


