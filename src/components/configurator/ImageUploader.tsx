import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { loadImageDimensions, validateImageFile } from "../../utils/validation";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { PanelSection } from "../ui/PanelSection";

export function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedElementId = useConfiguratorStore((s) => s.selectedElementId);
  const imageElements = useConfiguratorStore(
    (s) => s.configuration.imageElements,
  );
  const addImageElement = useConfiguratorStore((s) => s.addImageElement);
  const removeElement = useConfiguratorStore((s) => s.removeElement);

  const selected = imageElements.find((el) => el.id === selectedElementId);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const src = URL.createObjectURL(file);
      const { width, height } = await loadImageDimensions(src);
      addImageElement({
        src,
        fileName: file.name,
        naturalWidth: width,
        naturalHeight: height,
        transform: { x: 0.5, y: 0.62, scaleX: 1, scaleY: 1, rotation: 0 },
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    }
  };

  return (
    <PanelSection title="Logo / image">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Upload logo
        </Button>
        {selected ? (
          <Button
            type="button"
            variant="danger"
            onClick={() => removeElement(selected.id)}
          >
            <Trash2 className="size-4" />
            Remove logo
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {selected ? (
        <p className="mt-2 truncate text-xs text-ink-muted">{selected.fileName}</p>
      ) : null}
      {error ? (
        <div className="mt-2">
          <ErrorMessage message={error} />
        </div>
      ) : null}
    </PanelSection>
  );
}
