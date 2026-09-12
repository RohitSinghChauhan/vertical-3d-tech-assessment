import { CANOPY_PRODUCT, getVariantById, getVariantBySize } from "../data/products";
import { FABRIC_COLORS, FRAME_COLORS } from "../data/colors";
import type { ProductConfiguration } from "../types/configurator";
import type { ProductSize } from "../types/product";

const EXPORT_VERSION = 1;

export interface ConfigurationExportFile {
  version: number;
  exportedAt: string;
  productId: string;
  configuration: ProductConfiguration;
}

async function blobUrlToDataUrl(url: string): Promise<string> {
  if (!url.startsWith("blob:")) return url;
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to encode image."));
    reader.readAsDataURL(blob);
  });
}

export async function serializeConfiguration(
  configuration: ProductConfiguration,
): Promise<ConfigurationExportFile> {
  const imageElements = await Promise.all(
    configuration.imageElements.map(async (image) => ({
      ...image,
      src: await blobUrlToDataUrl(image.src),
    })),
  );

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    productId: configuration.productId,
    configuration: {
      ...configuration,
      imageElements,
    },
  };
}

export function downloadConfigurationJson(payload: ConfigurationExportFile) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `canopy-config-${configurationStamp()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function configurationStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function isProductSize(value: unknown): value is ProductSize {
  return value === "5x5" || value === "6.5x6.5" || value === "8x8";
}

export function parseConfigurationImport(raw: unknown): ProductConfiguration {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid configuration file.");
  }

  const root = raw as Record<string, unknown>;
  const configuration = (root.configuration ?? root) as Record<string, unknown>;

  if (!isProductSize(configuration.size)) {
    throw new Error("Configuration is missing a valid size.");
  }

  const variant = getVariantBySize(configuration.size);
  const colors = configuration.colors as ProductConfiguration["colors"] | undefined;
  const sections = configuration.sections as
    | ProductConfiguration["sections"]
    | undefined;

  if (!colors?.canopy || !colors.inner || !colors.frame) {
    throw new Error("Configuration colors are incomplete.");
  }

  const fabricIds = new Set(FABRIC_COLORS.map((c) => c.id));
  const frameIds = new Set(FRAME_COLORS.map((c) => c.id));
  if (
    !fabricIds.has(colors.canopy) ||
    !fabricIds.has(colors.inner) ||
    !frameIds.has(colors.frame)
  ) {
    throw new Error("Configuration contains unknown color ids.");
  }

  if (!sections?.wallPackage) {
    throw new Error("Configuration sections are incomplete.");
  }

  const textElements = Array.isArray(configuration.textElements)
    ? configuration.textElements
    : [];
  const imageElements = Array.isArray(configuration.imageElements)
    ? configuration.imageElements
    : [];

  const variantId =
    typeof configuration.variantId === "string"
      ? configuration.variantId
      : variant.id;

  try {
    getVariantById(variantId);
  } catch {
    // fall back to size-matched variant
  }

  return {
    productId:
      typeof configuration.productId === "string"
        ? configuration.productId
        : CANOPY_PRODUCT.id,
    variantId: getVariantBySize(configuration.size).id,
    size: configuration.size,
    colors,
    sections: {
      wallPackage: sections.wallPackage,
      printSide: sections.printSide === "double" ? "double" : "single",
    },
    textElements: textElements as ProductConfiguration["textElements"],
    imageElements: imageElements as ProductConfiguration["imageElements"],
    quantity:
      typeof configuration.quantity === "number"
        ? Math.max(1, Math.min(99, configuration.quantity))
        : 1,
  };
}

export async function readConfigurationFile(
  file: File,
): Promise<ProductConfiguration> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  return parseConfigurationImport(parsed);
}
