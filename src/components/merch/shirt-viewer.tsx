"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { SHIRT_IMAGE } from "@/lib/merch-shirt";

function StaticShirt({ alt }: { alt: string }) {
  return (
    <Image
      src={SHIRT_IMAGE.src}
      alt={alt}
      width={SHIRT_IMAGE.width}
      height={SHIRT_IMAGE.height}
      priority
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="h-auto w-full"
    />
  );
}

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const subscribeNever = () => () => {};

/** Shown inside the 3D box while the three.js scene downloads. */
function LoadingShirt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <Image
        src={SHIRT_IMAGE.src}
        alt=""
        width={SHIRT_IMAGE.width}
        height={SHIRT_IMAGE.height}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="h-auto w-full opacity-80"
      />
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-mg-muted text-xs">
        3D ачаалж байна…
      </span>
    </div>
  );
}

const ShirtScene = dynamic(() => import("./shirt-scene"), {
  ssr: false,
  loading: () => <LoadingShirt />,
});

/** 3D T-shirt you can drag to turn; falls back to the flat mockup without WebGL. */
export function ShirtViewer({ alt }: { alt: string }) {
  // Server render and no-WebGL devices show the flat mockup.
  const webgl = useSyncExternalStore(subscribeNever, hasWebGL, () => false);
  const [face, setFace] = useState<"front" | "back">("front");
  const [auto, setAuto] = useState(true);

  if (!webgl) return <StaticShirt alt={alt} />;

  return (
    <div className="flex flex-col">
      <div
        role="img"
        aria-label={`${alt} — 3D, чирж эргүүлнэ`}
        className="relative aspect-square w-full cursor-grab touch-none bg-linear-to-b from-[#F4F7FC] to-[#E3E9F3] active:cursor-grabbing"
      >
        <ShirtScene face={face} auto={auto} onInteract={() => setAuto(false)} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-mg-line border-t px-4 py-3">
        <span className="text-mg-muted text-sm">Чирж эргүүлнэ үү</span>
        <fieldset className="m-0 flex gap-1.5 border-0 p-0">
          <legend className="sr-only">Футболкны тал</legend>
          {(
            [
              ["front", "Урд тал"],
              ["back", "Ар тал"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={face === value}
              onClick={() => {
                setAuto(false);
                setFace(value);
              }}
              className={`min-h-11 cursor-pointer rounded-lg border px-4 font-semibold text-sm transition ${
                face === value
                  ? "border-mg-navy bg-mg-navy text-white"
                  : "border-mg-line bg-white text-mg-navy hover:border-mg-blue"
              }`}
            >
              {label}
            </button>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
