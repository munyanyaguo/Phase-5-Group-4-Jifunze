import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentEnrollments from '../StudentEnrollments';

// Mock the config
vi.mock('../../../config', () => ({
  API_URL: 'http://localhost:5000'
}));

// Mock fetch
global.fetch = vi.fn();

describe('StudentEnrollments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'test-user-id');
    
    // Mock enrollments API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          enrollments: [
            {
              id: 1,
              course_id: 1,
              date_enrolled: '2025-01-01',
              course: {
                id: 1,
                title: 'Mathematics 101',
                description: 'Introduction to Math',
                educator: { name: 'Dr. Smith', email: 'smith@test.com' },
                school: { name: 'Test School' }
              }
            },
            {
              id: 2,
              course_id: 2,
              date_enrolled: '2025-01-05',
              course: {
                id: 2,
                title: 'Physics 101',
                description: 'Introduction to Physics',
                educator: { name: 'Dr. Johnson', email: 'johnson@test.com' },
                school: { name: 'Test School' }
              }
            }
          ],
          meta: { page: 1, pages: 1, total: 2 }
        }
      })
    });
  });

  it('renders enrollments component', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentEnrollments />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <StudentEnrollments />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentEnrollments />
      </BrowserRouter>
    );
    
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeTruthy();
    expect(mainDiv.className).toContain('bg-gradient-to-br');
  });

  it('calls enrollments API on mount', () => {
    render(
      <BrowserRouter>
        <StudentEnrollments />
      </BrowserRouter>
    );
    
    expect(global.fetch).toHaveBeenCalled();
  });

  it('displays loading text', () => {
    render(
      <BrowserRouter>
        <StudentEnrollments />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading enrollments/i)).toBeInTheDocument();
  });

  it('renders main container', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentEnrollments />
      </BrowserRouter>
    );
    
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeTruthy();
  });
});
