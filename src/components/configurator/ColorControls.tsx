import { FABRIC_COLORS, FRAME_COLORS } from "../../data/colors";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { SLOTS } from "../../utils/general";
import { ColorSwatch } from "../ui/ColorSwatch";
import { PanelSection } from "../ui/PanelSection";

export function ColorControls() {
  const colors = useConfiguratorStore((s) => s.configuration.colors);
  const setMaterialColor = useConfiguratorStore((s) => s.setMaterialColor);

  return (
    <PanelSection title="Colors">
      <div className="space-y-4">
        {SLOTS.map((slot) => {
          const palette = slot.frame ? FRAME_COLORS : FABRIC_COLORS;
          return (
            <div key={slot.id} className="space-y-2">
              <div>
                <p className="text-sm font-medium text-ink">{slot.label}</p>
                <p className="text-[11px] text-ink-muted">{slot.hint}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {palette.map((color) => (
                  <ColorSwatch
                    key={color.id}
                    label={color.label}
                    hex={color.hex}
                    selected={colors[slot.id] === color.id}
                    onSelect={() => setMaterialColor(slot.id, color.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PanelSection>
  );
}
