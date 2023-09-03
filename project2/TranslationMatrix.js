// @ts-check

import Matrix from './Matrix.js';

class TranslationMatrix extends Matrix {
  /**
   * @param {number} t1
   * @param {number} t2
   */
  constructor(t1, t2) {
    super(1, 0, 0, 0, 1, 0, t1, t2, 1);
  }
}

export default TranslationMatrix;
