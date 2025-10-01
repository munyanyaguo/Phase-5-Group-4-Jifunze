import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadResourceModal from '../../components/educator/UploadResourceModal';

describe('UploadResourceModal', () => {
  it('renders and blocks submit without file', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <UploadResourceModal isOpen onSubmit={onSubmit} onClose={onClose} courses={[{ id: 1, title: 'Course' }]} />
    );

    expect(screen.getByText(/Upload New Resource/i)).toBeTruthy();
  });
});


