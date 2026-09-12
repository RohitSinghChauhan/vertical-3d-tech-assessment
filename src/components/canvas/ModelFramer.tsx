import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Box3, Vector3, type Group } from "three";

export function ModelFramer({
  children,
  resetKey,
}: {
  children: ReactNode;
  resetKey: string;
}) {
  const groupRef = useRef<Group>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const group = groupRef.current;
        if (!group) return;

        group.position.set(0, 0, 0);
        group.updateWorldMatrix(true, true);

        const box = new Box3().setFromObject(group);
        if (box.isEmpty()) return;

        const center = box.getCenter(new Vector3());
        group.position.set(-center.x, -center.y, -center.z);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [resetKey]);

  return <group ref={groupRef}>{children}</group>;
}
