import { ui } from "../../styles/ui";
import type { ReactNode } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className={ui("page-heading")}>
      <div>
        <div className={ui("eyebrow")}>{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Panel({
  title,
  children,
  className = "",
  collapsible = false,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className={ui(`panel ${className}`)}>
      <div className={ui("panel-heading")}>
        <h2>{title}</h2>
        {collapsible && (
          <button
            className={ui("icon-button")}
            aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {open && <div className={ui("panel-body")}>{children}</div>}
    </section>
  );
}
export function CheckItem({
  done,
  children,
}: {
  done: boolean;
  children: ReactNode;
}) {
  return (
    <div className={ui(`check-item ${done ? "done" : ""}`)}>
      <span>{done && <Check size={12} />}</span>
      {children}
    </div>
  );
}
