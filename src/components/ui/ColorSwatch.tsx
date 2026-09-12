interface ColorSwatchProps {
  label: string;
  hex: string;
  selected: boolean;
  onSelect: () => void;
}

export function ColorSwatch({
  label,
  hex,
  selected,
  onSelect,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      className={`size-8 rounded-full border-2 transition ${
        selected
          ? "border-brand ring-2 ring-brand/30"
          : "border-white shadow-sm hover:scale-105"
      }`}
      style={{ backgroundColor: hex }}
    />
  );
}
