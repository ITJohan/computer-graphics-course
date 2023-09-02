// @ts-check

import Matrix from './Matrix.js';

class RotationMatrix extends Matrix {
  /**
   * @param {number} degrees
   */
  constructor(degrees) {
    const radians = degrees * (Math.PI / 180);
    super(
      Math.cos(radians),
      -Math.sin(radians),
      0,
      Math.sin(radians),
      Math.cos(radians),
      0,
      0,
      0,
      1
    );
    this.degrees = degrees;
  }

  set degrees(degrees) {
    const radians = degrees * (Math.PI / 180);
    this.p11 = Math.cos(radians);
    this.p21 = -Math.sin(radians);
    this.p12 = Math.sin(radians);
    this.p22 = Math.cos(radians);
    this.degrees = degrees;
  }
}

export default RotationMatrix;
