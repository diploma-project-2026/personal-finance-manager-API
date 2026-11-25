import { render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { TransactionTable } from "./TransactionTable";
it("shows empty state", () => {
  render(<TransactionTable rows={[]} categories={[]} />);
  expect(screen.getByText("No transactions found.")).toBeInTheDocument();
});
it("calls edit with selected transaction", async () => {
  const t = {
    id: "a",
    merchant: "Shop",
    amount: 10,
    date: "2026-11-01",
    type: "expense" as const,
    categoryId: "food",
    notes: "",
  };
  const edit = vi.fn();
  render(<TransactionTable rows={[t]} categories={[]} onEdit={edit} />);
  await userEvent.click(screen.getByRole("button", { name: "Edit" }));
  expect(edit).toHaveBeenCalledWith(t);
});
