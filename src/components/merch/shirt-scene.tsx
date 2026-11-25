"use client";

import { CameraControls, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MERCH_DESIGNS, type ShirtMockup } from "@/lib/merch-shirt";

// Shirt size in scene units; width follows the traced front's aspect ratio.
const HEIGHT = 2.4;
const DEPTH = 0.14;
const BEVEL = 0.08;
const FACE_Z = DEPTH / 2 + BEVEL + 0.002;

function makeShape(mockup: ShirtMockup, width: number) {
  const pts = mockup.outline.map(
    ([nx, ny]) => new THREE.Vector2((nx - 0.5) * width, (0.5 - ny) * HEIGHT),
  );
  return new THREE.Shape(pts);
}

/** Flat print geometry whose UVs point at one shirt in the mockup image. */
function makePrint(shape: THREE.Shape, mockup: ShirtMockup, width: number, side: "front" | "back") {
  const geo = new THREE.ShapeGeometry(shape, 8);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  const box = mockup[side];
  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i) / width + 0.5;
    const ny = 0.5 - pos.getY(i) / HEIGHT;
    // Seen from behind, the shirt's right side is on the viewer's left.
    const sx = side === "front" ? nx : 1 - nx;
    uv[i * 2] = (box.x + sx * box.w) / mockup.width;
    uv[i * 2 + 1] = 1 - (box.y + ny * box.h) / mockup.height;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

function Shirt({ mockup }: { mockup: ShirtMockup }) {
  const texture = useTexture(mockup.src);
  const { body, front, back } = useMemo(() => {
    const width = HEIGHT * (mockup.front.w / mockup.front.h);
    const shape = makeShape(mockup, width);
    const body = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: 0.05,
      bevelSegments: 6,
      curveSegments: 6,
    });
    body.translate(0, 0, -DEPTH / 2);
    return {
      body,
      front: makePrint(shape, mockup, width, "front"),
      back: makePrint(shape, mockup, width, "back"),
    };
  }, [mockup]);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  useEffect(
    () => () => {
      body.dispose();
      front.dispose();
      back.dispose();
    },
    [body, front, back],
  );

  return (
    <group>
      <mesh geometry={body}>
        {/* Matches the fabric colour in the mockup. Where the outline overshoots a shirt,
            the mockup is transparent and alphaTest lets this body show through. */}
        <meshStandardMaterial color={mockup.fabric} roughness={0.95} />
      </mesh>
      <mesh geometry={front} position={[0, 0, FACE_Z]}>
        <meshStandardMaterial map={texture} roughness={0.9} alphaTest={0.5} />
      </mesh>
      <mesh geometry={back} position={[0, 0, -FACE_Z]}>
        <meshStandardMaterial map={texture} roughness={0.9} alphaTest={0.5} side={THREE.BackSide} />
      </mesh>
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
