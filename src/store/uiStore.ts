import { create } from "zustand";
import type { ShopifyCartPayload } from "../types/cart";
import type { PriceQuote } from "../types/pricing";

interface UiState {
  pricingStatus: "idle" | "loading" | "ready" | "error";
  pricingError: string | null;
  quote: PriceQuote | null;
  cartStatus: "idle" | "loading" | "success" | "error";
  cartError: string | null;
  lastCartPayload: ShopifyCartPayload | null;
  pdfStatus: "idle" | "loading" | "error";
  pdfError: string | null;
  modelStatus: "loading" | "ready" | "error";
  modelError: string | null;
  showCartDebug: boolean;
  setPricingLoading: () => void;
  setPricingReady: (quote: PriceQuote) => void;
  setPricingError: (message: string) => void;
  setCartLoading: () => void;
  setCartSuccess: (payload: ShopifyCartPayload) => void;
  setCartError: (message: string) => void;
  setPdfLoading: () => void;
  setPdfIdle: () => void;
  setPdfError: (message: string) => void;
  setModelLoading: () => void;
  setModelReady: () => void;
  setModelError: (message: string) => void;
  toggleCartDebug: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  pricingStatus: "idle",
  pricingError: null,
  quote: null,
  cartStatus: "idle",
  cartError: null,
  lastCartPayload: null,
  pdfStatus: "idle",
  pdfError: null,
  modelStatus: "loading",
  modelError: null,
  showCartDebug: false,

  setPricingLoading: () =>
    set({ pricingStatus: "loading", pricingError: null }),
  setPricingReady: (quote) =>
    set({ pricingStatus: "ready", quote, pricingError: null }),
  setPricingError: (message) =>
    set({ pricingStatus: "error", pricingError: message }),

  setCartLoading: () => set({ cartStatus: "loading", cartError: null }),
  setCartSuccess: (payload) =>
    set({
      cartStatus: "success",
      lastCartPayload: payload,
      cartError: null,
      showCartDebug: true,
    }),
  setCartError: (message) => set({ cartStatus: "error", cartError: message }),

  setPdfLoading: () => set({ pdfStatus: "loading", pdfError: null }),
  setPdfIdle: () => set({ pdfStatus: "idle", pdfError: null }),
  setPdfError: (message) => set({ pdfStatus: "error", pdfError: message }),

  setModelLoading: () => set({ modelStatus: "loading", modelError: null }),
  setModelReady: () => set({ modelStatus: "ready", modelError: null }),
  setModelError: (message) =>
    set({ modelStatus: "error", modelError: message }),

  toggleCartDebug: () =>
    set((state) => ({ showCartDebug: !state.showCartDebug })),
}));
