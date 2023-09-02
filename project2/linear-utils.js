// @ts-check

class Vector {
  /**
   * @param {number} p1
   * @param {number} p2
   * @param {number} p3
   */
  constructor(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }
}

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

  /**
   * this * matrix
   * @param {Matrix} matrix
   */
  multiplyMatrix(matrix) {
    const aPrime = matrix.a * this.a + matrix.d * this.b + matrix.g + this.c;
  }
}

class ScaleMatrix {
  #matrix = new Matrix(0, 0, 0, 0, 0, 0, 0, 0, 0);

  /**
   * @param {number} s1
   * @param {number} s2
   */
  constructor(s1, s2) {
    this.s1 = s1;
    this.s2 = s2;
    this.#matrix.a = s1;
    this.#matrix.e = s2;
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
    this.#matrix.a = Math.cos(radians);
    this.#matrix.b = -Math.sin(radians);
    this.#matrix.d = Math.sin(radians);
    this.#matrix.e = Math.cos(radians);
  }
}

/**
 * @param {Matrix} matrix
 * @param {Vector} vector
 * @returns {Vector}
 */
export const multiplyMatrixWithVector = (matrix, vector) => {
  const p1Prime =
    vector.p1 * matrix.a + vector.p2 * matrix.d + vector.p3 * matrix.g;
  const p2Prime =
    vector.p1 * matrix.b + vector.p2 * matrix.e + vector.p3 * matrix.h;
  const p3Prime =
    vector.p1 * matrix.c + vector.p2 * matrix.f + vector.p3 * matrix.i;

  return new Vector(p1Prime, p2Prime, p3Prime);
};
