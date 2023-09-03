// @ts-check

import ScaleMatrix from './ScaleMatrix.js';
import RotationMatrix from './RotationMatrix.js';
import TranslationMatrix from './TranslationMatrix.js';
import Matrix from './Matrix.js';

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
export function GetTransform(positionX, positionY, rotation, scale) {
  const scaleMatrix = new ScaleMatrix(scale, scale);
  const rotationMatrix = new RotationMatrix(rotation);
  const translationMatrix = new TranslationMatrix(positionX, positionY);

  const resultMatrix = translationMatrix.multiplyWithMatrix(
    rotationMatrix.multiplyWithMatrix(scaleMatrix)
  );

  return [
    resultMatrix.p11,
    resultMatrix.p21,
    resultMatrix.p31,
    resultMatrix.p12,
    resultMatrix.p22,
    resultMatrix.p32,
    resultMatrix.p13,
    resultMatrix.p23,
    resultMatrix.p33,
  ];
}

/**
 * Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
 * The arguments are transformation matrices in the same format.
 * The returned transformation first applies trans1 and then trans2.
 * @param {[number, number, number, number, number, number, number, number, number]} trans1
 * @param {[number, number, number, number, number, number, number, number, number]} trans2
 * @returns
 */
export function ApplyTransform(trans1, trans2) {
  const matrix1 = new Matrix(
    trans1[0],
    trans1[1],
    trans1[2],
    trans1[3],
    trans1[4],
    trans1[5],
    trans1[6],
    trans1[7],
    trans1[8]
  );
  const matrix2 = new Matrix(
    trans2[0],
    trans2[1],
    trans2[2],
    trans2[3],
    trans2[4],
    trans2[5],
    trans2[6],
    trans2[7],
    trans2[8]
  );
  const resultMatrix = matrix2.multiplyWithMatrix(matrix1);

  return [
    resultMatrix.p11,
    resultMatrix.p21,
    resultMatrix.p31,
    resultMatrix.p12,
    resultMatrix.p22,
    resultMatrix.p32,
    resultMatrix.p13,
    resultMatrix.p23,
    resultMatrix.p33,
  ];
}
