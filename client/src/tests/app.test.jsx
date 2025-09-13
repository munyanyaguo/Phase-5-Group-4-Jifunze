import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

// Mock fetch globally
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.endsWith("/schools")) {
      return Promise.resolve({
        json: () => Promise.resolve({ schools: [{ id: 1, name: "Test School", students: 100 }] })
      });
    }
    if (url.endsWith("/courses")) {
      return Promise.resolve({
        json: () => Promise.resolve({ courses: [{ id: 1, title: "Test Course", educator: "John" }] })
      });
    }
    if (url.endsWith("/health")) {
      return Promise.resolve({
        json: () => Promise.resolve({ status: "healthy", database: "SQLite" })
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});

describe("App component", () => {
  it("renders API data correctly", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Test School/)).toBeDefined();
      expect(screen.getByText(/Test Course/)).toBeDefined();
      expect(screen.getByText(/healthy/)).toBeDefined();
    });
  });
});
