import { useState } from "react";
import { Link } from "react-router-dom";
import { useFinance, useAppDispatch, mutate } from "../store";
import type { Transaction } from "../models";
import { Card, Heading, Field } from "../components/ui";
import { TransactionTable } from "../components/TransactionTable";
import { TransactionForm } from "../components/TransactionForm";
export default function Transactions() {
  const { data, pending } = useFinance(),
    dispatch = useAppDispatch();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [month, setMonth] = useState(""),
    [sort, setSort] = useState("new"),
    [editing, setEditing] = useState<Transaction | null>(null);
  if (!data) return null;
  const rows = data.transactions
    .filter(
      (t) =>
        t.merchant.toLowerCase().includes(search.toLowerCase()) &&
        (!category || category === t.categoryId) &&
        (!month || t.date.startsWith(month)),
    )
    .sort((a, b) =>
      sort === "amount" ? b.amount - a.amount : b.date.localeCompare(a.date),
    );
  return (
    <>
      <Heading
        title="Transactions"
        subtitle="Review and manage your financial activity"
        action={
          <Link className="primary" to="/record">
            + Record expense
          </Link>
        }
      />
      {editing && (
        <>
          <button onClick={() => setEditing(null)}>Cancel editing</button>
          <TransactionForm
            key={editing.id}
            categories={data.categories}
            initial={editing}
            busy={pending > 0}
            onSave={async (body) => {
              try {
                await dispatch(
                  mutate({
                    path: `transactions/${editing.id}`,
                    method: "PATCH",
                    body,
                  }),
                ).unwrap();
                setEditing(null);
              } catch {
                /* Handled by the global error handler. */
              }
            }}
          />
        </>
      )}
      <Card>
        <div className="filters">
          <Field label="Search">
            <input
              placeholder="Search transactions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Month">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Field>
          <Field label="Sort">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Newest first</option>
              <option value="amount">Highest amount</option>
            </select>
          </Field>
        </div>
        <TransactionTable
          rows={rows}
          categories={data.categories}
          onEdit={setEditing}
          onDelete={(t) => {
            if (window.confirm(`Delete ${t.merchant}?`))
              void dispatch(
                mutate({ path: `transactions/${t.id}`, method: "DELETE" }),
              );
          }}
        />
      </Card>
    </>
  );
}
