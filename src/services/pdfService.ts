import { jsPDF } from "jspdf";
import { CANOPY_PRODUCT, getVariantById } from "../data/products";
import { FABRIC_COLORS, FRAME_COLORS, findColorHex } from "../data/colors";
import type { ProductConfiguration } from "../types/configurator";
import type { PriceQuote } from "../types/pricing";
import {
  getOrderedDesignElements,
  renderDesignToCanvas,
} from "../utils/designCanvas";

export interface PdfExportInput {
  configuration: ProductConfiguration;
  quote: PriceQuote;
  previewDataUrl?: string | null;
}

function colorLabel(slot: "canopy" | "inner" | "frame", id: string): string {
  const palette = slot === "frame" ? FRAME_COLORS : FABRIC_COLORS;
  const option = palette.find((c) => c.id === id);
  return option ? `${option.label} (${option.hex})` : id;
}

/** Client-side production summary PDF for order attachment. */
export async function generateConfigurationPdf(
  input: PdfExportInput,
): Promise<Blob> {
  const { configuration, quote, previewDataUrl } = input;
  const variant = getVariantById(configuration.variantId);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;

  const write = (text: string, size = 11, gap = 16) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 516);
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.9) + gap * 0.35;
  };

  doc.setFont("helvetica", "bold");
  write("Configuration / Production Summary", 18, 8);
  doc.setFont("helvetica", "normal");
  write(`Generated: ${new Date().toLocaleString()}`);
  write(`Product: ${CANOPY_PRODUCT.name}`);
  write(`Variant: ${variant.label} (${configuration.variantId})`);
  write(`Size: ${configuration.size}`);
  write(`Quantity: ${configuration.quantity}`);
  write(`Wall package: ${configuration.sections.wallPackage}`);
  write(`Wall print: ${configuration.sections.printSide}`);
  write(`Canopy color: ${colorLabel("canopy", configuration.colors.canopy)}`);
  write(`Inner fabric: ${colorLabel("inner", configuration.colors.inner)}`);
  write(`Frame color: ${colorLabel("frame", configuration.colors.frame)}`);

  y += 8;
  doc.setFont("helvetica", "bold");
  write("Design elements", 13, 6);
  doc.setFont("helvetica", "normal");

  if (
    configuration.textElements.length === 0 &&
    configuration.imageElements.length === 0
  ) {
    write("No text or logo customizations.");
  }

  configuration.textElements.forEach((el, index) => {
    write(
      `Text ${index + 1}: "${el.content}" @ (${el.transform.x.toFixed(2)}, ${el.transform.y.toFixed(2)}) scale ${el.transform.scaleX.toFixed(2)} rot ${el.transform.rotation}°`,
    );
  });

  configuration.imageElements.forEach((el, index) => {
    write(
      `Image ${index + 1}: ${el.fileName} @ (${el.transform.x.toFixed(2)}, ${el.transform.y.toFixed(2)}) scale ${el.transform.scaleX.toFixed(2)} rot ${el.transform.rotation}°`,
    );
  });

  y += 6;
  doc.setFont("helvetica", "bold");
  write("Pricing", 13, 6);
  doc.setFont("helvetica", "normal");
  quote.lines.forEach((line) => {
    write(`${line.label}: $${line.amount.toFixed(2)}`);
  });
  write(`Unit subtotal: $${quote.subtotal.toFixed(2)}`);
  doc.setFont("helvetica", "bold");
  write(`Final total: $${quote.total.toFixed(2)} ${quote.currency}`, 12);

  if (previewDataUrl) {
    if (y > 520) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    write("3D preview", 13, 8);
    try {
      doc.addImage(previewDataUrl, "PNG", margin, y, 320, 200);
      y += 220;
    } catch {
      write("Preview image could not be embedded.");
    }
  }

  try {
    const designCanvas = await renderDesignToCanvas(
      getOrderedDesignElements(
        configuration.textElements,
        configuration.imageElements,
      ),
      1024,
      512,
      findColorHex(FABRIC_COLORS, configuration.colors.canopy, "#ffffff"),
    );
    if (y > 480) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    write("2D design panel", 13, 8);
    const designUrl = designCanvas.toDataURL("image/png");
    doc.addImage(designUrl, "PNG", margin, y, 400, 200);
  } catch {
    write("2D design preview unavailable.");
  }

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
