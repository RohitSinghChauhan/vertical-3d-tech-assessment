import { create } from "zustand";
import type {
  ImageElement,
  NormalizedTransform,
  ProductConfiguration,
  TextElement,
} from "../types/configurator";
import type {
  MaterialSlot,
  PrintSide,
  ProductSize,
  WallPackage,
} from "../types/product";
import { getVariantBySize } from "../data/products";
import { createId } from "../utils/id";
import {
  cloneConfiguration,
  createDefaultConfiguration,
} from "../utils/configuration";

const MAX_HISTORY = 40;

interface ConfiguratorState {
  configuration: ProductConfiguration;
  selectedElementId: string | null;
  past: ProductConfiguration[];
  future: ProductConfiguration[];
  canUndo: boolean;
  canRedo: boolean;
  setSize: (size: ProductSize) => void;
  setQuantity: (quantity: number) => void;
  setMaterialColor: (slot: MaterialSlot, colorId: string) => void;
  setWallPackage: (wallPackage: WallPackage) => void;
  setPrintSide: (printSide: PrintSide) => void;
  selectElement: (id: string | null) => void;
  addTextElement: (partial?: Partial<TextElement>) => void;
  updateTextElement: (id: string, patch: Partial<TextElement>) => void;
  addImageElement: (
    element: Omit<ImageElement, "id" | "type" | "surfaceId">,
  ) => void;
  updateImageElement: (id: string, patch: Partial<ImageElement>) => void;
  updateElementTransform: (
    id: string,
    transform: Partial<NormalizedTransform>,
  ) => void;
  removeElement: (id: string) => void;
  duplicateSelectedElement: () => void;
  clearDesign: () => void;
  resetConfiguration: () => void;
  loadConfiguration: (configuration: ProductConfiguration) => void;
  undo: () => void;
  redo: () => void;
  getConfiguration: () => ProductConfiguration;
}

function defaultTextTransform(): NormalizedTransform {
  return { x: 0.5, y: 0.35, scaleX: 1, scaleY: 1, rotation: 0 };
}

function defaultImageTransform(): NormalizedTransform {
  return { x: 0.5, y: 0.62, scaleX: 1, scaleY: 1, rotation: 0 };
}

