import { useConfiguratorStore } from "../../store/configuratorStore";
import { PRINT_OPTIONS, WALL_OPTIONS } from "../../utils/general";
import { PanelSection } from "../ui/PanelSection";

export function SectionSelector() {
  const wallPackage = useConfiguratorStore(
    (s) => s.configuration.sections.wallPackage,
  );
  const printSide = useConfiguratorStore(
    (s) => s.configuration.sections.printSide,
  );
  const setWallPackage = useConfiguratorStore((s) => s.setWallPackage);
  const setPrintSide = useConfiguratorStore((s) => s.setPrintSide);

  return (
    <PanelSection title="Walls & sections">
      <div className="space-y-2">
        {WALL_OPTIONS.map((option) => {
          const selected = option.id === wallPackage;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setWallPackage(option.id)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                selected
                  ? "border-brand bg-brand/10"
                  : "border-line bg-white hover:border-brand/40"
              }`}
            >
              <span className="font-medium text-ink">{option.label}</span>
              <span className="text-xs text-ink-muted">{option.hint}</span>
            </button>
          );
        })}
      </div>

      {wallPackage !== "none" ? (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            Wall print
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRINT_OPTIONS.map((option) => {
              const selected = option.id === printSide;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPrintSide(option.id)}
                  className={`rounded-md border px-3 py-2 text-left transition ${
                    selected
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-muted">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-muted">
            Orbit inside the booth to compare outside vs inside wall faces.
          </p>
        </div>
      ) : null}
    </PanelSection>
  );
}
