import Image from "next/image";

/**
 * The 3D hero render from the designers: the logo's slabs on a lit blue floor,
 * with depth of field. Exported from "WEB Hero.psd" without the text and nav
 * layers, and cropped below the mockup's header strip, which the real header
 * covers. Anchored to the bottom so the V's glowing notch stays in view.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <Image
        src="/brand/3d/hero.webp"
        alt=""
        fill
        preload
        // On screens taller than the render (15:8) the cover crop is height-bound,
        // so it shows at ~1.88× the viewport height, wider than the screen.
        sizes="(max-aspect-ratio: 15/8) 188vh, 100vw"
        className="object-cover object-bottom"
      />
    </div>
  );
}
