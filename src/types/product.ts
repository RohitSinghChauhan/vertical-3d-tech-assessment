export type ProductSize = "5x5" | "6.5x6.5" | "8x8";

export type WallPackage = "none" | "single" | "full";

export type PrintSide = "single" | "double";

export type MaterialSlot = "canopy" | "inner" | "frame";

export type DesignSurfaceId = "canopyFront";

export interface ColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  size: ProductSize;
  label: string;
  modelUrl: string;
  /** Approximate canopy top height for branding plane placement */
  canopyHeight: number;
  /** Approximate canopy half-width for branding / wall planes */
  halfWidth: number;
}

export interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  category: "canopy-tent";
  variants: ProductVariant[];
  materialSlots: MaterialSlot[];
  designSurfaces: DesignSurfaceId[];
  wallPackages: WallPackage[];
  defaultColors: Record<MaterialSlot, string>;
}
