import { useEffect } from "react";
import { quoteConfiguration } from "../services/pricingService";
import { useConfiguratorStore } from "../store/configuratorStore";
import { useUiStore } from "../store/uiStore";

/** Keeps pricing quote in sync with configuration via the pricing service. */
export function usePricingSync() {
  const configuration = useConfiguratorStore((s) => s.configuration);
  const setPricingLoading = useUiStore((s) => s.setPricingLoading);
  const setPricingReady = useUiStore((s) => s.setPricingReady);
  const setPricingError = useUiStore((s) => s.setPricingError);

  useEffect(() => {
    let cancelled = false;
    setPricingLoading();

    quoteConfiguration(configuration)
      .then((quote) => {
        if (!cancelled) setPricingReady(quote);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPricingError(
            error instanceof Error ? error.message : "Pricing request failed.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    configuration,
    setPricingError,
    setPricingLoading,
    setPricingReady,
  ]);
}
