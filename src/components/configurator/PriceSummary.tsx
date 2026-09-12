import { useConfiguratorStore } from "../../store/configuratorStore";
import { useUiStore } from "../../store/uiStore";
import { Loader } from "../ui/Loader";
import { ErrorMessage } from "../ui/ErrorMessage";
import { PanelSection } from "../ui/PanelSection";

export function PriceSummary() {
  const quantity = useConfiguratorStore((s) => s.configuration.quantity);
  const setQuantity = useConfiguratorStore((s) => s.setQuantity);
  const quote = useUiStore((s) => s.quote);
  const pricingStatus = useUiStore((s) => s.pricingStatus);
  const pricingError = useUiStore((s) => s.pricingError);

  return (
    <PanelSection title="Pricing">
      <label className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-ink-muted">Quantity</span>
        <input
          type="number"
          min={1}
          max={99}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-20 rounded-md border border-line px-2 py-1 text-right"
        />
      </label>

      {pricingStatus === "loading" ? <Loader label="Fetching price…" /> : null}
      {pricingStatus === "error" && pricingError ? (
        <ErrorMessage message={pricingError} />
      ) : null}

      {quote ? (
        <div className="space-y-1.5 text-sm">
          {quote.lines.map((line) => (
            <div key={line.code} className="flex justify-between gap-3">
              <span className="text-ink-muted">{line.label}</span>
              <span>${line.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold">
            <span>Total</span>
            <span>
              ${quote.total.toFixed(2)} {quote.currency}
            </span>
          </div>
        </div>
      ) : null}
    </PanelSection>
  );
}
