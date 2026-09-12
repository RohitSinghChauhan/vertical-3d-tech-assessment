import { useEffect, useMemo } from "react";
import { CanvasTexture, type Box3, type Vector3 } from "three";

interface BrandingSurfaceProps {
  bounds: {
    size: Vector3;
    center: Vector3;
    box: Box3;
  };
  canvas: HTMLCanvasElement | null;
  version: number;
}

export function BrandingSurface({
  bounds,
  canvas,
  version,
}: BrandingSurfaceProps) {
  const texture = useMemo(() => {
    if (!canvas) return null;
    const next = new CanvasTexture(canvas);
    next.anisotropy = 4;
    next.needsUpdate = true;
    return next;
  }, [canvas, version]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) return null;

  const width = Math.max(bounds.size.x, bounds.size.z) * 0.55;
  const height = width * 0.38;
  const y = bounds.center.y + bounds.size.y * 0.18;
  const z = bounds.box.max.z - bounds.size.z * 0.08;

  return (
    <mesh
      position={[bounds.center.x, y, z]}
      rotation={[-0.55, 0, 0]}
      renderOrder={2}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
