import type { ProductConfiguration } from "../types/configurator";
import type { PriceQuote, PricingCatalog } from "../types/pricing";
import {
  MOCK_PRICING_CATALOG,
  PRICING_CATALOG_VERSION,
} from "../data/pricingCatalog";

const NETWORK_DELAY_MS = 180;

async function simulateNetwork<T>(value: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
  return value;
}

/** Mock pricing API — swap implementation for a real HTTP client later. */
export async function fetchPricingCatalog(): Promise<PricingCatalog> {
  return simulateNetwork(structuredClone(MOCK_PRICING_CATALOG));
}

export function calculatePriceQuote(
  configuration: ProductConfiguration,
  catalog: PricingCatalog,
): PriceQuote {
  const lines: PriceQuote["lines"] = [];

  const base = catalog.products[configuration.size];
  lines.push({
    code: `base-${configuration.size}`,
    label: `Canopy kit (${configuration.size})`,
    amount: base,
  });

  const wallAmount = catalog.wallPackages[configuration.sections.wallPackage];
  if (wallAmount > 0) {
    lines.push({
      code: `walls-${configuration.sections.wallPackage}`,
      label: `Wall package (${configuration.sections.wallPackage})`,
      amount: wallAmount,
    });
  }

  if (
    configuration.sections.wallPackage !== "none" &&
    configuration.sections.printSide === "double"
  ) {
    lines.push({
      code: "print-double",
      label: "Double-sided wall print",
      amount: catalog.printSide.double,
    });
  }

  if (configuration.textElements.length > 0) {
    const amount = catalog.customText * configuration.textElements.length;
    lines.push({
      code: "custom-text",
      label: `Custom text × ${configuration.textElements.length}`,
      amount,
    });
  }

  if (configuration.imageElements.length > 0) {
    const amount = catalog.customImage * configuration.imageElements.length;
    lines.push({
      code: "custom-image",
      label: `Logo / image × ${configuration.imageElements.length}`,
      amount,
    });
  }

  const unitSubtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const total = unitSubtotal * configuration.quantity;

  return {
    currency: catalog.currency,
    subtotal: unitSubtotal,
    total,
    lines,
    catalogVersion: PRICING_CATALOG_VERSION,
  };
}

export async function quoteConfiguration(
  configuration: ProductConfiguration,
): Promise<PriceQuote> {
  const catalog = await fetchPricingCatalog();
  return calculatePriceQuote(configuration, catalog);
}
