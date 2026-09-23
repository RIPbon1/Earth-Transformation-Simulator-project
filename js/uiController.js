/**
 * ==========================================================================
 * Earth Transformation Simulator - UI Controller & Matrix Inspector
 * Manages Sliders, Tabs, Presets, Matrix Visualizer & Point Calculator
 * ==========================================================================
 */

import { MatrixMath } from './matrixMath.js';

export class UIController {
  constructor(callbacks) {
    this.callbacks = callbacks; // Handlers for shape switch, matrix re-calc, etc.

    // State object storing active user transformation parameters
    this.state = {
      shape: 'sphere',
      // Translation
      tx: 0, ty: 0, tz: 0,
      // Rotation (Degrees)
      rx: 0, ry: 0, rz: 0,
      // Scale
      sx: 1.0, sy: 1.0, sz: 1.0,
      // Shear
      sh_xy: 0, sh_xz: 0,
      sh_yx: 0, sh_yz: 0,
      sh_zx: 0, sh_zy: 0,
      // Auto rotation speed & toggle
      autoRotate: true,
      rotateSpeed: 1.0
    };

    this.initDOMReferences();
    this.bindEvents();
  }

  initDOMReferences() {
    // Shape buttons
    this.shapeBtns = document.querySelectorAll('.btn-shape');

    // Tabs
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');

    // Sliders & Text Inputs
    this.inputs = {
      tx: document.getElementById('slider-tx'),
      ty: document.getElementById('slider-ty'),
      tz: document.getElementById('slider-tz'),
      rx: document.getElementById('slider-rx'),
      ry: document.getElementById('slider-ry'),
      rz: document.getElementById('slider-rz'),
      sx: document.getElementById('slider-sx'),
      sy: document.getElementById('slider-sy'),
      sz: document.getElementById('slider-sz'),
      sh_xy: document.getElementById('slider-sh-xy'),
      sh_xz: document.getElementById('slider-sh-xz'),
      sh_yx: document.getElementById('slider-sh-yx'),
      sh_yz: document.getElementById('slider-sh-yz'),
      sh_zx: document.getElementById('slider-sh-zx'),
      sh_zy: document.getElementById('slider-sh-zy')
    };

    // Value Display Boxes
    this.valDisplays = {
      tx: document.getElementById('val-tx'),
      ty: document.getElementById('val-ty'),
      tz: document.getElementById('val-tz'),
      rx: document.getElementById('val-rx'),
      ry: document.getElementById('val-ry'),
      rz: document.getElementById('val-rz'),
      sx: document.getElementById('val-sx'),
      sy: document.getElementById('val-sy'),
      sz: document.getElementById('val-sz'),
      sh_xy: document.getElementById('val-sh-xy'),
      sh_xz: document.getElementById('val-sh-xz'),
      sh_yx: document.getElementById('val-sh-yx'),
      sh_yz: document.getElementById('val-sh-yz'),
      sh_zx: document.getElementById('val-sh-zx'),
      sh_zy: document.getElementById('val-sh-zy')
    };

    // Buttons
    this.btnReset = document.getElementById('btn-reset');
    this.btnAutoRotate = document.getElementById('btn-autorotate');
    this.sliderSpeed = document.getElementById('slider-speed');
    this.valSpeed = document.getElementById('val-speed');
    this.presetSelect = document.getElementById('preset-select');
    this.btnInfo = document.getElementById('btn-info');

    // Matrix Inspector Elements
    this.matrixGridCells = document.querySelectorAll('.matrix-cell');
    this.detDisplay = document.getElementById('status-det');
    this.shapeDisplay = document.getElementById('status-shape');
    this.coordInput = document.getElementById('coord-input');
    this.coordOutput = document.getElementById('coord-output');

    // Sub-matrices Container
    this.subMatricesContainer = document.getElementById('sub-matrices-container');

    // Modal
    this.modalOverlay = document.getElementById('modal-info');
    this.modalCloseBtn = document.getElementById('modal-close');
  }

