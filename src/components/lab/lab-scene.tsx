"use client";

import { CameraControls } from "@react-three/drei";
import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { DICT } from "@/lib/lab/i18n";
import {
  availableIn,
  ROOM_IDS,
  ROOM_NAMES,
  ROOM_SEAT_COUNT,
  ROOM_SIZE,
  type RoomId,
  SEATS,
} from "@/lib/lab/seats";
import { useLab } from "@/lib/lab/store";

// Ported from the Million Hub /lab page and restyled to the Million Goats
// brand palette (Visual Guideline v2.0).

const HALF = ROOM_SIZE / 2;
const ROOM_OFFSET = 8.5;

const ROOM_CENTER: Record<RoomId, [number, number]> = {
  A: [-ROOM_OFFSET, -ROOM_OFFSET],
  B: [ROOM_OFFSET, -ROOM_OFFSET],
  C: [-ROOM_OFFSET, ROOM_OFFSET],
  D: [ROOM_OFFSET, ROOM_OFFSET],
};

const BRAND = {
  navy: "#010D26",
  blue: "#0068FF",
  sky: "#55A2FF",
  mint: "#00FFCE",
  orange: "#FF3600",
};

const COLOR = {
  available: new THREE.Color(BRAND.blue),
  hover: new THREE.Color(BRAND.sky),
  selected: new THREE.Color("#FFFFFF"),
  sold: new THREE.Color("#2A3550"),
};

/** Per-seat transform for one furniture part; (dx, y, dz) is the offset in the seat's own frame. */
function seatMatrices(dx: number, y: number, dz: number) {
  const offset = new THREE.Matrix4().makeTranslation(dx, y, dz);
  return SEATS.map((seat) => {
    const [cx, cz] = ROOM_CENTER[seat.room];
    return new THREE.Matrix4()
      .makeRotationY(seat.rot)
      .setPosition(cx + seat.x, 0, cz + seat.z)
      .multiply(offset);
  });
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas2d(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { canvas, ctx };
}

/** Candlestick texture for the big screens and monitors. */
function makeChartTexture() {
  const w = 512;
  const h = 256;
  const { canvas, ctx } = canvas2d(w, h);
  ctx.fillStyle = "#06143A";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(85,162,255,0.14)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const rand = mulberry32(7);
  const count = 40;
  const step = w / count;
  let price = h * 0.7;
  for (let i = 0; i < count; i++) {
    const open = price;
    const close = Math.min(h - 24, Math.max(24, open + (rand() - 0.42) * -46));
    const high = Math.min(open, close) - rand() * 14;
    const low = Math.max(open, close) + rand() * 14;
    const up = close < open; // canvas y grows downward
    // Up/down candles keep the trading green/red convention.
    ctx.strokeStyle = up ? BRAND.mint : BRAND.orange;
    ctx.fillStyle = ctx.strokeStyle;
    const x = i * step + step / 2;
    ctx.beginPath();
    ctx.moveTo(x, high);
    ctx.lineTo(x, low);
    ctx.stroke();
    ctx.fillRect(
      x - step * 0.3,
      Math.min(open, close),
      step * 0.6,
      Math.max(2, Math.abs(close - open)),
    );
    price = close;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Floating room label: name plus free-seat count. */
function makeLabelTexture(title: string, sub: string) {
  const w = 512;
  const h = 80;
  const { canvas, ctx } = canvas2d(w, h);
  const family =
    getComputedStyle(document.body).fontFamily || "Rubik, Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(1,13,38,0.88)";
  ctx.strokeStyle = "rgba(0,104,255,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = `700 34px ${family}`;
  ctx.textBaseline = "middle";
  const gap = 18;
  const total = ctx.measureText(title).width + gap + ctx.measureText(sub).width;
  let x = (w - total) / 2;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(title, x, h / 2 + 2);
  x += ctx.measureText(title).width + gap;
  ctx.fillStyle = BRAND.sky;
  ctx.fillText(sub, x, h / 2 + 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type InstancesProps = {
  matrices: THREE.Matrix4[];
  colors?: THREE.Color[];
  children: React.ReactNode;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
};

function Instances({ matrices, colors, children, ...events }: InstancesProps) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || !colors) return;
    colors.forEach((c, i) => {
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} {...events}>
      {children}
    </instancedMesh>
  );
}

function Seats({ chart }: { chart: THREE.Texture }) {
  const selected = useLab((s) => s.seat);
  const hovered = useLab((s) => s.hovered);
  const pickSeat = useLab((s) => s.pickSeat);
  const setHovered = useLab((s) => s.setHovered);

  const m = useMemo(
    () => ({
      deskTop: seatMatrices(0, 0.76, 0),
      deskPanel: seatMatrices(0, 0.38, -0.36),
      monitor: seatMatrices(0, 1.12, -0.2),
      chairSeat: seatMatrices(0, 0.46, 0.8),
      chairBack: seatMatrices(0, 0.85, 1.06),
    }),
    [],
  );

  const taken = useLab((s) => s.taken);
  const colors = useMemo(
    () =>
      SEATS.map((seat) => {
        if (taken.has(seat.id)) return COLOR.sold;
        if (seat.id === selected) return COLOR.selected;
        if (seat.id === hovered) return COLOR.hover;
        return COLOR.available;
      }),
    [selected, hovered, taken],
  );

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const events = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta > 6 || e.instanceId === undefined) return;
      pickSeat(SEATS[e.instanceId].id);
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) setHovered(SEATS[e.instanceId].id);
    },
    onPointerOut: () => setHovered(null),
  };

  return (
    <group>
      <Instances matrices={m.deskTop} {...events}>
        <boxGeometry args={[1.6, 0.08, 0.85]} />
        <meshStandardMaterial color="#1A2747" roughness={0.6} />
      </Instances>
      <Instances matrices={m.deskPanel}>
        <boxGeometry args={[1.6, 0.72, 0.06]} />
        <meshStandardMaterial color="#0E1A36" roughness={0.8} />
      </Instances>
      <Instances matrices={m.monitor}>
        <boxGeometry args={[1, 0.56, 0.05]} />
        <meshBasicMaterial map={chart} toneMapped={false} />
      </Instances>
      <Instances matrices={m.chairSeat} colors={colors} {...events}>
        <boxGeometry args={[0.62, 0.12, 0.6]} />
        <meshStandardMaterial roughness={0.5} />
      </Instances>
      <Instances matrices={m.chairBack} colors={colors} {...events}>
        <boxGeometry args={[0.62, 0.7, 0.1]} />
        <meshStandardMaterial roughness={0.5} />
      </Instances>
    </group>
  );
}

