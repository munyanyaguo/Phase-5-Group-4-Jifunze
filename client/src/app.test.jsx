import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders welcome to jifunze", () => {
  render(<App />);
  expect(screen.getByText(/welcome to jifunze/i)).toBeInTheDocument();
});