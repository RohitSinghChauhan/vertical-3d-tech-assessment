import { useMemo } from "react";
import { Color, FrontSide } from "three";
import { FABRIC_COLORS, findColorHex } from "../../data/colors";
import type { PrintSide, WallPackage } from "../../types/product";

interface OptionalWallsProps {
  wallPackage: WallPackage;
  printSide: PrintSide;
  halfWidth: number;
  height: number;
  colorId: string;
}

const INNER_UNPRINTED = "#d7dbe0";

function WallPanel({
  position,
  rotation,
  width,
  height,
  outerColor,
  innerColor,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  outerColor: Color;
  innerColor: Color;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Outside face */}
      <mesh castShadow receiveShadow position={[0, 0, 0.004]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={outerColor}
          side={FrontSide}
          roughness={0.85}
        />
      </mesh>
      {/* Inside face */}
      <mesh castShadow receiveShadow rotation={[0, Math.PI, 0]} position={[0, 0, -0.004]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={innerColor}
          side={FrontSide}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

export function OptionalWalls({
  wallPackage,
  printSide,
  halfWidth,
  height,
  colorId,
}: OptionalWallsProps) {
  const outer = useMemo(
    () => new Color(findColorHex(FABRIC_COLORS, colorId)),
    [colorId],
  );
  const inner = useMemo(
    () =>
      printSide === "double"
        ? outer.clone()
        : new Color(INNER_UNPRINTED),
    [outer, printSide],
  );

  if (wallPackage === "none") return null;

  const wallY = height * 0.45;
  const depth = halfWidth;
  const width = halfWidth * 2;

  const back = (
    <WallPanel
      position={[0, wallY, -depth]}
      rotation={[0, 0, 0]}
      width={width}
      height={height}
      outerColor={outer}
      innerColor={inner}
    />
  );

  if (wallPackage === "single") {
    return <group>{back}</group>;
  }

  return (
    <group>
      {back}
      <WallPanel
        position={[-halfWidth, wallY, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={width}
        height={height}
        outerColor={outer}
        innerColor={inner}
      />
      <WallPanel
        position={[halfWidth, wallY, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={width}
        height={height}
        outerColor={outer}
        innerColor={inner}
      />
    </group>
  );
}
