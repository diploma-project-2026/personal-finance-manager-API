import { useState } from "react";
import type { Category, Transaction, Kind, LineItem } from "../models";
import { today, money } from "../models";
import { Field, Form, Card } from "./ui";
export function TransactionForm({
  categories,
  initial,
  onSave,
  busy,
}: {
  categories: Category[];
  initial?: Partial<Transaction>;
  onSave: (value: Omit<Transaction, "id">) => void;
  busy?: boolean;
}) {
  const [kind, setKind] = useState<Kind>(initial?.type || "expense"),
    [merchant, setMerchant] = useState(initial?.merchant || ""),
    [amount, setAmount] = useState(initial?.amount?.toString() || ""),
    [date, setDate] = useState(initial?.date || today()),
    [category, setCategory] = useState(initial?.categoryId || ""),
    [notes, setNotes] = useState(initial?.notes || ""),
    [items, setItems] = useState<LineItem[]>(initial?.items || []),
    [error, setError] = useState("");
  return (
    <div className="two-col">
      <Card title="Enter transaction details">
        <Form
          busy={busy}
          label="Save transaction"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              !merchant.trim() ||
              !Number.isFinite(Number(amount)) ||
              Number(amount) <= 0 ||
              !categories.some((c) => c.id === category && c.type === kind) ||
              items.some(
                (i) =>
                  !i.name.trim() ||
                  !Number.isFinite(i.quantity) ||
                  i.quantity <= 0 ||
                  !Number.isFinite(i.price) ||
                  i.price < 0,
              )
            ) {
              setError(
                "Please enter valid transaction details and line items.",
              );
              return;
            }
            setError("");
            onSave({
              merchant: merchant.trim(),
              amount: Number(amount),
              date,
              categoryId: category,
              type: kind,
              notes,
              items,
            });
          }}
        >
          <Field label="Type">
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as Kind);
                setCategory("");
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </Field>
          <Field label="Merchant / description">
            <input
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </Field>
          <div className="form-grid">
            <Field label="Date">
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="Amount (EUR)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Category">
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories
                .filter((c) => c.type === kind)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <h3>Line items (optional)</h3>
          {items.map((item, i) => (
            <div className="item-row" key={i}>
              <input
                aria-label={`Item ${i + 1} name`}
                required
                value={item.name}
                onChange={(e) =>
                  setItems(
                    items.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
              />
              <input
                aria-label={`Item ${i + 1} quantity`}
                type="number"
                required
                min="0.001"
                step="any"
                value={item.quantity}
                onChange={(e) =>
                  setItems(
                    items.map((x, j) =>
                      j === i ? { ...x, quantity: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
              <input
                aria-label={`Item ${i + 1} price`}
                type="number"
                required
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) =>
                  setItems(
                    items.map((x, j) =>
                      j === i ? { ...x, price: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                aria-label={`Remove item ${i + 1}`}
                onClick={() => setItems(items.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setItems([...items, { name: "", quantity: 1, price: 0 }])
            }
          >
            + Add item
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </Form>
      </Card>
      <Card title="Transaction preview">
        <div className="preview">
          <p>{merchant || "Merchant name"}</p>
          <strong>{money(Number(amount) || 0)}</strong>
          <p>
            {date} ·{" "}
            {categories.find((c) => c.id === category)?.name || "Category"}
          </p>
          {items.map((x, i) => (
            <p key={i}>
              {x.name || "Item"} · {x.quantity} × {money(x.price)}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