function withHistory(
  state: ConfiguratorState,
  nextConfiguration: ProductConfiguration,
  selectedElementId?: string | null,
) {
  return {
    past: [...state.past, cloneConfiguration(state.configuration)].slice(
      -MAX_HISTORY,
    ),
    future: [] as ProductConfiguration[],
    configuration: nextConfiguration,
    selectedElementId:
      selectedElementId === undefined
        ? state.selectedElementId
        : selectedElementId,
    canUndo: true,
    canRedo: false,
  };
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  configuration: createDefaultConfiguration(),
  selectedElementId: null,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  getConfiguration: () => get().configuration,

  setSize: (size) => {
    const variant = getVariantBySize(size);
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        size,
        variantId: variant.id,
      }),
    );
  },

  setQuantity: (quantity) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        quantity: Math.max(1, Math.min(99, Math.floor(quantity))),
      }),
    ),

  setMaterialColor: (slot, colorId) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        colors: { ...state.configuration.colors, [slot]: colorId },
      }),
    ),

  setWallPackage: (wallPackage) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        sections: {
          ...state.configuration.sections,
          wallPackage,
          printSide:
            wallPackage === "none"
              ? "single"
              : state.configuration.sections.printSide,
        },
      }),
    ),

  setPrintSide: (printSide) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        sections: { ...state.configuration.sections, printSide },
      }),
    ),

  selectElement: (id) => set({ selectedElementId: id }),

  addTextElement: (partial) => {
    const element: TextElement = {
      id: createId("text"),
      type: "text",
      surfaceId: "canopyFront",
      content: partial?.content ?? "YOUR BRAND",
      fontSize: partial?.fontSize ?? 42,
      fontFamily: partial?.fontFamily ?? "Arial",
      fontWeight: partial?.fontWeight ?? "bold",
      fill: partial?.fill ?? "#111111",
      align: partial?.align ?? "center",
      letterSpacing: partial?.letterSpacing ?? 0,
      transform: partial?.transform ?? defaultTextTransform(),
    };
    set((state) =>
      withHistory(
        state,
        {
          ...state.configuration,
          textElements: [...state.configuration.textElements, element],
        },
        element.id,
      ),
    );
  },

  updateTextElement: (id, patch) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        textElements: state.configuration.textElements.map((el) =>
          el.id === id ? { ...el, ...patch } : el,
        ),
      }),
    ),

  addImageElement: (element) => {
    const next: ImageElement = {
      id: createId("image"),
      type: "image",
      surfaceId: "canopyFront",
      ...element,
      transform: element.transform ?? defaultImageTransform(),
    };
    set((state) =>
      withHistory(
        state,
        {
          ...state.configuration,
          imageElements: [...state.configuration.imageElements, next],
        },
        next.id,
      ),
    );
  },

  updateImageElement: (id, patch) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        imageElements: state.configuration.imageElements.map((el) =>
          el.id === id ? { ...el, ...patch } : el,
        ),
      }),
    ),

  updateElementTransform: (id, transform) =>
    set((state) =>
      withHistory(state, {
        ...state.configuration,
        textElements: state.configuration.textElements.map((el) =>
          el.id === id
            ? { ...el, transform: { ...el.transform, ...transform } }
            : el,
        ),
        imageElements: state.configuration.imageElements.map((el) =>
          el.id === id
            ? { ...el, transform: { ...el.transform, ...transform } }
            : el,
        ),
      }),
    ),

  removeElement: (id) =>
    set((state) =>
      withHistory(
        state,
        {
          ...state.configuration,
          textElements: state.configuration.textElements.filter(
            (el) => el.id !== id,
          ),
          imageElements: state.configuration.imageElements.filter(
            (el) => el.id !== id,
          ),
        },
        state.selectedElementId === id ? null : state.selectedElementId,
      ),
    ),

  duplicateSelectedElement: () => {
    const { selectedElementId, configuration } = get();
    if (!selectedElementId) return;

    const text = configuration.textElements.find(
      (el) => el.id === selectedElementId,
    );
    if (text) {
      get().addTextElement({
        ...text,
        transform: {
          ...text.transform,
          x: Math.min(0.92, text.transform.x + 0.04),
          y: Math.min(0.92, text.transform.y + 0.04),
        },
      });
      return;
    }

    const image = configuration.imageElements.find(
      (el) => el.id === selectedElementId,
    );
    if (image) {
      get().addImageElement({
        src: image.src,
        fileName: image.fileName,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        transform: {
          ...image.transform,
          x: Math.min(0.92, image.transform.x + 0.04),
          y: Math.min(0.92, image.transform.y + 0.04),
        },
      });
    }
  },

  clearDesign: () =>
    set((state) =>
      withHistory(
        state,
        {
          ...state.configuration,
          textElements: [],
          imageElements: [],
        },
        null,
      ),
    ),

  resetConfiguration: () =>
    set({
      configuration: createDefaultConfiguration(),
      selectedElementId: null,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),

  loadConfiguration: (configuration) =>
    set((state) =>
      withHistory(state, cloneConfiguration(configuration), null),
    ),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const past = state.past.slice(0, -1);
      return {
        past,
        future: [cloneConfiguration(state.configuration), ...state.future],
        configuration: previous,
        selectedElementId: null,
        canUndo: past.length > 0,
        canRedo: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const [next, ...future] = state.future;
      return {
        past: [...state.past, cloneConfiguration(state.configuration)].slice(
          -MAX_HISTORY,
        ),
        future,
        configuration: next,
        selectedElementId: null,
        canUndo: true,
        canRedo: future.length > 0,
      };
    }),
}));
