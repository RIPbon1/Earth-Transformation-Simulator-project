# Earth Transformation Simulator

An interactive 3D/2D Computer Graphics mini-project demonstrating fundamental **Geometric Transformations** in 3D space using **4x4 Homogeneous Matrices**.

---

## 🎯 Project Objective

The primary objective of this project is to provide a visual and mathematical workbench for demonstrating how geometric transformations—**Translation**, **Rotation**, **Scaling**, and **Shearing**—operate on 3D/2D objects in Computer Graphics.

Users can transform three distinct Earth representations (**Original Sphere Globe**, **2D Circle Earth**, and **Voxel Cube Earth**) while visualizing real-time $4 \times 4$ transformation matrix calculations, component sub-matrices, determinant scale factors, and point vertex transformations.

---

## ✨ Features

1. **3 Earth Representations**:
   - **Original Earth Sphere**: Realistic 3D Globe with procedural continents, ocean specular highlights, and atmospheric rim glow shader.
   - **Circle Earth**: 2D flat circular Earth disc with double-sided rendering and glowing cyber ring.
   - **Cube Earth**: 3D Voxel Earth Cube with seamless faces and wireframe highlights.

2. **Complete 4x4 Geometric Matrix Transformations**:
   - **Translation ($T$)**: Independent translation along X, Y, and Z axes.
   - **Rotation ($R$)**: Axis-aligned Euler rotations around X, Y, and Z axes.
   - **Scaling ($S$)**: Non-uniform scaling along X, Y, and Z axes.
   - **Shearing ($Sh$)**: 3D shearing parameters ($Sh_{xy}, Sh_{xz}, Sh_{yx}, Sh_{yz}, Sh_{zx}, Sh_{zy}$) deforming shapes into parallelepipeds and slanted geometry.

3. **Continuous Auto-Rotation**:
   - Automatic continuous rotation around Y-axis upon startup.
   - Auto-rotation ON/OFF toggle switch.
   - Speed control slider (0.1x to 5.0x).
   - Manual rotation override via sliders.

4. **Real-time Educational Matrix Inspector**:
   - Interactive $4 \times 4$ Matrix grid displaying live computed values.
   - Component sub-matrix decomposer view ($T, R, S, Sh$).
   - Live vertex point transformation preview ($P = [1, 1, 1, 1]^T \rightarrow P'$).
   - 3x3 Determinant calculator ($\det(M_{3\times 3})$) showing volume scaling factor.

5. **Demo Presets & Action Controls**:
   - Quick preset scenarios: *Default Globe*, *Sheared Cube (Parallelepiped)*, *Flattened Satellite Disc*, *Translational Orbit*, *Full Combo Matrix*.
   - Instant Reset button to revert all matrices to Identity ($I_4$).

6. **Modern UI & Visual Design**:
   - Deep space dark background with twinkling 3D starfield particles.
   - Glassmorphism UI panel design with glowing status indicators.
   - Embedded interactive math theory modal explaining matrix equations.

---

## 🛠️ Technologies Used

- **HTML5 & Vanilla CSS3**: Structure, dark space theme, and glassmorphism styling.
- **JavaScript (ES6 Modules)**: Pure 4x4 matrix math calculations and UI controllers.
- **Three.js (WebGL)**: 3D scene rendering, procedural textures, lighting, camera management, and OrbitControls.
- **Node.js / Vite (Optional)**: Local development server support.

---

## 🧮 How Geometric Transformations Work

In 3D Computer Graphics, affine transformations are represented using $4 \times 4$ homogeneous matrices. A 3D point $P = (x, y, z)$ is represented as a 4-element column vector $P = [x, y, z, 1]^T$.

### 1. Translation Matrix $T(t_x, t_y, t_z)$
Moves an object by displacements $t_x, t_y, t_z$:
$$\begin{bmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

### 2. Rotation Matrices $R_x(\theta_x), R_y(\theta_y), R_z(\theta_z)$
Rotates an object around coordinate axes by angle $\theta$:
$$R_x(\theta) = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & \cos\theta & -\sin\theta & 0 \\ 0 & \sin\theta & \cos\theta & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}, \quad R_y(\theta) = \begin{bmatrix} \cos\theta & 0 & \sin\theta & 0 \\ 0 & 1 & 0 & 0 \\ -\sin\theta & 0 & \cos\theta & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

### 3. Scaling Matrix $S(s_x, s_y, s_z)$
Scales object dimensions along axes:
$$\begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

### 4. Shearing Matrix $Sh$
Distorts the shape along one axis based on another axis value:
$$\begin{bmatrix} 1 & sh_{xy} & sh_{xz} & 0 \\ sh_{yx} & 1 & sh_{yz} & 0 \\ sh_{zx} & sh_{zy} & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

### 5. Matrix Composition Order
Matrix multiplication is **non-commutative**. To ensure transformations occur relative to the object's local origin before world space placement, the final matrix is computed as:
$$M_{\text{total}} = T(t_x, t_y, t_z) \cdot R_z(\theta_z) \cdot R_y(\theta_y) \cdot R_x(\theta_x) \cdot Sh \cdot S(s_x, s_y, s_z)$$

---

## 🚀 How to Run the Project

### Option A: Direct Browser Execution (No Installation Required)
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).

### Option B: Local Dev Server (Vite)
If you prefer running via Node.js local dev server:
1. Open terminal in project directory:
   ```bash
   cd earth-transformation-simulator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (e.g. `http://localhost:5173`) in your browser.

---

## 🎮 Controls Reference

| Control | Description |
| :--- | :--- |
| **Left Click + Drag** | Orbit / Rotate camera around space |
| **Right Click + Drag** | Pan camera view |
| **Scroll Wheel** | Zoom camera in / out |
| **Shape Buttons** | Toggle between Sphere, Circle, and Cube shapes |
| **Translate Sliders** | Adjust X, Y, Z position offsets (-10 to +10) |
| **Rotate Sliders** | Adjust X, Y, Z manual rotation angles (0° to 360°) |
| **Scale Sliders** | Adjust X, Y, Z scaling ratios (0.1x to 3.0x) |
| **Shear Sliders** | Adjust XY, XZ, YX, YZ, ZX, ZY shearing factors |
| **Auto Rotate Toggle** | Pause or resume continuous Y-axis rotation |
| **Speed Slider** | Adjust auto-rotation speed multiplier |
| **Reset Button** | Reset all sliders and restore Identity Matrix |
| **Theory Button** | View embedded matrix math equations modal |

---

## 📊 Expected Output

When running the application:
1. A 3D Earth globe continuously rotates in a dark space background surrounded by twinkling stars.
2. Adjusting translation sliders shifts the Earth along coordinate axes in real-time while updating column 4 $[t_x, t_y, t_z, 1]^T$ in the Matrix Inspector.
3. Adjusting shear sliders transforms the Cube Earth into a slanted 3D parallelepiped or flattens the Sphere Earth into an oblique ellipsoid.
4. The Matrix Inspector displays the exact numerical $4 \times 4$ result matrix, component sub-matrices, volume scale factor determinant, and transformed point coordinate $P'$.

---

## 🔮 Future Improvements

- Add arbitrary axis rotation around an arbitrary 3D line.
- Add camera view presets (Top, Front, Side projections).
- Implement custom shader animation for atmospheric cloud movement.
- Add matrix multiplication sequence re-ordering toggle ($S \cdot T$ vs $T \cdot S$) to visually demonstrate non-commutativity.
