import type { ReactNode } from "react";

export function Button({
  children,
  disabled,
  onClick,
  variant = "default",
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "secondary" | "danger";
  type?: "button" | "submit";
}) {
  return (
    <button
      className={`button button-${variant}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Panel({
  children,
  title,
  eyebrow,
}: {
  children: ReactNode;
  title: string;
  eyebrow?: string;
}) {
  return (
    <section className="panel">
      {eyebrow ? <div className="panel-eyebrow">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}
