import type { PricingCatalog } from "../types/pricing";

/** Static mock catalog returned by the pricing service. */
export const MOCK_PRICING_CATALOG: PricingCatalog = {
  currency: "USD",
  products: {
    "5x5": 549,
    "6.5x6.5": 650,
    "8x8": 849,
  },
  wallPackages: {
    none: 0,
    single: 125,
    full: 325,
  },
  printSide: {
    single: 0,
    double: 75,
  },
  customText: 20,
  customImage: 30,
};

export const PRICING_CATALOG_VERSION = "mock-2026.1";
