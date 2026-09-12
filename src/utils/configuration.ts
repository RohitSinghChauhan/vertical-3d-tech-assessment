import { CANOPY_PRODUCT, getVariantBySize } from "../data/products";
import type { ProductConfiguration } from "../types/configurator";

export function createDefaultConfiguration(): ProductConfiguration {
  const variant = getVariantBySize("8x8");
  return {
    productId: CANOPY_PRODUCT.id,
    variantId: variant.id,
    size: variant.size,
    colors: { ...CANOPY_PRODUCT.defaultColors },
    sections: {
      wallPackage: "none",
      printSide: "single",
    },
    textElements: [],
    imageElements: [],
    quantity: 1,
  };
}

export function cloneConfiguration(
  configuration: ProductConfiguration,
): ProductConfiguration {
  return structuredClone(configuration);
}
