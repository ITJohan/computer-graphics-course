// @ts-check

import Matrix from "./Matrix.js";

class ScaleMatrix {
  #matrix = new Matrix(0, 0, 0, 0, 0, 0, 0, 0, 0);

  /**
   * @param {number} s1
   * @param {number} s2
   */
  constructor(s1, s2) {
    this.s1 = s1;
    this.s2 = s2;
    this.#matrix.p11 = s1;
    this.#matrix.p22 = s2;
  }
}

class RotationMatrix {
  #matrix = new Matrix(0, 0, 0, 0, 0, 0, 0, 0, 0);

  /**
   * @param {number} degrees
   */
  constructor(degrees) {
    this.degrees = degrees;
  }

  set degrees(degrees) {
    this.degrees = degrees;
    const radians = degrees * (Math.PI / 180);
    this.#setMatrix(radians);
  }

  #setMatrix(radians) {
    this.#matrix.p11 = Math.cos(radians);
    this.#matrix.p21 = -Math.sin(radians);
    this.#matrix.p12 = Math.sin(radians);
    this.#matrix.p22 = Math.cos(radians);
  }
}
