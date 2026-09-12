import type {
  DesignSurfaceId,
  MaterialSlot,
  PrintSide,
  ProductSize,
  WallPackage,
} from "./product";

/** Normalized transform independent of viewport size (0–1 space). */
export interface NormalizedTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface TextElement {
  id: string;
  type: "text";
  surfaceId: DesignSurfaceId;
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fill: string;
  align: "left" | "center" | "right";
  letterSpacing: number;
  transform: NormalizedTransform;
}

export interface ImageElement {
  id: string;
  type: "image";
  surfaceId: DesignSurfaceId;
  /** Object URL or data URL for runtime preview */
  src: string;
  /** Original file name for PDF / cart summaries */
  fileName: string;
  naturalWidth: number;
  naturalHeight: number;
  transform: NormalizedTransform;
}

export type DesignElement = TextElement | ImageElement;

export type ColorConfiguration = Record<MaterialSlot, string>;

export interface SectionConfiguration {
  wallPackage: WallPackage;
  printSide: PrintSide;
}

export interface ProductConfiguration {
  productId: string;
  variantId: string;
  size: ProductSize;
  colors: ColorConfiguration;
  sections: SectionConfiguration;
  textElements: TextElement[];
  imageElements: ImageElement[];
  quantity: number;
}

export type DesignElementId = string;
