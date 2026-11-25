// The T-shirt designs sold on /merch and the shape data for their 3D viewer.
// Each design has a flat mockup under public/merch (front shirt on the left,
// back on the right; transparent background). Outlines are normalized to the
// front shirt's bounding box: x → right, y → down.

type Box = { x: number; y: number; w: number; h: number };
type Outline = readonly (readonly [number, number])[];

export type ShirtMockup = {
  src: string;
  width: number;
  height: number;
  /** Pixel bounding boxes of each shirt inside the image. */
  front: Box;
  back: Box;
  outline: Outline;
  /** Fabric colour of the 3D body, matched to the mockup. */
  fabric: string;
};

/** Traced from public/merch/million-goats-tee.webp. */
const CLASSIC_OUTLINE: Outline = [
  [0.621, 0],
  [0.661, 0.01],
  [0.846, 0.085],
  [0.883, 0.112],
  [0.925, 0.174],
  [0.999, 0.374],
  [0.994, 0.386],
  [0.937, 0.413],
  [0.834, 0.442],
  [0.809, 0.44],
  [0.787, 0.388],
  [0.767, 0.632],
  [0.789, 0.862],
  [0.801, 0.895],
  [0.799, 0.965],
  [0.742, 0.981],
  [0.639, 0.986],
  [0.52, 1],
  [0.224, 0.977],
  [0.197, 0.967],
  [0.192, 0.946],
  [0.197, 0.868],
  [0.215, 0.808],
  [0.217, 0.733],
  [0.207, 0.607],
  [0.215, 0.475],
  [0.205, 0.38],
  [0.18, 0.442],
  [0.104, 0.435],
  [0.049, 0.413],
  [0, 0.384],
  [0.059, 0.182],
  [0.084, 0.14],
  [0.126, 0.101],
  [0.367, 0.004],
  [0.535, 0.008],
];

/** Traced from the newer mockups (million-goats-tee-*.webp), which share one template. */
const STUDIO_OUTLINE: Outline = [
  [0.631, 0],
  [0.717, 0.04],
  [0.834, 0.084],
  [0.898, 0.129],
  [0.931, 0.193],
  [1, 0.372],
  [0.995, 0.38],
  [0.865, 0.423],
  [0.816, 0.432],
  [0.8, 0.422],
  [0.793, 0.426],
  [0.778, 0.635],
  [0.801, 0.76],
  [0.801, 0.861],
  [0.811, 0.962],
  [0.726, 0.989],
  [0.615, 0.99],
  [0.533, 1],
  [0.439, 0.99],
  [0.301, 0.989],
  [0.218, 0.969],
  [0.214, 0.956],
  [0.224, 0.84],
  [0.243, 0.688],
  [0.232, 0.408],
  [0.225, 0.403],
  [0.216, 0.41],
  [0.201, 0.435],
  [0.169, 0.431],
  [0.014, 0.384],
  [0, 0.377],
  [0.006, 0.362],
  [0.105, 0.133],
  [0.166, 0.084],
  [0.287, 0.038],
  [0.354, 0.001],
  [0.456, 0.014],
  [0.521, 0.015],
];

function studioMockup(name: string, fabric: string): ShirtMockup {
  return {
    src: `/merch/million-goats-tee-${name}.webp`,
    width: 1800,
    height: 1046,
    front: { x: 20, y: 28, w: 876, h: 993 },
    back: { x: 927, y: 20, w: 852, h: 1000 },
    outline: STUDIO_OUTLINE,
    fabric,
  };
}

const BLACK = "#1e1e1e";
const WHITE = "#b4b4b4";

/**
 * Every design, in display order. `key` is stored on product_variant.design,
 * so never rename one that has been sold.
 */
export const MERCH_DESIGNS = [
  {
    key: "goat-black",
    name: "Goat",
    color: "Хар",
    blurb: "Урд талд лого, ар талд MILLION GOATS бичиг болон ямааны дүрс.",
    mockup: {
      src: "/merch/million-goats-tee.webp",
      width: 1753,
      height: 1038,
      front: { x: 30, y: 30, w: 812, h: 969 },
      back: { x: 903, y: 34, w: 820, h: 974 },
      outline: CLASSIC_OUTLINE,
      fabric: "#222222",
    },
  },
  {
    key: "goat-white",
    name: "Goat",
    color: "Цагаан",
    blurb: "Урд талд лого, ар талд MILLION GOATS бичиг болон ямааны дүрс.",
    mockup: studioMockup("goat-white", WHITE),
  },
  {
    key: "money-black",
    name: "One Community",
    color: "Хар",
    blurb:
      "Урд талд лого, ар талд сая долларын дэвсгэрт болон ONE COMMUNITY. A MILLION GOALS. бичиг.",
    mockup: studioMockup("money-black", BLACK),
  },
  {
    key: "money-white",
    name: "One Community",
    color: "Цагаан",
    blurb:
      "Урд талд лого, ар талд сая долларын дэвсгэрт болон ONE COMMUNITY. A MILLION GOALS. бичиг.",
    mockup: studioMockup("money-white", WHITE),
  },
  {
    key: "eyes-white",
    name: "Eyes on the Market",
    color: "Цагаан",
    blurb: "Урд талд лого, ар талд ямааны нүд болон EYES ON THE MARKET бичиг.",
    mockup: studioMockup("eyes-white", WHITE),
  },
] as const satisfies readonly {
  key: string;
  name: string;
  color: string;
  blurb: string;
  mockup: ShirtMockup;
}[];

export type MerchDesign = (typeof MERCH_DESIGNS)[number];

export const DEFAULT_DESIGN: MerchDesign = MERCH_DESIGNS[0];

export function findDesign(key: string): MerchDesign | undefined {
  return MERCH_DESIGNS.find((d) => d.key === key);
}

export function designLabel(design: MerchDesign) {
  return `${design.name} · ${design.color}`;
}
