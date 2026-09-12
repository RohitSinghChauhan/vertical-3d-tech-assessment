import type { DesignElement, ImageElement, TextElement } from "../types/configurator";

export const DESIGN_CANVAS_WIDTH = 1024;
export const DESIGN_CANVAS_HEIGHT = 512;

function drawText(
  ctx: CanvasRenderingContext2D,
  element: TextElement,
  width: number,
  height: number,
) {
  const x = element.transform.x * width;
  const y = element.transform.y * height;
  const fontSize = element.fontSize * element.transform.scaleY;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((element.transform.rotation * Math.PI) / 180);
  const weight = element.fontWeight === "bold" ? "bold" : "normal";
  ctx.font = `${weight} ${fontSize}px ${element.fontFamily}`;
  ctx.fillStyle = element.fill;
  ctx.textAlign = element.align;
  ctx.textBaseline = "middle";
  if (element.letterSpacing) {
    ctx.letterSpacing = `${element.letterSpacing}px`;
  }
  ctx.fillText(element.content, 0, 0);
  ctx.restore();
}

async function drawImage(
  ctx: CanvasRenderingContext2D,
  element: ImageElement,
  width: number,
  height: number,
) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${element.fileName}`));
    img.src = element.src;
  });

  const aspect = element.naturalWidth / Math.max(element.naturalHeight, 1);
  const drawW = width * 0.28 * element.transform.scaleX;
  const drawH = drawW / aspect;

  const x = element.transform.x * width;
  const y = element.transform.y * height;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((element.transform.rotation * Math.PI) / 180);
  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

/** Renders design elements to an offscreen canvas for 3D texture / PDF use. */
export async function renderDesignToCanvas(
  elements: DesignElement[],
  width = DESIGN_CANVAS_WIDTH,
  height = DESIGN_CANVAS_HEIGHT,
  background = "transparent",
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create 2D canvas context.");
  }

  ctx.clearRect(0, 0, width, height);
  if (background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  for (const element of elements) {
    if (element.type === "text") {
      drawText(ctx, element, width, height);
    } else {
      await drawImage(ctx, element, width, height);
    }
  }

  return canvas;
}

export function getOrderedDesignElements(
  textElements: TextElement[],
  imageElements: ImageElement[],
): DesignElement[] {
  return [...imageElements, ...textElements];
}
