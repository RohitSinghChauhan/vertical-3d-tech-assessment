import type { ReactNode } from "react";

export function PanelSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}
