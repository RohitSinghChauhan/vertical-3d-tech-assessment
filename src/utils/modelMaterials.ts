import type { Material, Mesh, Object3D, Texture } from "three";
import { Color, MeshStandardMaterial } from "three";
import { MATERIAL_SLOT_MAP } from "../data/products";
import { FABRIC_COLORS, FRAME_COLORS, findColorHex } from "../data/colors";
import type { ColorConfiguration } from "../types/configurator";
import type { MaterialSlot } from "../types/product";

type SlotMaterialMap = Partial<Record<MaterialSlot, MeshStandardMaterial[]>>;

interface PreparedMaterials {
  slotMap: SlotMaterialMap;
  /** Original albedo maps so we can restore detail if needed */
  originalMaps: Map<MeshStandardMaterial, Texture | null>;
}

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true;
}

function cloneStandardMaterial(material: Material): MeshStandardMaterial {
  if (material instanceof MeshStandardMaterial) {
    return material.clone();
  }
  return new MeshStandardMaterial({
    color: "#ffffff",
    name: material.name,
  });
}

/**
 * Clones materials so color changes do not mutate the GLTF loader cache,
 * and groups them by configurator material slot.
 */
export function prepareConfigurableMaterials(root: Object3D): PreparedMaterials {
  const slotMap: SlotMaterialMap = {};
  const originalMaps = new Map<MeshStandardMaterial, Texture | null>();
  const clonedByUuid = new Map<string, MeshStandardMaterial>();

  root.traverse((child) => {
    if (!isMesh(child) || !child.material) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const next = materials.map((mat) => {
      const cached = clonedByUuid.get(mat.uuid);
      if (cached) return cached;

      const cloned = cloneStandardMaterial(mat);
      clonedByUuid.set(mat.uuid, cloned);
      originalMaps.set(cloned, cloned.map);

      const slot =
        MATERIAL_SLOT_MAP[cloned.name as keyof typeof MATERIAL_SLOT_MAP];
      if (slot) {
        slotMap[slot] ??= [];
        slotMap[slot].push(cloned);
      }

      return cloned;
    });

    child.material = Array.isArray(child.material) ? next : next[0];
    child.castShadow = true;
    child.receiveShadow = true;
  });

  return { slotMap, originalMaps };
}

export function applyColorConfiguration(
  slotMap: SlotMaterialMap,
  colors: ColorConfiguration,
) {
  (Object.keys(colors) as MaterialSlot[]).forEach((slot) => {
    const materials = slotMap[slot];
    if (!materials) return;

    const palette = slot === "frame" ? FRAME_COLORS : FABRIC_COLORS;
    const hex = findColorHex(palette, colors[slot]);
    const color = new Color(hex);

    materials.forEach((material) => {
      material.color.copy(color);

      if (slot === "canopy" || slot === "inner") {
        // Solid dye-sub style color feedback
        material.map = null;
        material.metalness = 0;
        material.roughness = Math.max(material.roughness, 0.72);
      }

      if (slot === "frame") {
        // Baked metal albedo hides tints — neutralize it so frame swatches read clearly
        material.map = null;
        material.metalness = 0.55;
        material.roughness = 0.35;
      }

      material.needsUpdate = true;
    });
  });
}
