import { render, screen } from "@testing-library/react";

import Home from "../page";

describe("Home page", () => {
  it("renders the main content area", () => {
    render(<Home />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

