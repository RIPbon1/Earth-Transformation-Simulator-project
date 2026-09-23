/**
 * ==========================================================================
 * Earth Transformation Simulator - Scene Manager
 * Three.js 3D Scene, Camera, Space Environment, Orbit Controls & Animation Loop
 * ==========================================================================
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ShapeFactory } from './shapeFactory.js';
import { MatrixMath } from './matrixMath.js';

export class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 3, 12);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 40;
    this.controls.minDistance = 3;

    // State Variables
    this.earthTexture = ShapeFactory.generateEarthTexture();
    this.shapes = {
      sphere: ShapeFactory.createEarthSphere(this.earthTexture),
      circle: ShapeFactory.createEarthCircle(this.earthTexture),
      cube: ShapeFactory.createEarthCube(this.earthTexture)
    };

    this.activeShapeKey = 'sphere';
    this.activeObject = null;

    // Animation & Auto Rotation State
    this.autoRotate = true;
    this.autoRotateSpeed = 1.0; // multiplier
    this.autoRotateAngleY = 0; // accumulated continuous rotation in degrees

    // Reference Grid & Starfield
    this.starfield = null;
    this.gridHelper = null;

    this.initEnvironment();
    this.switchShape('sphere');

    // Handle Window Resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Initializes Space Environment: Lights, Starfield, Coordinate Grid
   */
  initEnvironment() {
    // 1. Solar Directional Light (Sun light)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 10, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    // 2. Ambient Space Light (Soft fill)
    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    this.scene.add(ambientLight);

    // 3. Cyan Accent Rim Light
    const rimLight = new THREE.PointLight(0x00f2fe, 1.2, 50);
    rimLight.position.set(-10, -5, -10);
    this.scene.add(rimLight);

    // 4. Dynamic 3D Particle Starfield
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 300;
      starPos[i + 1] = (Math.random() - 0.5) * 300;
      starPos[i + 2] = (Math.random() - 0.5) * 300;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.85
    });

    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // 5. 3D Coordinate Reference Grid
    this.gridHelper = new THREE.GridHelper(30, 30, 0x00f2fe, 0x162a45);
    this.gridHelper.position.y = -5;
    this.scene.add(this.gridHelper);
  }

  /**
   * Switches the visible Earth shape (Sphere, Circle, Cube)
   */
  switchShape(shapeKey) {
    if (!this.shapes[shapeKey]) return;

    if (this.activeObject) {
      this.scene.remove(this.activeObject);
    }

    this.activeShapeKey = shapeKey;
    this.activeObject = this.shapes[shapeKey];

    // Crucial for pure custom matrix control!
    this.activeObject.matrixAutoUpdate = false;

    this.scene.add(this.activeObject);
  }

  /**
   * Applies the combined 4x4 transformation matrix to the active 3D object
   */
  applyTransformationMatrix(matrix4x4RowMajor) {
    if (!this.activeObject) return;

    // Convert row-major math matrix to Three.js column-major 16-element array
    const threeArray = MatrixMath.toThreeMatrix(matrix4x4RowMajor);

    // Set the object's matrix directly
    this.activeObject.matrix.fromArray(threeArray);
    this.activeObject.matrixWorldNeedsUpdate = true;
  }

  /**
   * Animation update loop
   */
  updateAnimation(deltaTime, userTransformState, updateCallback) {
    // Continuous auto rotation around Y axis
    if (this.autoRotate) {
      this.autoRotateAngleY += deltaTime * 30 * this.autoRotateSpeed;
      if (this.autoRotateAngleY >= 360) this.autoRotateAngleY -= 360;
    }

    // Twinkle / rotate starfield slowly
    if (this.starfield) {
      this.starfield.rotation.y += 0.0002;
    }

    this.controls.update();

    // Trigger parent callback to compute compound matrix and render matrix inspector
    if (updateCallback) {
      updateCallback(this.autoRotateAngleY);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
