import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentAttendance from '../StudentAttendance';

// Mock the config
vi.mock('../../../config', () => ({
  API_URL: 'http://localhost:5000'
}));

// Mock fetch
global.fetch = vi.fn();

describe('StudentAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'test-user-id');
    
    // Mock attendance API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          attendance: [
            {
              id: 1,
              course_id: 1,
              date: '2025-01-15',
              status: 'present',
              course: {
                title: 'Mathematics 101',
                educator: { name: 'Dr. Smith' }
              }
            },
            {
              id: 2,
              course_id: 1,
              date: '2025-01-16',
              status: 'absent',
              course: {
                title: 'Mathematics 101',
                educator: { name: 'Dr. Smith' }
              }
            }
          ],
          meta: { page: 1, pages: 1, total: 2 }
        }
      })
    });
  });

  it('renders attendance component', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentAttendance />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <StudentAttendance />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentAttendance />
      </BrowserRouter>
    );
    
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeTruthy();
    expect(mainDiv.className).toContain('bg-gradient-to-br');
  });

  it('renders filter controls', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentAttendance />
      </BrowserRouter>
    );
    
    const filterSelect = container.querySelector('select');
    expect(filterSelect).toBeTruthy();
  });

  it('calls attendance API on mount', () => {
    render(
      <BrowserRouter>
        <StudentAttendance />
      </BrowserRouter>
    );
    
    expect(global.fetch).toHaveBeenCalled();
  });

  it('has page title', () => {
    render(
      <BrowserRouter>
        <StudentAttendance />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/My Attendance/i)).toBeInTheDocument();
  });
});
