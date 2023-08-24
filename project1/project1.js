// @ts-check

class Color {
  /**
   * @param {number} r Red
   * @param {number} g Green
   * @param {number} b Blue
   * @param {number} a Alpha
   */
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

/**
 * @param {ImageData} bgImage The background image to be modified
 * @param {ImageData} fgImage The foreground image
 * @param {number} fgOpacity The opacity of the foreground image
 * @param {{x: number, y: number}} fgPosition The position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned
 */
function composite(bgImage, fgImage, fgOpacity, fgPosition) {
  const fgPosXEnd = fgPosition.x + fgImage.width;
  const fgPosYEnd = fgPosition.y + fgImage.height;
  const bgOpacity = 1 - fgOpacity;

  for (let y = 0; y < bgImage.height; y++) {
    for (let x = 0; x < bgImage.width; x++) {
      const isInsideBgImage =
        y >= 0 && y < bgImage.height && x >= 0 && x < bgImage.width;
      const isInsideFgImage =
        y >= fgPosition.y &&
        y < fgPosYEnd &&
        x >= fgPosition.x &&
        x < fgPosXEnd;

      if (isInsideBgImage && isInsideFgImage) {
        const backgroundIndex = y * bgImage.width * 4 + x * 4;
        const foregroundIndex =
          (x - fgPosition.x) * 4 + (y - fgPosition.y) * fgImage.width * 4;

        const backgroundColor = new Color(
          bgImage.data[backgroundIndex],
          bgImage.data[backgroundIndex + 1],
          bgImage.data[backgroundIndex + 2],
          bgImage.data[backgroundIndex + 3]
        );
        const foregroundColor = new Color(
          fgImage.data[foregroundIndex],
          fgImage.data[foregroundIndex + 1],
          fgImage.data[foregroundIndex + 2],
          fgImage.data[foregroundIndex + 3]
        );

        const normalizedForegroundAlpha = foregroundColor.a / 255;

        const redResult =
          normalizedForegroundAlpha * foregroundColor.r +
          (1 - normalizedForegroundAlpha) * backgroundColor.r;
        const greenResult =
          normalizedForegroundAlpha * foregroundColor.g +
          (1 - normalizedForegroundAlpha) * backgroundColor.g;
        const blueResult =
          normalizedForegroundAlpha * foregroundColor.b +
          (1 - normalizedForegroundAlpha) * backgroundColor.b;

        bgImage.data[backgroundIndex] = redResult;
        bgImage.data[backgroundIndex + 1] = greenResult;
        bgImage.data[backgroundIndex + 2] = blueResult;
      }
    }
  }
}
