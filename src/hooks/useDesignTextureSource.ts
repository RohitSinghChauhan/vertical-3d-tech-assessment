import { useEffect, useState } from "react";
import {
  getOrderedDesignElements,
  renderDesignToCanvas,
} from "../utils/designCanvas";
import type { ImageElement, TextElement } from "../types/configurator";

/** Builds a canvas used as a Three.js branding texture from shared config. */
export function useDesignTextureSource(
  textElements: TextElement[],
  imageElements: ImageElement[],
) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasDesign =
    textElements.length > 0 || imageElements.length > 0;

  useEffect(() => {
    if (!hasDesign) {
      setCanvas(null);
      return;
    }

    let cancelled = false;

    renderDesignToCanvas(
      getOrderedDesignElements(textElements, imageElements),
      1024,
      512,
      "transparent",
    )
      .then((next) => {
        if (cancelled) return;
        setCanvas(next);
        setVersion((v) => v + 1);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Design render failed.");
      });

    return () => {
      cancelled = true;
    };
  }, [textElements, imageElements, hasDesign]);

  return { canvas, version, error, hasDesign };
}
