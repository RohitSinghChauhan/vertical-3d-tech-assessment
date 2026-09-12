import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

interface PreviewCaptureBridgeProps {
  onReady?: (capture: () => string | null) => void;
}

export function PreviewCaptureBridge({ onReady }: PreviewCaptureBridgeProps) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (!onReady) return;
    onReady(() => {
      try {
        return gl.domElement.toDataURL("image/png");
      } catch {
        return null;
      }
    });
  }, [gl, onReady]);

  return null;
}