  bindEvents() {
    // Shape Selection
    this.shapeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const shape = btn.dataset.shape;
        this.setShape(shape);
      });
    });

    // Tab Switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        this.tabBtns.forEach(b => b.classList.remove('active'));
        this.tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${targetTab}`).classList.add('active');
      });
    });

    // Slider & Input Bindings
    Object.keys(this.inputs).forEach(key => {
      const input = this.inputs[key];
      if (input) {
        input.addEventListener('input', () => {
          const val = parseFloat(input.value);
          this.state[key] = val;
          if (this.valDisplays[key]) {
            this.valDisplays[key].textContent = val.toFixed(key.startsWith('s') && !key.startsWith('sh') ? 2 : 1);
          }
          this.triggerMatrixUpdate();
        });
      }
    });

    // Reset Button
    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => this.resetTransformations());
    }

    // Auto Rotate Toggle
    if (this.btnAutoRotate) {
      this.btnAutoRotate.addEventListener('click', () => {
        this.state.autoRotate = !this.state.autoRotate;
        this.btnAutoRotate.classList.toggle('active', this.state.autoRotate);
        this.btnAutoRotate.innerHTML = this.state.autoRotate 
          ? '<span>⏸</span> Auto Rotate' 
          : '<span>▶</span> Auto Rotate';
        if (this.callbacks.onAutoRotateToggle) {
          this.callbacks.onAutoRotateToggle(this.state.autoRotate);
        }
      });
    }

    // Speed Slider
    if (this.sliderSpeed) {
      this.sliderSpeed.addEventListener('input', () => {
        const spd = parseFloat(this.sliderSpeed.value);
        this.state.rotateSpeed = spd;
        if (this.valSpeed) this.valSpeed.textContent = spd.toFixed(1) + 'x';
        if (this.callbacks.onSpeedChange) {
          this.callbacks.onSpeedChange(spd);
        }
      });
    }

    // Preset Selector
    if (this.presetSelect) {
      this.presetSelect.addEventListener('change', (e) => {
        this.applyPreset(e.target.value);
      });
    }

    // Info Modal
    if (this.btnInfo) {
      this.btnInfo.addEventListener('click', () => this.modalOverlay.classList.add('active'));
    }
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.modalOverlay.classList.remove('active'));
    }
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.modalOverlay.classList.remove('active');
      });
    }
  }

  setShape(shape) {
    this.state.shape = shape;
    this.shapeBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.shape === shape);
    });
    if (this.shapeDisplay) {
      this.shapeDisplay.textContent = shape.toUpperCase();
    }
    if (this.callbacks.onShapeChange) {
      this.callbacks.onShapeChange(shape);
    }
  }

  resetTransformations() {
    this.state.tx = 0; this.state.ty = 0; this.state.tz = 0;
    this.state.rx = 0; this.state.ry = 0; this.state.rz = 0;
    this.state.sx = 1.0; this.state.sy = 1.0; this.state.sz = 1.0;
    this.state.sh_xy = 0; this.state.sh_xz = 0;
    this.state.sh_yx = 0; this.state.sh_yz = 0;
    this.state.sh_zx = 0; this.state.sh_zy = 0;

    this.syncUIFromState();
    this.triggerMatrixUpdate();
  }

  syncUIFromState() {
    Object.keys(this.inputs).forEach(key => {
      if (this.inputs[key]) {
        this.inputs[key].value = this.state[key];
      }
      if (this.valDisplays[key]) {
        this.valDisplays[key].textContent = parseFloat(this.state[key]).toFixed(key.startsWith('s') && !key.startsWith('sh') ? 2 : 1);
      }
    });
  }

  applyPreset(presetKey) {
    this.resetTransformations();

    switch (presetKey) {
      case 'default':
        break;
      case 'sheared-cube':
        this.setShape('cube');
        this.state.sh_xy = 0.6;
        this.state.sh_xz = 0.3;
        this.state.rx = 15;
        this.state.ry = 30;
        break;
      case 'satellite-disc':
        this.setShape('circle');
        this.state.sx = 1.4;
        this.state.sy = 1.4;
        this.state.sz = 0.2;
        this.state.rx = 60;
        break;
      case 'orbit':
        this.setShape('sphere');
        this.state.tx = 4.0;
        this.state.ty = 1.5;
        this.state.ry = 45;
        break;
      case 'extreme-combo':
        this.setShape('sphere');
        this.state.tx = 2.0; this.state.ty = 1.0;
        this.state.rx = 35; this.state.ry = 45; this.state.rz = 20;
        this.state.sx = 1.3; this.state.sy = 0.7; this.state.sz = 1.1;
        this.state.sh_xy = 0.4; this.state.sh_yz = 0.3;
        break;
    }

    this.syncUIFromState();
    this.triggerMatrixUpdate();
  }

  triggerMatrixUpdate() {
    if (this.callbacks.onMatrixUpdate) {
      this.callbacks.onMatrixUpdate(this.state);
    }
  }

  /**
   * Renders the 4x4 matrix grid, individual submatrices, and transformed point coordinate
   */
  updateMatrixDisplay(finalMatrix, subMatrices) {
    // 1. Update 4x4 Grid Cells
    let cellIdx = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = this.matrixGridCells[cellIdx];
        if (cell) {
          const val = finalMatrix[r][c];
          cell.textContent = val.toFixed(2);

          // Color Highlight logic
          cell.className = 'matrix-cell';
          if (c === 3 && r < 3) cell.classList.add('highlight-t'); // Translation column
          else if (r === c && r < 3 && val !== 1) cell.classList.add('highlight-s'); // Scaling diagonal
          else if (r !== c && r < 3 && c < 3 && val !== 0) cell.classList.add('highlight-sh'); // Shear / Rotation entries
        }
        cellIdx++;
      }
    }

    // 2. Compute Determinant of 3x3 scaling/rotation submatrix
    const det = MatrixMath.determinant3x3(finalMatrix);
    if (this.detDisplay) {
      this.detDisplay.textContent = det.toFixed(3);
    }

    // 3. Transform sample point P(1, 1, 1) to P'
    const P = [1, 1, 1, 1];
    const P_prime = MatrixMath.transformPoint(finalMatrix, P);
    if (this.coordOutput) {
      this.coordOutput.textContent = `P' = (${P_prime[0].toFixed(2)}, ${P_prime[1].toFixed(2)}, ${P_prime[2].toFixed(2)})`;
    }

    // 4. Update Sub-matrices breakdown display
    if (subMatrices && this.subMatricesContainer) {
      this.renderSubMatrices(subMatrices);
    }
  }

  renderSubMatrices(sub) {
    const list = [
      { name: 'Translation T(x,y,z)', matrix: sub.T, color: 'var(--accent-cyan)' },
      { name: 'Rotation R(x,y,z)', matrix: sub.R, color: 'var(--accent-green)' },
      { name: 'Scale S(x,y,z)', matrix: sub.S, color: 'var(--accent-amber)' },
      { name: 'Shear Sh', matrix: sub.Sh, color: 'var(--accent-rose)' }
    ];

    let html = '';
    list.forEach(item => {
      html += `
        <div class="sub-matrix-card">
          <div class="sub-matrix-title" style="color: ${item.color}">${item.name}</div>
          <div class="sub-matrix-grid">
            ${item.matrix.map(row => row.map(v => `<div class="sub-matrix-cell">${v.toFixed(1)}</div>`).join('')).join('')}
          </div>
        </div>
      `;
    });
    this.subMatricesContainer.innerHTML = html;
  }
}
