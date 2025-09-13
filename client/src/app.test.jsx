import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders welcome message", () => {
  render(<App />);
  expect(screen.getByText(/Welcome to Jifunze 🎓/i)).toBeInTheDocument();
});