// Shape data for the 3D T-shirt on /merch, traced from the brand-book mockup
// public/merch/traders-dept-tee.jpg (front shirt on the left, back on the right).
// Points are normalized to the front shirt's bounding box: x → right, y → down.

export const SHIRT_IMAGE = { src: "/merch/traders-dept-tee.jpg", width: 1600, height: 759 };

/** Pixel bounding boxes of each shirt inside SHIRT_IMAGE. */
export const SHIRT_FRONT_BOX = { x: 26, y: 31, w: 760, h: 709 };
export const SHIRT_BACK_BOX = { x: 808, y: 26, w: 766, h: 715 };

export const SHIRT_OUTLINE: readonly (readonly [number, number])[] = [
  [0.41, 0],
  [0.437, 0.014],
  [0.476, 0.025],
  [0.517, 0.025],
  [0.533, 0.023],
  [0.56, 0.014],
  [0.588, 0],
  [0.793, 0.089],
  [0.812, 0.097],
  [0.999, 0.26],
  [0.9, 0.447],
  [0.797, 0.408],
  [0.795, 0.41],
  [0.795, 0.999],
  [0.588, 0.999],
  [0.204, 0.999],
  [0.204, 0.41],
  [0.2, 0.408],
  [0.099, 0.447],
  [0, 0.261],
  [0.018, 0.243],
  [0.187, 0.097],
];
