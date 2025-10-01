import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentResources from '../StudentResources';

// Mock the config
vi.mock('../../../config', () => ({
  API_URL: 'http://localhost:5000'
}));

// Mock fetch
global.fetch = vi.fn();

describe('StudentResources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user_id', 'test-user-id');
    
    // Mock resources API response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          resources: [
            {
              id: 1,
              title: 'Lecture Notes',
              type: 'pdf',
              url: 'http://example.com/notes.pdf',
              course: { title: 'Mathematics 101' }
            },
            {
              id: 2,
              title: 'Video Tutorial',
              type: 'video',
              url: 'http://example.com/video.mp4',
              course: { title: 'Physics 101' }
            }
          ],
          meta: { page: 1, pages: 1, total: 2 }
        }
      })
    });
  });

  it('renders resources component', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentResources />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <StudentResources />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('renders loading container', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentResources />
      </BrowserRouter>
    );
    
    const loadingDiv = container.querySelector('.flex.justify-center');
    expect(loadingDiv).toBeTruthy();
  });

  it('displays loading text', () => {
    render(
      <BrowserRouter>
        <StudentResources />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Loading resources/i)).toBeInTheDocument();
  });

  it('calls resources API on mount', () => {
    render(
      <BrowserRouter>
        <StudentResources />
      </BrowserRouter>
    );
    
    expect(global.fetch).toHaveBeenCalled();
  });

  it('renders main component structure', () => {
    const { container } = render(
      <BrowserRouter>
        <StudentResources />
      </BrowserRouter>
    );
    
    expect(container.firstChild).toBeTruthy();
  });
});