function Room({ id, chart }: { id: RoomId; chart: THREE.Texture }) {
  const active = useLab((s) => s.room === id);
  const lang = useLab((s) => s.lang);
  const setRoom = useLab((s) => s.setRoom);
  const taken = useLab((s) => s.taken);
  const [hover, setHover] = useState(false);
  const t = DICT[lang];
  const [cx, cz] = ROOM_CENTER[id];
  const lit = active || hover;
  const labelText = ROOM_NAMES[id];
  const labelSub = `${availableIn(id, taken)}/${ROOM_SEAT_COUNT[id]} ${t.free}`;
  const label = useMemo(() => makeLabelTexture(labelText, labelSub), [labelText, labelSub]);
  useEffect(() => () => label.dispose(), [label]);

  return (
    <group position={[cx, 0, cz]}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: three.js mesh, not a DOM element; rooms are also reachable via the HTML buttons */}
      <mesh
        position={[0, -0.05, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta <= 6) setRoom(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[ROOM_SIZE, 0.1, ROOM_SIZE]} />
        <meshStandardMaterial color={lit ? "#0D2152" : "#081430"} roughness={0.9} />
      </mesh>

      {/* Front wall with the big screen */}
      <mesh position={[0, 1.9, -HALF]}>
        <boxGeometry args={[ROOM_SIZE, 3.8, 0.2]} />
        <meshStandardMaterial color="#0A1838" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.1, -HALF + 0.12]}>
        <planeGeometry args={[10, 2.8]} />
        <meshBasicMaterial map={chart} toneMapped={false} />
      </mesh>

      {/* Low side and back walls */}
      {(
        [
          [-HALF, 0, 0.2, ROOM_SIZE],
          [HALF, 0, 0.2, ROOM_SIZE],
          [0, HALF, ROOM_SIZE, 0.2],
        ] as const
      ).map(([x, z, w, d]) => (
        <mesh key={`${x}:${z}`} position={[x, 0.45, z]}>
          <boxGeometry args={[w, 0.9, d]} />
          <meshStandardMaterial
            color={lit ? "#0B4FC2" : "#12224A"}
            emissive={BRAND.blue}
            emissiveIntensity={lit ? 0.25 : 0}
            roughness={0.8}
          />
        </mesh>
      ))}

      <sprite position={[0, 4.8, -HALF]} scale={[6, 0.94, 1]}>
        <spriteMaterial map={label} toneMapped={false} transparent />
      </sprite>
    </group>
  );
}

function CameraRig() {
  const room = useLab((s) => s.room);
  const controls = useRef<CameraControls>(null);
  const aspect = useThree((s) => s.size.width / s.size.height);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    // Pull the camera back on portrait (phone) screens so everything fits.
    const k = aspect < 1 ? Math.min(2.4, 1 / aspect) : 1;
    if (room) {
      const [cx, cz] = ROOM_CENTER[room];
      c.setLookAt(cx, 14 * k, cz + 14.5 * k, cx, 0.5, cz - 0.5, true);
    } else {
      c.setLookAt(0, 28 * k, 35 * k, 0, 0, 6, true);
    }
  }, [room, aspect]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minPolarAngle={0.15}
      maxPolarAngle={1.4}
      minDistance={6}
      maxDistance={95}
    />
  );
}

export default function LabScene() {
  const chart = useMemo(() => makeChartTexture(), []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 28, 35], fov: 45, near: 0.1, far: 300 }}
      onPointerMissed={() => useLab.getState().setHovered(null)}
    >
      <color attach="background" args={[BRAND.navy]} />
      <fog attach="fog" args={[BRAND.navy, 110, 260]} />
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#CFE2FF", BRAND.navy, 0.6]} />
      <directionalLight position={[12, 24, 14]} intensity={1.6} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#020A1E" roughness={1} />
      </mesh>

      {ROOM_IDS.map((id) => (
        <Room key={id} id={id} chart={chart} />
      ))}
      <Seats chart={chart} />
      <CameraRig />
    </Canvas>
  );
}
