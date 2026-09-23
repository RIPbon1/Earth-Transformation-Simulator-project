/**
 * ==========================================================================
 * Earth Transformation Simulator - Pure 4x4 Matrix Math Engine
 * Implementation of Homogeneous 3D Transformation Matrices (Row-Major & Column-Major)
 * ==========================================================================
 */

export class MatrixMath {
  /**
   * Returns a 4x4 Identity Matrix in Row-Major order (4x4 2D array)
   */
  static identity() {
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Creates a 4x4 Translation Matrix
   * T(tx, ty, tz) =
   * [ 1, 0, 0, tx ]
   * [ 0, 1, 0, ty ]
   * [ 0, 0, 1, tz ]
   * [ 0, 0, 0, 1  ]
   */
  static translation(tx, ty, tz) {
    return [
      [1, 0, 0, tx],
      [0, 1, 0, ty],
      [0, 0, 1, tz],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Creates a 4x4 Rotation Matrix around X-axis
   * Rx(θ) =
   * [ 1,    0,     0,   0 ]
   * [ 0,  cosθ, -sinθ,  0 ]
   * [ 0,  sinθ,  cosθ,  0 ]
   * [ 0,    0,     0,   1 ]
   */
  static rotationX(deg) {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      [1, 0, 0, 0],
      [0, c, -s, 0],
      [0, s, c, 0],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Creates a 4x4 Rotation Matrix around Y-axis
   * Ry(θ) =
   * [  cosθ, 0, sinθ, 0 ]
   * [    0,  1,   0,  0 ]
   * [ -sinθ, 0, cosθ, 0 ]
   * [    0,  0,   0,  1 ]
   */
  static rotationY(deg) {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      [c, 0, s, 0],
      [0, 1, 0, 0],
      [-s, 0, c, 0],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Creates a 4x4 Rotation Matrix around Z-axis
   * Rz(θ) =
   * [ cosθ, -sinθ, 0, 0 ]
   * [ sinθ,  cosθ, 0, 0 ]
   * [   0,     0,  1, 0 ]
   * [   0,     0,  0, 1 ]
   */
  static rotationZ(deg) {
    const rad = (deg * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return [
      [c, -s, 0, 0],
      [s, c, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Creates a 4x4 Scaling Matrix
   * S(sx, sy, sz) =
   * [ sx,  0,  0, 0 ]
   * [  0, sy,  0, 0 ]
   * [  0,  0, sz, 0 ]
   * [  0,  0,  0, 1 ]
   */
  static scale(sx, sy, sz) {
    return [
      [sx, 0, 0, 0],
      [0, sy, 0, 0],
      [0, 0, sz, 0],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Creates a 4x4 3D Shearing Matrix
   * Sh =
   * [   1,   sh_xy, sh_xz, 0 ]
   * [ sh_yx,   1,   sh_yz, 0 ]
   * [ sh_zx, sh_zy,   1,   0 ]
   * [   0,     0,     0,   1 ]
   */
  static shear(sh_xy = 0, sh_xz = 0, sh_yx = 0, sh_yz = 0, sh_zx = 0, sh_zy = 0) {
    return [
      [1, sh_xy, sh_xz, 0],
      [sh_yx, 1, sh_yz, 0],
      [sh_zx, sh_zy, 1, 0],
      [0, 0, 0, 1]
    ];
  }

  /**
   * Multiplies two 4x4 matrices A and B (Result = A x B)
   */
  static multiply(A, B) {
    const C = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += A[i][k] * B[k][j];
        }
        C[i][j] = sum;
      }
    }
    return C;
  }

  /**
   * Transforms a 3D Point P = [x, y, z, 1]^T by a 4x4 Matrix M
   * P' = M x P
   */
  static transformPoint(M, p) {
    const x = p[0], y = p[1], z = p[2], w = p.length > 3 ? p[3] : 1;
    const nx = M[0][0] * x + M[0][1] * y + M[0][2] * z + M[0][3] * w;
    const ny = M[1][0] * x + M[1][1] * y + M[1][2] * z + M[1][3] * w;
    const nz = M[2][0] * x + M[2][1] * y + M[2][2] * z + M[2][3] * w;
    const nw = M[3][0] * x + M[3][1] * y + M[3][2] * z + M[3][3] * w;

    if (nw !== 1 && nw !== 0) {
      return [nx / nw, ny / nw, nz / nw];
    }
    return [nx, ny, nz];
  }

  /**
   * Converts a 4x4 Row-Major Matrix to Three.js Column-Major 1D array (16 elements)
   */
  static toThreeMatrix(M) {
    // Three.js elements are column-major:
    // [ m00, m10, m20, m30,  m01, m11, m21, m31,  m02, m12, m22, m32,  m03, m13, m23, m33 ]
    return [
      M[0][0], M[1][0], M[2][0], M[3][0],
      M[0][1], M[1][1], M[2][1], M[3][1],
      M[0][2], M[1][2], M[2][2], M[3][2],
      M[0][3], M[1][3], M[2][3], M[3][3]
    ];
  }

  /**
   * Calculates the determinant of the 3x3 upper-left submatrix (Scaling/Volume factor)
   */
  static determinant3x3(M) {
    const a = M[0][0], b = M[0][1], c = M[0][2];
    const d = M[1][0], e = M[1][1], f = M[1][2];
    const g = M[2][0], h = M[2][1], i = M[2][2];

    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  }
}
