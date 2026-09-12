import type { ReactNode } from "react";
import { Copy, Trash2, Type } from "lucide-react";
import { useConfiguratorStore } from "../../store/configuratorStore";
import type { TextElement } from "../../types/configurator";
import { Button } from "../ui/Button";
import { PanelSection } from "../ui/PanelSection";
import { FONT_OPTIONS } from "../../utils/general";

const ALIGN_OPTIONS: TextElement["align"][] = ["left", "center", "right"];

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-muted"
    >
      {children}
    </label>
  );
}

export function TextControls() {
  const selectedElementId = useConfiguratorStore((s) => s.selectedElementId);
  const textElements = useConfiguratorStore(
    (s) => s.configuration.textElements,
  );
  const addTextElement = useConfiguratorStore((s) => s.addTextElement);
  const updateTextElement = useConfiguratorStore((s) => s.updateTextElement);
  const updateElementTransform = useConfiguratorStore(
    (s) => s.updateElementTransform,
  );
  const removeElement = useConfiguratorStore((s) => s.removeElement);
  const duplicateSelectedElement = useConfiguratorStore(
    (s) => s.duplicateSelectedElement,
  );
  const selectElement = useConfiguratorStore((s) => s.selectElement);

  const selected = textElements.find((el) => el.id === selectedElementId);

  return (
    <PanelSection title="Text">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => addTextElement()}>
          <Type className="size-4" />
          Add text
        </Button>
        {selected ? (
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={duplicateSelectedElement}
            >
              <Copy className="size-4" />
              Duplicate
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => removeElement(selected.id)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </>
        ) : null}
      </div>

      {textElements.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {textElements.map((el, index) => {
            const active = el.id === selectedElementId;
            return (
              <button
                key={el.id}
                type="button"
                onClick={() => selectElement(el.id)}
                className={`max-w-[9rem] truncate rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-white text-ink-muted hover:border-brand/40"
                }`}
                title={el.content}
              >
                {el.content || `Text ${index + 1}`}
              </button>
            );
          })}
        </div>
      ) : null}

      {selected ? (
        <div className="mt-3 space-y-3 rounded-md border border-line bg-surface-muted/40 p-3">
          <div>
            <FieldLabel htmlFor="text-content">Content</FieldLabel>
            <input
              id="text-content"
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
              value={selected.content}
              onChange={(e) =>
                updateTextElement(selected.id, { content: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="text-font">Font</FieldLabel>
              <select
                id="text-font"
                className="w-full rounded-md border border-line bg-white px-2 py-2 text-sm"
                value={selected.fontFamily}
                onChange={(e) =>
                  updateTextElement(selected.id, {
                    fontFamily: e.target.value,
                  })
                }
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Weight</FieldLabel>
              <div className="grid grid-cols-2 gap-1">
                {(["normal", "bold"] as const).map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() =>
                      updateTextElement(selected.id, { fontWeight: weight })
                    }
                    className={`rounded-md border px-2 py-2 text-sm capitalize ${
                      selected.fontWeight === weight
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-line bg-white"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Alignment</FieldLabel>
            <div className="grid grid-cols-3 gap-1">
              {ALIGN_OPTIONS.map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateTextElement(selected.id, { align })}
                  className={`rounded-md border px-2 py-2 text-sm capitalize ${
                    selected.align === align
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-line bg-white"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="text-size">
                Size ({selected.fontSize}px)
              </FieldLabel>
              <input
                id="text-size"
                type="range"
                min={18}
                max={120}
                value={selected.fontSize}
                className="w-full"
                onChange={(e) =>
                  updateTextElement(selected.id, {
                    fontSize: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="text-color">Color</FieldLabel>
              <input
                id="text-color"
                type="color"
                value={selected.fill}
                className="h-9 w-full cursor-pointer rounded border border-line bg-white"
                onChange={(e) =>
                  updateTextElement(selected.id, { fill: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="text-spacing">
                Letter spacing ({selected.letterSpacing})
              </FieldLabel>
              <input
                id="text-spacing"
                type="range"
                min={-2}
                max={20}
                step={1}
                value={selected.letterSpacing}
                className="w-full"
                onChange={(e) =>
                  updateTextElement(selected.id, {
                    letterSpacing: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <FieldLabel htmlFor="text-rotation">
                Rotation ({Math.round(selected.transform.rotation)}°)
              </FieldLabel>
              <input
                id="text-rotation"
                type="range"
                min={-180}
                max={180}
                value={selected.transform.rotation}
                className="w-full"
                onChange={(e) =>
                  updateElementTransform(selected.id, {
                    rotation: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-ink-muted">
          Add text or select a chip / 2D element to edit typography.
        </p>
      )}
    </PanelSection>
  );
}
