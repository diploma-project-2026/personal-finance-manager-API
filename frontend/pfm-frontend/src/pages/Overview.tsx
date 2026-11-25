import { useState } from "react";
import { Link } from "react-router-dom";
import { useFinance } from "../store";
import { today, money } from "../models";
import { Card, Heading, Summary, Progress, Empty } from "../components/ui";
import { BudgetRow } from "../components/BudgetRow";
import { TransactionTable } from "../components/TransactionTable";
export default function Overview() {
  const { data } = useFinance();
  const [month, setMonth] = useState(today().slice(0, 7));
  if (!data) return null;
  const rows = data.transactions.filter((t) => t.date.startsWith(month));
  const income = rows
      .filter((t) => t.type === "income")
      .reduce((a, t) => a + t.amount, 0),
    expense = rows
      .filter((t) => t.type === "expense")
      .reduce((a, t) => a + t.amount, 0);
  const spending = data.categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      name: c.name,
      amount: rows
        .filter((t) => t.categoryId === c.id)
        .reduce((a, t) => a + t.amount, 0),
    }))
    .filter((c) => c.amount > 0);
  const colors = [
    "#3478d5",
    "#36a88a",
    "#efb54e",
    "#8966cd",
    "#e77877",
    "#64748b",
  ];
  let start = 0;
  return (
    <>
      <Heading
        title="Financial Overview"
        subtitle="Your personal finance summary"
        action={
          <input
            aria-label="Select month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        }
      />
      <div className="three-col">
        <Summary
          label="Income"
          value={income}
          detail="Selected month"
          tone="positive"
        />
        <Summary label="Expenses" value={expense} detail="Selected month" />
        <Summary
          label="Balance"
          value={income - expense}
          detail="Income minus expenses"
        />
      </div>
      <div className="two-col">
        <Card title="Budget Progress">
          {data.budgets
            .filter((b) => b.month === month)
            .slice(0, 3)
            .map((b) => (
              <BudgetRow
                key={b.id}
                name={
                  data.categories.find((c) => c.id === b.categoryId)?.name ||
                  "Category"
                }
                limit={b.limit}
                spent={rows
                  .filter(
                    (t) =>
                      t.categoryId === b.categoryId && t.type === "expense",
                  )
                  .reduce((a, t) => a + t.amount, 0)}
              />
            ))}
          {!data.budgets.some((b) => b.month === month) && (
            <Empty text="No budgets for this month." />
          )}
          <Link to="/budgets">View all budgets →</Link>
        </Card>
        <Card title="Spending by Category">
          {expense ? (
            <div className="chart-layout">
              <svg
                viewBox="0 0 120 120"
                role="img"
                aria-label="Spending by category; detailed amounts listed beside chart"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#dce3ee"
                  strokeWidth="23"
                />
                {spending.map((c, i) => {
                  const portion = (c.amount / expense) * 282.743;
                  const offset = start;
                  start += portion;
                  return (
                    <circle
                      key={c.name}
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke={colors[i % colors.length]}
                      strokeWidth="23"
                      strokeDasharray={`${portion} ${282.743 - portion}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 60 60)"
                    />
                  );
                })}
              </svg>
              <div className="legend">
                {spending.map((c, i) => (
                  <div key={c.name}>
                    <span
                      style={{ background: colors[i % colors.length] }}
                      className="dot"
                    />
                    {c.name}
                    <strong>{money(c.amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Empty text="No expenses for this month." />
          )}
        </Card>
        <Card title="Recent Transactions">
          <TransactionTable
            rows={[...rows]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)}
            categories={data.categories}
          />
          <Link to="/transactions">View all transactions →</Link>
        </Card>
        <Card title="Financial Goals">
          {data.goals.map((g) => (
            <div key={g.id} className="budget-row">
              <div className="spread">
                <strong>{g.name}</strong>
                <span>
                  {money(g.saved)} / {money(g.target)}
                </span>
              </div>
              <Progress value={(g.saved / g.target) * 100} />
            </div>
          ))}
          {!data.goals.length && <Empty />}
          <Link to="/goals">View all goals →</Link>
        </Card>
      </div>
    </>
  );
}
