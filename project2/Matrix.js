// @ts-check

import Vector from './Vector.js';

class Matrix {
  /**
   * p11 p12 p13
   * p21 p22 p23
   * p31 p32 p33
   * @param {number} p11
   * @param {number} p21
   * @param {number} p31
   * @param {number} p12
   * @param {number} p22
   * @param {number} p32
   * @param {number} p13
   * @param {number} p23
   * @param {number} p33
   */
  constructor(p11, p21, p31, p12, p22, p32, p13, p23, p33) {
    this.p11 = p11;
    this.p21 = p21;
    this.p31 = p31;
    this.p12 = p12;
    this.p22 = p22;
    this.p32 = p32;
    this.p13 = p13;
    this.p23 = p23;
    this.p33 = p33;
  }

  /**
   * @param {Vector} vector
   * @returns {Vector}
   */
  multiplyWithVector(vector) {
    const p1 =
      vector.p1 * this.p11 + vector.p2 * this.p12 + vector.p3 * this.p13;
    const p2 =
      vector.p1 * this.p21 + vector.p2 * this.p22 + vector.p3 * this.p23;
    const p3 =
      vector.p1 * this.p31 + vector.p2 * this.p32 + vector.p3 * this.p33;

    return new Vector(p1, p2, p3);
  }

  /**
   * @param {Matrix} matrix
   * @returns {Matrix}
   */
  multiplyWithMatrix(matrix) {
    const p11 =
      this.p11 * matrix.p11 + this.p12 * matrix.p21 + this.p13 * matrix.p31;
    const p21 =
      this.p21 * matrix.p11 + this.p22 * matrix.p21 + this.p23 * matrix.p31;
    const p31 =
      this.p31 * matrix.p11 + this.p32 * matrix.p21 + this.p33 * matrix.p31;

    const p12 =
      this.p11 * matrix.p12 + this.p12 * matrix.p22 + this.p13 * matrix.p32;
    const p22 =
      this.p21 * matrix.p12 + this.p22 * matrix.p22 + this.p23 * matrix.p32;
    const p32 =
      this.p31 * matrix.p12 + this.p32 * matrix.p22 + this.p33 * matrix.p32;

    const p13 =
      this.p11 * matrix.p13 + this.p12 * matrix.p23 + this.p13 * matrix.p33;
    const p23 =
      this.p21 * matrix.p13 + this.p22 * matrix.p23 + this.p23 * matrix.p33;
    const p33 =
      this.p31 * matrix.p13 + this.p32 * matrix.p23 + this.p33 * matrix.p33;

    return new Matrix(p11, p21, p31, p12, p22, p32, p13, p23, p33);
  }
}

export default Matrix;
