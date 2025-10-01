import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '../StudentDashboard';

// Mock the config
vi.mock('../../../config', () => ({
  API_URL: 'http://localhost:5000'
}));

// Mock auth services
vi.mock('../../../services/authServices', () => ({
  getCurrentUser: vi.fn(() => null)
}));

// Mock fetch
global.fetch = vi.fn();

describe('StudentDashboard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'test-user-id');
    
    // Mock successful dashboard API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          dashboard: {
            enrolled_courses: 3,
            attendance_count: 10,
            resources_count: 5,
            messages_count: 8,
            recent_enrollments: [],
            recent_attendance: [],
            recent_messages: []
          }
        }
      })
    });
  });

  it('renders dashboard component', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeTruthy();
    expect(mainDiv.className).toContain('bg-gradient-to-br');
  });

  it('displays loading text', () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading your dashboard/i)).toBeInTheDocument();
  });

  it('calls dashboard API on mount', () => {
    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );
    
    expect(global.fetch).toHaveBeenCalled();
  });
});
