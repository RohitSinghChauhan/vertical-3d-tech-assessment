import { CANOPY_PRODUCT } from "../../data/products";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { PanelSection } from "../ui/PanelSection";

export function SizeSelector() {
  const size = useConfiguratorStore((s) => s.configuration.size);
  const setSize = useConfiguratorStore((s) => s.setSize);

  return (
    <PanelSection title="Size">
      <div className="grid grid-cols-3 gap-2">
        {CANOPY_PRODUCT.variants.map((variant) => {
          const selected = variant.size === size;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSize(variant.size)}
              className={`rounded-md border px-2 py-2 text-sm font-medium transition ${
                selected
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-line bg-white text-ink hover:border-brand/40"
              }`}
            >
              {variant.label}
            </button>
          );
        })}
      </div>
    </PanelSection>
  );
}
