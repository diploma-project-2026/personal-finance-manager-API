import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { BudgetRow } from "./BudgetRow";
it("displays over-budget status and caps the progress bar", () => {
  render(<BudgetRow name="Food" spent={120} limit={100} />);
  expect(screen.getByText("120% · Over budget")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
});
