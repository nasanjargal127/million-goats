"use client";

import { CameraControls, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bleedEdges } from "@/lib/bleed-edges";
import { MERCH_DESIGNS, type ShirtMockup } from "@/lib/merch-shirt";
import { buildShirtSurfaces } from "@/lib/shirt-geometry";

// Shirt height in scene units; width follows the traced front's aspect ratio.
const HEIGHT = 2.4;

function Shirt({ mockup }: { mockup: ShirtMockup }) {
  const loaded = useTexture(mockup.src);
  // A bled copy of the mockup, so outline overshoot shows the photo's fabric.
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(bleedEdges(loaded.image as HTMLImageElement));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [loaded]);
  useEffect(() => () => texture.dispose(), [texture]);

  const { front, back } = useMemo(() => {
    const width = HEIGHT * (mockup.front.w / mockup.front.h);
    const outline = mockup.outline.map(
      ([nx, ny]) => [(nx - 0.5) * width, (0.5 - ny) * HEIGHT] as const,
    );
    return buildShirtSurfaces(outline, (x, y, side) => {
      const nx = x / width + 0.5;
      const ny = 0.5 - y / HEIGHT;
      const box = mockup[side];
      // Seen from behind, the shirt's right side is on the viewer's left.
      const sx = side === "front" ? nx : 1 - nx;
      return [(box.x + sx * box.w) / mockup.width, 1 - (box.y + ny * box.h) / mockup.height];
    });
  }, [mockup]);

  useEffect(
    () => () => {
      front.dispose();
      back.dispose();
    },
    [front, back],
  );

  return (
    <group>
      {[front, back].map((geo) => (
        <group key={geo.uuid}>
          {/* Fabric matched to the mockup. Shows through only where the outline
              overshoots the shirt in the mockup by more than the bleed reaches. */}
          <mesh geometry={geo}>
            <meshStandardMaterial color={mockup.fabric} roughness={0.95} />
          </mesh>
          <mesh geometry={geo}>
            <meshStandardMaterial
              map={texture}
              roughness={0.9}
              alphaTest={0.5}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Loads the other designs' mockups in the background so switching is instant. */
function PreloadDesigns() {
  useEffect(() => {
    for (const d of MERCH_DESIGNS) useTexture.preload(d.mockup.src);
  }, []);
  return null;
}

/** Spins the camera slowly until the visitor drags; `face` snaps to front or back. */
function Rig({ face, auto }: { face: "front" | "back"; auto: boolean }) {
  const controls = useRef<CameraControls>(null);

  useEffect(() => {
    controls.current?.rotateTo(face === "front" ? 0 : Math.PI, Math.PI / 2, true);
  }, [face]);

  useFrame((_, delta) => {
    if (auto && controls.current) controls.current.azimuthAngle += delta * 0.35;
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={4.2}
      maxDistance={4.2}
      minPolarAngle={Math.PI / 2 - 0.35}
      maxPolarAngle={Math.PI / 2 + 0.25}
      dollySpeed={0}
      truckSpeed={0}
    />
  );
}

export default function ShirtScene({
  mockup,
  face,
  auto,
  onInteract,
}: {
  mockup: ShirtMockup;
  face: "front" | "back";
  auto: boolean;
  onInteract: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 40 }}
      onPointerDown={onInteract}
      aria-hidden="true"
    >
      <hemisphereLight args={["#ffffff", "#8a94a8", 1.4]} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} />
      <directionalLight position={[-2, 2, -4]} intensity={1.2} />
      <Suspense fallback={null}>
        <Shirt mockup={mockup} />
      </Suspense>
      <Rig face={face} auto={auto} />
      <PreloadDesigns />
    </Canvas>
  );
}
