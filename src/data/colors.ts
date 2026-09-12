import type { ColorOption } from "../types/product";

export const FABRIC_COLORS: ColorOption[] = [
  { id: "white", label: "White", hex: "#F5F5F5" },
  { id: "black", label: "Black", hex: "#1A1A1A" },
  { id: "navy", label: "Navy", hex: "#1B3A5C" },
  { id: "royal", label: "Royal Blue", hex: "#1E5BB8" },
  { id: "red", label: "Red", hex: "#C62828" },
  { id: "orange", label: "Orange", hex: "#EF6C00" },
  { id: "green", label: "Forest Green", hex: "#2E7D32" },
  { id: "yellow", label: "Yellow", hex: "#F9A825" },
  { id: "purple", label: "Purple", hex: "#6A1B9A" },
  { id: "teal", label: "Teal", hex: "#00838F" },
  { id: "gray", label: "Charcoal", hex: "#546E7A" },
  { id: "pink", label: "Magenta", hex: "#AD1457" },
];

export const FRAME_COLORS: ColorOption[] = [
  { id: "silver", label: "Silver", hex: "#C0C5CC" },
  { id: "black-frame", label: "Black", hex: "#2B2B2B" },
  { id: "white-frame", label: "White", hex: "#E8E8E8" },
];

export function findColorHex(
  palette: ColorOption[],
  id: string,
  fallback = "#FFFFFF",
): string {
  return palette.find((c) => c.id === id)?.hex ?? fallback;
}
