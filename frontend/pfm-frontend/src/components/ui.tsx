import type { ReactNode, FormEvent } from "react";
import { money } from "../models";
export function Heading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="card">
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.max(0, value))}
    >
      <span
        className={value > 100 ? "over" : ""}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
export function Empty({ text = "Nothing here yet." }: { text?: string }) {
  return <p className="empty">{text}</p>;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Form({
  children,
  onSubmit,
  busy,
  label = "Save",
}: {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  busy?: boolean;
  label?: string;
}) {
  return (
    <form onSubmit={onSubmit} className="form">
      {children}
      <button className="primary" disabled={busy} type="submit">
        {busy ? "Saving…" : label}
      </button>
    </form>
  );
}
export function Summary({
  label,
  value,
  detail,
  tone = "",
}: {
  label: string;
  value: number;
  detail: string;
  tone?: string;
}) {
  return (
    <Card>
      <div className="summary-label">{label}</div>
      <strong className={"summary-number " + tone}>{money(value)}</strong>
      <p className="muted">{detail}</p>
    </Card>
  );
}
export function Loading() {
  return (
    <div role="status" className="loading">
      <span className="spinner" /> Loading…
    </div>
  );
}
