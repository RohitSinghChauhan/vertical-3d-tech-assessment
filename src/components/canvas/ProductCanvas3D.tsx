import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import {
  Expand,
  Minimize2,
  RotateCw,
} from "lucide-react";
import { getVariantBySize } from "../../data/products";
import { useDesignTextureSource } from "../../hooks/useDesignTextureSource";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { useUiStore } from "../../store/uiStore";
import { Loader } from "../ui/Loader";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Button } from "../ui/Button";
import { ProductModel } from "./ProductModel";
import { SceneEnvironment, type CameraPresetId } from "./SceneEnvironment";
import { PreviewCaptureBridge } from "./PreviewCaptureBridge";
import { ModelFramer } from "./ModelFramer";

class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message || "3D preview failed.");
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function LoadingIndicator() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-surface/70">
      <Loader label={`Loading model… ${progress.toFixed(0)}%`} />
    </div>
  );
}

interface ProductCanvas3DProps {
  onPreviewReady?: (capture: () => string | null) => void;
}

export function ProductCanvas3D({ onPreviewReady }: ProductCanvas3DProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>("angle");

  const configuration = useConfiguratorStore((s) => s.configuration);
  const modelStatus = useUiStore((s) => s.modelStatus);
  const modelError = useUiStore((s) => s.modelError);
  const setModelLoading = useUiStore((s) => s.setModelLoading);
  const setModelReady = useUiStore((s) => s.setModelReady);
  const setModelError = useUiStore((s) => s.setModelError);

  const variant = getVariantBySize(configuration.size);
  const frameKey = `${variant.modelUrl}:${configuration.sections.wallPackage}`;

  const { canvas, version } = useDesignTextureSource(
    configuration.textElements,
    configuration.imageElements,
  );

  useEffect(() => {
    setModelLoading();
  }, [variant.modelUrl, setModelLoading]);

  const handleReady = useCallback(() => setModelReady(), [setModelReady]);
  const handleError = useCallback(
    (message: string) => setModelError(message),
    [setModelError],
  );

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen((value) => !value);
    }
  };

  return (
    <div
      ref={shellRef}
      className={`relative h-full min-h-[280px] w-full overflow-hidden bg-[radial-gradient(circle_at_30%_18%,#f8fbff,#d9e3ee_72%)] [&_canvas]:cursor-grab [&_canvas]:active:cursor-grabbing ${
        isFullscreen && !document.fullscreenElement
          ? "fixed inset-0 z-50 min-h-dvh rounded-none"
          : "rounded-xl"
      }`}
    >
      <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-white/70 bg-white/90 p-1 shadow-sm backdrop-blur">
          {(
            [
              ["angle", "Angle"],
              ["front", "Front"],
              ["top", "Top"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCameraPreset(id)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                cameraPreset === id
                  ? "bg-brand text-white"
                  : "text-ink-muted hover:bg-surface-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-white/70 bg-white/90 p-1 shadow-sm backdrop-blur">
          <Button
            type="button"
            variant={autoRotate ? "primary" : "ghost"}
            className="!px-2.5 !py-1.5 text-xs"
            onClick={() => setAutoRotate((v) => !v)}
          >
            <RotateCw className="size-3.5" />
            Auto-spin
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2.5 !py-1.5 text-xs"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Expand className="size-3.5" />
            )}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </Button>
        </div>
      </div>

      <LoadingIndicator />
      {modelStatus === "error" && modelError ? (
        <div className="absolute inset-x-3 bottom-3 z-20">
          <ErrorMessage message={modelError} />
        </div>
      ) : null}

      <CanvasErrorBoundary onError={handleError}>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [3.6, 2.1, 4.2], fov: 40, near: 0.1, far: 100 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <SceneEnvironment
            autoRotate={autoRotate}
            cameraPreset={cameraPreset}
          />
          <Suspense fallback={null}>
            <ModelFramer resetKey={frameKey}>
              <ProductModel
                variant={variant}
                colors={configuration.colors}
                wallPackage={configuration.sections.wallPackage}
                printSide={configuration.sections.printSide}
                designCanvas={canvas}
                designVersion={version}
                onReady={handleReady}
                onError={handleError}
              />
            </ModelFramer>
          </Suspense>
          <PreviewCaptureBridge onReady={onPreviewReady} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
