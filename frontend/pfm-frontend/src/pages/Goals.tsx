import { useState } from "react";
import { useFinance, useAppDispatch, mutate } from "../store";
import { money } from "../models";
import { Heading, Card, Form, Field, Progress, Empty } from "../components/ui";
export default function Goals() {
  const { data, pending } = useFinance(),
    dispatch = useAppDispatch(),
    [id, setId] = useState(""),
    [name, setName] = useState(""),
    [target, setTarget] = useState(""),
    [saved, setSaved] = useState("0");
  return (
    <>
      <Heading
        title="Financial Goals"
        subtitle="Plan savings and track your progress"
      />
      <div className="two-col">
        <Card title="Your goals">
          {!data?.goals.length && <Empty />}
          {data?.goals.map((g) => (
            <div className="budget-row" key={g.id}>
              <div className="spread">
                <strong>{g.name}</strong>
                <span>
                  {money(g.saved)} / {money(g.target)}
                </span>
              </div>
              <Progress value={(g.saved / g.target) * 100} />
              <div className="actions">
                <button
                  onClick={() => {
                    setId(g.id);
                    setName(g.name);
                    setTarget(String(g.target));
                    setSaved(String(g.saved));
                  }}
                >
                  Edit / contribute
                </button>
                <button
                  className="danger"
                  disabled={pending > 0}
                  onClick={() => {
                    if (confirm("Delete goal?"))
                      void dispatch(
                        mutate({ path: `goals/${g.id}`, method: "DELETE" }),
                      );
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </Card>
        <Card title={id ? "Edit goal" : "New goal"}>
          <Form
            busy={pending > 0}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await dispatch(
                  mutate({
                    path: id ? `goals/${id}` : "goals",
                    method: id ? "PATCH" : "POST",
                    body: {
                      name,
                      target: Number(target),
                      saved: Number(saved),
                    },
                  }),
                ).unwrap();
                setId("");
                setName("");
                setTarget("");
                setSaved("0");
              } catch {
                /* global error */
              }
            }}
          >
            <Field label="Goal name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Target amount (EUR)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </Field>
            <Field label="Amount saved (EUR)">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
              />
            </Field>
            {id && (
              <button
                type="button"
                onClick={() => {
                  setId("");
                  setName("");
                  setTarget("");
                  setSaved("0");
                }}
              >
                Cancel
              </button>
            )}
          </Form>
        </Card>
      </div>
    </>
  );
}
