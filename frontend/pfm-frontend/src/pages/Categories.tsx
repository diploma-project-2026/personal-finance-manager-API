import { useState } from "react";
import { useFinance, useAppDispatch, mutate } from "../store";
import type { Kind } from "../models";
import { Heading, Card, Form, Field } from "../components/ui";
export default function Categories() {
  const { data, pending } = useFinance(),
    dispatch = useAppDispatch(),
    [name, setName] = useState(""),
    [kind, setKind] = useState<Kind>("expense");
  return (
    <>
      <Heading title="Categories" subtitle="Organize income and expenses" />
      <div className="two-col">
        <Card title="Your categories">
          {data?.categories.map((c) => (
            <div className="spread budget-row" key={c.id}>
              <span>
                {c.name} · {c.type}
              </span>
              <button
                className="danger"
                disabled={pending > 0}
                onClick={() => {
                  if (confirm("Delete category?"))
                    void dispatch(
                      mutate({ path: `categories/${c.id}`, method: "DELETE" }),
                    );
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </Card>
        <Card title="Add category">
          <Form
            busy={pending > 0}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await dispatch(
                  mutate({
                    path: "categories",
                    method: "POST",
                    body: { name, type: kind },
                  }),
                ).unwrap();
                setName("");
              } catch {
                /* global error */
              }
            }}
          >
            <Field label="Category name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Type">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as Kind)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>
          </Form>
        </Card>
      </div>
    </>
  );
}
