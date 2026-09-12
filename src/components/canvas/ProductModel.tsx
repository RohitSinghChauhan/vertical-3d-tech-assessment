import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3, type Group } from "three";
import {
  applyColorConfiguration,
  prepareConfigurableMaterials,
} from "../../utils/modelMaterials";
import type { ColorConfiguration } from "../../types/configurator";
import type { PrintSide, ProductVariant, WallPackage } from "../../types/product";
import { BrandingSurface } from "./BrandingSurface";
import { OptionalWalls } from "./OptionalWalls";

interface ProductModelProps {
  variant: ProductVariant;
  colors: ColorConfiguration;
  wallPackage: WallPackage;
  printSide: PrintSide;
  designCanvas: HTMLCanvasElement | null;
  designVersion: number;
  onReady: () => void;
  onError: (message: string) => void;
}

export function ProductModel({
  variant,
  colors,
  wallPackage,
  printSide,
  designCanvas,
  designVersion,
  onReady,
  onError,
}: ProductModelProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(variant.modelUrl);

  const prepared = useMemo(() => {
    const cloned = scene.clone(true);
    const { slotMap } = prepareConfigurableMaterials(cloned);
    return { cloned, slotMap };
  }, [scene]);

  useEffect(() => {
    applyColorConfiguration(prepared.slotMap, colors);
  }, [prepared.slotMap, colors]);

  useEffect(() => {
    try {
      onReady();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Model failed to load.");
    }
  }, [prepared.cloned, onReady, onError]);

  const bounds = useMemo(() => {
    const box = new Box3().setFromObject(prepared.cloned);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    return { size, center, box };
  }, [prepared.cloned]);

  return (
    <group ref={groupRef}>
      <primitive object={prepared.cloned} />
      <BrandingSurface
        bounds={bounds}
        canvas={designCanvas}
        version={designVersion}
      />
      <OptionalWalls
        wallPackage={wallPackage}
        printSide={printSide}
        halfWidth={Math.max(bounds.size.x, bounds.size.z) / 2}
        height={bounds.size.y * 0.55}
        colorId={colors.canopy}
      />
    </group>
  );
}
