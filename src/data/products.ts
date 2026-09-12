import tent55Url from "../assets/glb/Tent_5_5.glb?url";
import tent65Url from "../assets/glb/Tent_6.5_6.5.glb?url";
import tent88Url from "../assets/glb/Tent_8_8.glb?url";
import type { ProductDefinition, ProductSize } from "../types/product";

export const CANOPY_PRODUCT: ProductDefinition = {
  id: "custom-canopy-tent",
  name: "Custom Canopy Tent",
  description:
    "Configurable pop-up canopy with independent fabric, frame, and branding options.",
  category: "canopy-tent",
  materialSlots: ["canopy", "inner", "frame"],
  designSurfaces: ["canopyFront"],
  wallPackages: ["none", "single", "full"],
  defaultColors: {
    canopy: "white",
    inner: "white",
    frame: "silver",
  },
  variants: [
    {
      id: "tent-5x5",
      size: "5x5",
      label: "5 × 5 ft",
      modelUrl: tent55Url,
      canopyHeight: 2.55,
      halfWidth: 0.76,
    },
    {
      id: "tent-6.5x6.5",
      size: "6.5x6.5",
      label: "6.5 × 6.5 ft",
      modelUrl: tent65Url,
      canopyHeight: 2.7,
      halfWidth: 0.99,
    },
    {
      id: "tent-8x8",
      size: "8x8",
      label: "8 × 8 ft",
      modelUrl: tent88Url,
      canopyHeight: 2.85,
      halfWidth: 1.22,
    },
  ],
};

export function getVariantBySize(size: ProductSize) {
  const variant = CANOPY_PRODUCT.variants.find((v) => v.size === size);
  if (!variant) {
    throw new Error(`Unknown product size: ${size}`);
  }
  return variant;
}

export function getVariantById(variantId: string) {
  const variant = CANOPY_PRODUCT.variants.find((v) => v.id === variantId);
  if (!variant) {
    throw new Error(`Unknown variant: ${variantId}`);
  }
  return variant;
}

/** GLB material name → configurator material slot */
export const MATERIAL_SLOT_MAP = {
  fabric_Mat: "canopy",
  Inner_fabric: "inner",
  Metal_mat: "frame",
} as const;
