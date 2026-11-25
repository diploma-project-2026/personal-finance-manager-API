import { render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "./TransactionForm";
it("submits a valid expense with numeric amount", async () => {
  const save = vi.fn();
  const u = userEvent.setup();
  render(
    <TransactionForm
      categories={[{ id: "food", name: "Food", type: "expense" }]}
      onSave={save}
    />,
  );
  await u.type(screen.getByLabelText("Merchant / description"), "Shop");
  await u.type(screen.getByLabelText("Amount (EUR)"), "12.50");
  await u.selectOptions(screen.getByLabelText("Category"), "food");
  await u.click(screen.getByRole("button", { name: "Save transaction" }));
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({
      merchant: "Shop",
      amount: 12.5,
      categoryId: "food",
      type: "expense",
    }),
  );
});
it("rejects missing required inputs", async () => {
  const save = vi.fn();
  render(<TransactionForm categories={[]} onSave={save} />);
  await userEvent.click(
    screen.getByRole("button", { name: "Save transaction" }),
  );
  expect(save).not.toHaveBeenCalled();
});
