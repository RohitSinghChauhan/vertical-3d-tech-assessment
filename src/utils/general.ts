import type { MaterialSlot, PrintSide, WallPackage } from "../types/product";

export const SLOTS: { id: MaterialSlot; label: string; hint: string; frame?: boolean }[] =
  [
    {
      id: "canopy",
      label: "Canopy fabric",
      hint: "Outer roof color",
    },
    {
      id: "inner",
      label: "Inner fabric",
      hint: "Underside — orbit under the canopy",
    },
    {
      id: "frame",
      label: "Frame",
      hint: "Legs & mechanism",
      frame: true,
    },
  ];

  export const WALL_OPTIONS: { id: WallPackage; label: string; hint: string }[] = [
    { id: "none", label: "Canopy only", hint: "No side walls" },
    { id: "single", label: "Back wall", hint: "+1 wall" },
    { id: "full", label: "3-wall booth", hint: "Back + sides" },
  ];
  
  export const PRINT_OPTIONS: {
    id: PrintSide;
    label: string;
    hint: string;
  }[] = [
    {
      id: "single",
      label: "Single-sided",
      hint: "Print outside only · inside stays unfinished",
    },
    {
      id: "double",
      label: "Double-sided",
      hint: "Print both faces · +$75",
    },
  ];

export const FONT_OPTIONS = [
    "Arial",
    "Helvetica",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Trebuchet MS",
    "Courier New",
    "Impact",
  ] as const;