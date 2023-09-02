// @ts-check

class Matrix {
  /**
   * a d g
   * b e h
   * c f i
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} e
   * @param {number} f
   * @param {number} g
   * @param {number} h
   * @param {number} i
   */
  constructor(a, b, c, d, e, f, g, h, i) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    this.g = g;
    this.h = h;
    this.i = i;
  }
}

/**
 * Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
 * The transformation first applies scale, then rotation, and finally translation.
 * The given rotation value is in degrees.
 * @param {number} positionX
 * @param {number} positionY
 * @param {number} rotation
 * @param {number} scale
 * @returns {[number, number, number, number, number, number, number, number, number]}
 */
function GetTransform(positionX, positionY, rotation, scale) {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}

/**
 * Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
 * The arguments are transformation matrices in the same format.
 * The returned transformation first applies trans1 and then trans2.
 * @param {number} trans1
 * @param {number} trans2
 * @returns
 */
function ApplyTransform(trans1, trans2) {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}
