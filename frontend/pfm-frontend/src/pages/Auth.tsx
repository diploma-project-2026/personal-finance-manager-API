import { useState } from "react";
import { useFinance, useAppDispatch, authenticate } from "../store";
import { Wallet } from "lucide-react";
import { Card, Field, Form } from "../components/ui";
export default function Auth() {
  const [register, setRegister] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const { pending } = useFinance(),
    dispatch = useAppDispatch();
  return (
    <div className="auth">
      <div className="auth-brand">
        <Wallet size={36} />
        <h1>Personal Finance Manager</h1>
        <p>Understand your spending. Plan your future.</p>
      </div>
      <Card title={register ? "Create an account" : "Welcome back"}>
        <Form
          busy={pending > 0}
          label={register ? "Create account" : "Sign in"}
          onSubmit={(e) => {
            e.preventDefault();
            void dispatch(
              authenticate({
                path: register ? "auth/register" : "auth/login",
                body: { name, email, password },
              }),
            );
          }}
        >
          {register && (
            <Field label="Name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          )}
          <Field label="Email">
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              minLength={8}
              autoComplete={register ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </Form>
        <button onClick={() => setRegister(!register)}>
          {register ? "Already registered? Sign in" : "Create account"}
        </button>
        <hr />
        <button
          className="primary full"
          disabled={pending > 0}
          onClick={() => dispatch(authenticate({ path: "demo" }))}
        >
          Explore demo
        </button>
        <p className="muted">
          Review environment · synthetic data · no real financial information
        </p>
      </Card>
    </div>
  );
}
