// Shape data for the 3D T-shirt on /merch, traced from the mockup
// public/merch/million-goats-tee.webp (front shirt on the left, back on the right;
// transparent background). Points are normalized to the front shirt's bounding
// box: x → right, y → down.

export const SHIRT_IMAGE = { src: "/merch/million-goats-tee.webp", width: 1753, height: 1038 };

/** Pixel bounding boxes of each shirt inside SHIRT_IMAGE. */
export const SHIRT_FRONT_BOX = { x: 30, y: 30, w: 812, h: 969 };
export const SHIRT_BACK_BOX = { x: 903, y: 34, w: 820, h: 974 };

export const SHIRT_OUTLINE: readonly (readonly [number, number])[] = [
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
