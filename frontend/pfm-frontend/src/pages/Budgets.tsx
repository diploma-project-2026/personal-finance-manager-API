import { useState } from "react";
import { useFinance, useAppDispatch, mutate } from "../store";
import { today, money } from "../models";
import { Card, Heading, Field, Form, Summary, Empty } from "../components/ui";
import { BudgetRow } from "../components/BudgetRow";
export default function Budgets() {
  const { data, pending } = useFinance(),
    dispatch = useAppDispatch(),
    [month, setMonth] = useState(today().slice(0, 7)),
    [category, setCategory] = useState(""),
    [limit, setLimit] = useState(""),
    [id, setId] = useState("");
  if (!data) return null;
  const budgets = data.budgets.filter((b) => b.month === month),
    spent = (categoryId: string) =>
      data.transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.categoryId === categoryId &&
            t.date.startsWith(month),
        )
        .reduce((a, t) => a + t.amount, 0),
    total = budgets.reduce((a, b) => a + b.limit, 0),
    used = budgets.reduce((a, b) => a + spent(b.categoryId), 0);
  return (
    <>
      <Heading
        title="Budget Progress"
        subtitle="Track monthly budget usage by category"
        action={
          <input
            aria-label="Budget month"
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setId("");
              setCategory("");
              setLimit("");
            }}
          />
        }
      />
      <div className="three-col">
        <Summary label="Total budget" value={total} detail="Monthly limits" />
        <Summary label="Spent" value={used} detail="Budgeted categories" />
        <Summary
          label="Remaining"
          value={total - used}
          detail={`${total ? Math.round((used / total) * 100) : 0}% used`}
        />
      </div>
      <div className="two-col">
        <Card title="Budget by Category">
          {!budgets.length && <Empty />}
          {budgets.map((b) => (
            <div key={b.id}>
              <BudgetRow
                name={
                  data.categories.find((c) => c.id === b.categoryId)?.name ||
                  "Category"
                }
                spent={spent(b.categoryId)}
                limit={b.limit}
              />
              <div className="actions">
                <button
                  onClick={() => {
                    setId(b.id);
                    setCategory(b.categoryId);
                    setLimit(String(b.limit));
                  }}
                >
                  Edit
                </button>
                <button
                  className="danger"
                  disabled={pending > 0}
                  onClick={() => {
                    if (confirm("Delete budget?"))
                      void dispatch(
                        mutate({ path: `budgets/${b.id}`, method: "DELETE" }),
                      );
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <p className="muted">Total remaining: {money(total - used)}</p>
        </Card>
        <Card title={id ? "Edit budget" : "Add budget"}>
          <Form
            busy={pending > 0}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await dispatch(
                  mutate({
                    path: id ? `budgets/${id}` : "budgets",
                    method: id ? "PATCH" : "POST",
                    body: { categoryId: category, month, limit: Number(limit) },
                  }),
                ).unwrap();
                setId("");
                setCategory("");
                setLimit("");
              } catch {
                /* global error */
              }
            }}
          >
            <Field label="Expense category">
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {data.categories
                  .filter((c) => c.type === "expense")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Monthly limit (EUR)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </Field>
            {id && (
              <button
                type="button"
                onClick={() => {
                  setId("");
                  setCategory("");
                  setLimit("");
                }}
              >
                Cancel edit
              </button>
            )}
          </Form>
        </Card>
      </div>
    </>
  );
}
