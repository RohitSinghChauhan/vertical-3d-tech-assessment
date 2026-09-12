export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-3 text-sm text-ink-muted"
      role="status"
      aria-live="polite"
    >
      <span className="size-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      <span>{label}</span>
    </div>
  );
}
