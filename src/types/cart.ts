import type { ProductConfiguration } from "./configurator";

/** Shopify-style cart line payload (mock Storefront integration). */
export interface ShopifyCartPayload {
  productId: string;
  quantity: number;
  price: number;
  configuration: ProductConfiguration;
  currency: "USD";
  createdAt: string;
}

export interface AddToCartResult {
  success: boolean;
  cartItemId: string;
  payload: ShopifyCartPayload;
  message: string;
}
