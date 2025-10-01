import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentCourses from '../StudentCourses';

// Mock the config
vi.mock('../../../config', () => ({
  API_URL: 'http://localhost:5000'
}));

// Mock fetch
global.fetch = vi.fn();

describe('StudentCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'test-user-id');
    
    // Mock courses API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          courses: [
            {
              id: 1,
              title: 'Mathematics 101',
              description: 'Introduction to Mathematics',
              educator: { name: 'Dr. Smith' },
              school: { name: 'Test School' }
            },
            {
              id: 2,
              title: 'Physics 101',
              description: 'Introduction to Physics',
              educator: { name: 'Dr. Johnson' },
              school: { name: 'Test School' }
            }
          ],
          meta: { page: 1, pages: 1, total: 2 }
        }
      })
    });
  });

  it('renders courses component', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentCourses />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <StudentCourses />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentCourses />
      </BrowserRouter>
    );
    
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeTruthy();
    expect(mainDiv.className).toContain('bg-gradient-to-br');
  });

  it('renders search input', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentCourses />
      </BrowserRouter>
    );
    
    const searchInput = container.querySelector('input[placeholder*="Search"]');
    expect(searchInput).toBeTruthy();
  });

  it('calls courses API on mount', () => {
    render(
      <BrowserRouter>
        <StudentCourses />
      </BrowserRouter>
    );
    
    expect(global.fetch).toHaveBeenCalled();
  });

  it('has page title', () => {
    render(
      <BrowserRouter>
        <StudentCourses />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/My Courses/i)).toBeInTheDocument();
  });
});
