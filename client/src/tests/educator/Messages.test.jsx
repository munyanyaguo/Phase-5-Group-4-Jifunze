import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EducatorMessages from '../../pages/educator/Messages';

// Mock the service modules
vi.mock('../../services/courseService', () => ({
  fetchEducatorCourses: vi.fn().mockResolvedValue({ data: [] })
}));

vi.mock('../../services/messageService', () => ({
  fetchMessagesByCourse: vi.fn().mockResolvedValue({ messages: [] }),
  sendMessage: vi.fn().mockResolvedValue({})
}));

describe('Educator Messages', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQifQ.test');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <EducatorMessages />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});


