import type { AddToCartResult, ShopifyCartPayload } from "../types/cart";
import type { ProductConfiguration } from "../types/configurator";
import { createId } from "../utils/id";

/**
 * Mock Shopify cart service.
 * Replace `postCartPayload` with Shopify Storefront API calls later
 * without changing configurator UI or store code.
 */
async function postCartPayload(
  payload: ShopifyCartPayload,
): Promise<{ cartItemId: string }> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  console.info("[MockShopify] addToCart payload", payload);
  return { cartItemId: createId("cart") };
}

export async function addToCart(
  configuration: ProductConfiguration,
  price: number,
): Promise<AddToCartResult> {
  const payload: ShopifyCartPayload = {
    productId: configuration.variantId,
    quantity: configuration.quantity,
    price,
    configuration,
    currency: "USD",
    createdAt: new Date().toISOString(),
  };

  const { cartItemId } = await postCartPayload(payload);

  return {
    success: true,
    cartItemId,
    payload,
    message: "Added to cart (mock Shopify).",
  };
}
