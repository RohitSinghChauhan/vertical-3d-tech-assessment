import type { PrintSide, ProductSize, WallPackage } from "./product";

export interface PricingCatalog {
  products: Record<ProductSize, number>;
  wallPackages: Record<WallPackage, number>;
  printSide: Record<PrintSide, number>;
  customText: number;
  customImage: number;
  currency: "USD";
}

export interface PriceBreakdownLine {
  code: string;
  label: string;
  amount: number;
}

export interface PriceQuote {
  currency: "USD";
  subtotal: number;
  total: number;
  lines: PriceBreakdownLine[];
  catalogVersion: string;
}
