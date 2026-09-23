/**
 * ==========================================================================
 * Earth Transformation Simulator - Main Application Entry Point
 * Orchestrates SceneManager, UIController, and Matrix Computations
 * ==========================================================================
 */

import { SceneManager } from './sceneManager.js';
import { UIController } from './uiController.js';
import { MatrixMath } from './matrixMath.js';

class EarthSimulatorApp {
  constructor() {
    this.sceneManager = new SceneManager('canvas-container');
    this.uiController = new UIController({
      onShapeChange: (shape) => this.handleShapeChange(shape),
      onMatrixUpdate: (state) => this.handleMatrixUpdate(state),
      onAutoRotateToggle: (enabled) => this.handleAutoRotateToggle(enabled),
      onSpeedChange: (speed) => this.handleSpeedChange(speed)
    });

    this.lastTime = performance.now();
    this.initAnimationLoop();
    this.handleMatrixUpdate(this.uiController.state);
  }

  handleShapeChange(shapeKey) {
    this.sceneManager.switchShape(shapeKey);
    this.handleMatrixUpdate(this.uiController.state);
  }

  handleAutoRotateToggle(enabled) {
    this.sceneManager.autoRotate = enabled;
  }

  handleSpeedChange(speed) {
    this.sceneManager.autoRotateSpeed = speed;
  }

  /**
   * Computes the compound 4x4 homogenous matrix and passes it to WebGL scene and UI inspector
   */
  handleMatrixUpdate(state, currentAutoAngleY = 0) {
    // 1. Build Individual Transformation Matrices
    const T = MatrixMath.translation(state.tx, state.ty, state.tz);

    // Combine manual rotation + continuous auto-rotation
    const totalRy = state.ry + currentAutoAngleY;
    const Rx = MatrixMath.rotationX(state.rx);
    const Ry = MatrixMath.rotationY(totalRy);
    const Rz = MatrixMath.rotationZ(state.rz);

    // Combined Rotation R = Rz x Ry x Rx
    const R_xy = MatrixMath.multiply(Ry, Rx);
    const R = MatrixMath.multiply(Rz, R_xy);

    // Scaling Matrix
    const S = MatrixMath.scale(state.sx, state.sy, state.sz);

    // 3D Shearing Matrix
    const Sh = MatrixMath.shear(
      state.sh_xy, state.sh_xz,
      state.sh_yx, state.sh_yz,
      state.sh_zx, state.sh_zy
    );

    // 2. Compute Compound Matrix in standard Computer Graphics order:
    // M_total = T x R x Sh x S
    const Sh_S = MatrixMath.multiply(Sh, S);
    const R_Sh_S = MatrixMath.multiply(R, Sh_S);
    const M_total = MatrixMath.multiply(T, R_Sh_S);

    // 3. Apply matrix to Three.js object
    this.sceneManager.applyTransformationMatrix(M_total);

    // 4. Update UI Matrix Inspector Grid & Sub-matrices
    this.uiController.updateMatrixDisplay(M_total, { T, R, S, Sh });
  }

  /**
   * Main RequestAnimationFrame Loop
   */
  initAnimationLoop() {
    const loop = (time) => {
      const deltaTime = (time - this.lastTime) / 1000;
      this.lastTime = time;

      this.sceneManager.updateAnimation(deltaTime, this.uiController.state, (autoAngleY) => {
        this.handleMatrixUpdate(this.uiController.state, autoAngleY);
      });

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Instantiate App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.earthApp = new EarthSimulatorApp();
});
