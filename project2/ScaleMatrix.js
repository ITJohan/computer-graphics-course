// @ts-check

import Matrix from './Matrix.js';

class ScaleMatrix extends Matrix {
  /**
   * @param {number} s1
   * @param {number} s2
   */
  constructor(s1, s2) {
    super(s1, 0, 0, 0, s2, 0, 0, 0, 0);
  }
}

export default ScaleMatrix;
