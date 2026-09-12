import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type CameraPresetId = "angle" | "front" | "top";

interface SceneEnvironmentProps {
  autoRotate?: boolean;
  cameraPreset?: CameraPresetId;
}

const PRESET_POSITIONS: Record<CameraPresetId, readonly [number, number, number]> = {
  angle: [3.6, 2.1, 4.2],
  front: [0, 1.4, 5.4],
  top: [0.01, 6.8, 0.01],
};

function CameraPreset({ preset }: { preset: CameraPresetId }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    const [x, y, z] = PRESET_POSITIONS[preset];
    camera.position.set(x, y, z);
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    } else {
      camera.lookAt(0, 0, 0);
    }
  }, [camera, controls, preset]);

  return null;
}

export function SceneEnvironment({
  autoRotate = false,
  cameraPreset = "angle",
}: SceneEnvironmentProps) {
  return (
    <>
      <color attach="background" args={["#e7edf3"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        position={[4.5, 8, 3]}
        intensity={1.35}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-2.5, 1.2, -3]} intensity={0.55} />
      <hemisphereLight args={["#f8fbff", "#9aa7b5", 0.5]} />
      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.38}
        scale={14}
        blur={2.4}
        far={10}
      />
      <CameraPreset preset={cameraPreset} />
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.7}
        minPolarAngle={0.12}
        maxPolarAngle={Math.PI * 0.88}
        minDistance={2.6}
        maxDistance={14}
        target={[0, 0, 0]}
      />
    </>
  );
}
