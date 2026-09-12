import { addToCart } from "../../services/shopifyCartService";
import {
  downloadBlob,
  generateConfigurationPdf,
} from "../../services/pdfService";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { useUiStore } from "../../store/uiStore";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { FileDown, ShoppingCart } from "lucide-react";

interface CartActionsProps {
  capturePreview: (() => string | null) | null;
}

export function CartActions({ capturePreview }: CartActionsProps) {
  const getConfiguration = useConfiguratorStore((s) => s.getConfiguration);
  const quote = useUiStore((s) => s.quote);
  const cartStatus = useUiStore((s) => s.cartStatus);
  const cartError = useUiStore((s) => s.cartError);
  const pdfStatus = useUiStore((s) => s.pdfStatus);
  const pdfError = useUiStore((s) => s.pdfError);
  const lastCartPayload = useUiStore((s) => s.lastCartPayload);
  const showCartDebug = useUiStore((s) => s.showCartDebug);
  const setCartLoading = useUiStore((s) => s.setCartLoading);
  const setCartSuccess = useUiStore((s) => s.setCartSuccess);
  const setCartError = useUiStore((s) => s.setCartError);
  const setPdfLoading = useUiStore((s) => s.setPdfLoading);
  const setPdfIdle = useUiStore((s) => s.setPdfIdle);
  const setPdfError = useUiStore((s) => s.setPdfError);
  const toggleCartDebug = useUiStore((s) => s.toggleCartDebug);

  const handleAddToCart = async () => {
    if (!quote) {
      setCartError("Price is not ready yet.");
      return;
    }
    setCartLoading();
    try {
      const result = await addToCart(getConfiguration(), quote.total);
      setCartSuccess(result.payload);
    } catch (error) {
      setCartError(
        error instanceof Error ? error.message : "Add to cart failed.",
      );
    }
  };

  const handlePdf = async () => {
    if (!quote) {
      setPdfError("Price is not ready yet.");
      return;
    }
    setPdfLoading();
    try {
      const previewDataUrl = capturePreview?.() ?? null;
      const blob = await generateConfigurationPdf({
        configuration: getConfiguration(),
        quote,
        previewDataUrl,
      });
      downloadBlob(blob, `canopy-configuration-${Date.now()}.pdf`);
      setPdfIdle();
    } catch (error) {
      setPdfError(
        error instanceof Error ? error.message : "PDF generation failed.",
      );
    }
  };

  return (
    <div className="space-y-3 border-t border-line pt-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={cartStatus === "loading" || !quote}
        >
          <ShoppingCart className="size-4" />
          {cartStatus === "loading" ? "Adding…" : "Add to cart"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handlePdf()}
          disabled={pdfStatus === "loading" || !quote}
        >
          <FileDown className="size-4" />
          {pdfStatus === "loading" ? "Generating…" : "Download PDF"}
        </Button>
      </div>

      {cartStatus === "success" ? (
        <p className="text-sm font-medium text-emerald-700">
          Added to cart (mock Shopify).
        </p>
      ) : null}
      {cartError ? <ErrorMessage message={cartError} /> : null}
      {pdfError ? <ErrorMessage message={pdfError} /> : null}

      {lastCartPayload ? (
        <div className="space-y-2">
          <button
            type="button"
            className="text-xs font-medium text-brand underline"
            onClick={toggleCartDebug}
          >
            {showCartDebug ? "Hide" : "Show"} cart payload
          </button>
          {showCartDebug ? (
            <pre className="max-h-48 overflow-auto rounded-md bg-ink px-3 py-2 text-[11px] leading-relaxed text-emerald-200">
              {JSON.stringify(lastCartPayload, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      <p className="text-[11px] text-ink-muted">
        Shopify is mocked for this assessment. The cart service can be swapped
        for the Storefront API later without rewriting the configurator.
      </p>
    </div>
  );
}
