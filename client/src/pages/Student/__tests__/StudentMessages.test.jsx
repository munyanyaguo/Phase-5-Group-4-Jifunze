import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentMessages from '../StudentMessages';

// Mock the config
vi.mock('../../../config', () => ({
  API_URL: 'http://localhost:5000'
}));

// Mock fetch
global.fetch = vi.fn();

describe('StudentMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'test-user-id');
    
    // Mock messages API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          messages: [
            {
              id: 1,
              content: 'Hello class!',
              timestamp: '2025-01-15T10:00:00',
              user: { name: 'Dr. Smith' }
            },
            {
              id: 2,
              content: 'Welcome everyone',
              timestamp: '2025-01-15T10:05:00',
              user: { name: 'Test Student' }
            }
          ],
          meta: { page: 1, pages: 1, total: 2 }
        }
      })
    });
  });

  it('renders messages component', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentMessages />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <StudentMessages />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('has gradient background styling', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentMessages />
      </BrowserRouter>
    );
    
    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeTruthy();
    expect(mainDiv.className).toContain('bg-gradient-to-br');
  });

  it('renders chat interface container', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentMessages />
      </BrowserRouter>
    );
    
    const chatContainer = container.querySelector('.min-h-screen');
    expect(chatContainer).toBeTruthy();
  });

  it('displays loading message', () => {
    render(
      <BrowserRouter>
        <StudentMessages />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('has page title', () => {
    render(
      <BrowserRouter>
        <StudentMessages />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Messages/i)).toBeInTheDocument();
  });
});
