import { Keyboard } from "lucide-react";
import { SizeSelector } from "./SizeSelector";
import { SectionSelector } from "./SectionSelector";
import { ColorControls } from "./ColorControls";
import { TextControls } from "./TextControls";
import { ImageUploader } from "./ImageUploader";
import { PriceSummary } from "./PriceSummary";
import { CartActions } from "./CartActions";

interface ConfiguratorControlsProps {
  capturePreview: (() => string | null) | null;
}

export function ConfiguratorControls({
  capturePreview,
}: ConfiguratorControlsProps) {
  return (
    <div className="flex flex-col p-4">
      <div className="mb-4 flex items-start gap-2 rounded-lg bg-brand/5 px-3 py-2.5 text-xs text-ink-muted">
        <Keyboard className="mt-0.5 size-3.5 shrink-0 text-brand" />
        <p>
          Use <kbd className="rounded border border-line bg-white px-1">Ctrl+Z</kbd>{" "}
          / <kbd className="rounded border border-line bg-white px-1">Ctrl+Y</kbd>{" "}
          for undo/redo.
        </p>
      </div>
      <SizeSelector />
      <SectionSelector />
      <ColorControls />
      <TextControls />
      <ImageUploader />
      <PriceSummary />
      <CartActions capturePreview={capturePreview} />
    </div>
  );
}
