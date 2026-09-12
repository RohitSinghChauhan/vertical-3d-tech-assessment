import { lazy, Suspense, useCallback, useState } from "react";
import { usePricingSync } from "../../hooks/usePricingSync";
import { useConfiguratorShortcuts } from "../../hooks/useConfiguratorShortcuts";
import { Loader } from "../ui/Loader";
import { DesignEditor2D } from "../editor/DesignEditor2D";
import { ConfiguratorHeader } from "./ConfiguratorHeader";
import { ConfiguratorControls } from "./ConfiguratorControls";

const ProductCanvas3D = lazy(() =>
  import("../canvas/ProductCanvas3D").then((m) => ({
    default: m.ProductCanvas3D,
  })),
);

export function Configurator() {
  usePricingSync();
  useConfiguratorShortcuts();
  const [capturePreview, setCapturePreview] = useState<
    (() => string | null) | null
  >(null);

  const onPreviewReady = useCallback((capture: () => string | null) => {
    setCapturePreview(() => capture);
  }, []);

  return (
    <div className="min-h-dvh bg-blue-100/20 font-sans text-ink">
      <ConfiguratorHeader />
      <main className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 sm:px-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
        <div className="flex min-h-0 flex-col gap-4">
          <section className="h-[min(62vh,620px)] min-h-[320px] overflow-hidden rounded-xl border border-line/70 bg-white shadow-sm xl:h-[min(72vh,700px)]">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-surface-muted">
                  <Loader label="Loading 3D preview…" />
                </div>
              }
            >
              <ProductCanvas3D onPreviewReady={onPreviewReady} />
            </Suspense>
          </section>
          <section className="rounded-xl border border-line/70 bg-white p-4 shadow-sm">
            <DesignEditor2D />
          </section>
        </div>

        <aside className="rounded-xl border border-line/70 bg-white shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100dvh-1.5rem)] xl:overflow-y-auto">
          <ConfiguratorControls capturePreview={capturePreview} />
        </aside>
      </main>
    </div>
  );
}
