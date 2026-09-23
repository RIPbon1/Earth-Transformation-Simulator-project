/**
 * ==========================================================================
 * Earth Transformation Simulator - Shape & Procedural Texture Factory
 * Generates Earth Sphere, 2D Circle Earth, and Cube Earth with textures
 * ==========================================================================
 */

import * as THREE from 'three';

export class ShapeFactory {
  /**
   * Generates a high-quality procedural Earth map texture using HTML Canvas.
   * This removes any dependency on external image assets.
   */
  static generateEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Deep Ocean Background Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a1d37');
    oceanGrad.addColorStop(0.3, '#103768');
    oceanGrad.addColorStop(0.5, '#164880');
    oceanGrad.addColorStop(0.7, '#103768');
    oceanGrad.addColorStop(1, '#0a1d37');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Procedural Continents (Green/Brown landmasses)
    ctx.fillStyle = '#2d6a4f';

    // Helper to draw organic continent shapes
    const drawLandmass = (pathPoints, color = '#2b7a4b') => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(pathPoints[0][0], pathPoints[0][1]);
      for (let i = 1; i < pathPoints.length; i++) {
        ctx.lineTo(pathPoints[i][0], pathPoints[i][1]);
      }
      ctx.closePath();
      ctx.fill();
    };

    // North America
    drawLandmass([
      [300, 200], [550, 180], [680, 280], [600, 420], 
      [520, 500], [420, 450], [350, 320], [280, 250]
    ], '#386641');

    // South America
    drawLandmass([
      [520, 520], [620, 550], [680, 680], [600, 850], 
      [540, 920], [500, 750], [480, 600]
    ], '#2d6a4f');

    // Eurasia
    drawLandmass([
      [950, 180], [1350, 150], [1750, 220], [1800, 380], 
      [1600, 480], [1300, 450], [1100, 320], [980, 280]
    ], '#40916c');

    // Africa
    drawLandmass([
      [980, 380], [1200, 400], [1250, 550], [1150, 750], 
      [1050, 800], [960, 620], [940, 480]
    ], '#52b788');

    // Australia & Indonesia
    drawLandmass([
      [1500, 600], [1750, 620], [1800, 750], [1650, 820], [1520, 720]
    ], '#74c69d');

    // Greenland & Polar Ice Caps
    drawLandmass([[650, 80], [800, 70], [850, 150], [700, 170]], '#f8f9fa');
    
    // North & South Poles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, 60); // North Pole
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70); // South Pole

    // 3. Grid Lines (Longitude & Latitude) for CG visualization
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Generates custom Atmosphere Shader Material for glowing globe rim
   */
  static createAtmosphereMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.0, 0.75, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
  }

  /**
   * Builds the 3D Realistic Earth Globe (Sphere)
   */
  static createEarthSphere(texture) {
    const group = new THREE.Group();
    group.name = 'EarthSphereGroup';

    // Main Sphere Mesh
    const geometry = new THREE.SphereGeometry(2.5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 35,
      specular: new THREE.Color(0x224488),
      bumpScale: 0.05
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Atmosphere Glow Layer
    const atmosGeometry = new THREE.SphereGeometry(2.65, 32, 32);
    const atmosMaterial = this.createAtmosphereMaterial();
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    group.add(atmosMesh);

    return group;
  }

  /**
   * Builds the 2D Circular Earth Representation
   */
  static createEarthCircle(texture) {
    const group = new THREE.Group();
    group.name = 'EarthCircleGroup';

    // 2D Flat Disc Geometry
    const geometry = new THREE.CircleGeometry(2.8, 64);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);

    // Ring Border Glow
    const ringGeo = new THREE.RingGeometry(2.8, 2.9, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    group.add(mesh);
    group.add(ringMesh);

    return group;
  }

  /**
   * Builds the 3D Voxel Earth Cube
   */
  static createEarthCube(texture) {
    const group = new THREE.Group();
    group.name = 'EarthCubeGroup';

    const geometry = new THREE.BoxGeometry(3.6, 3.6, 3.6);
    
    // Create materials for each face of the cube
    const materials = [];
    for (let i = 0; i < 6; i++) {
      materials.push(new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.1
      }));
    }

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Cyber Wireframe Edges
    const edgesGeo = new THREE.EdgesGeometry(geometry);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x00f2fe, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    group.add(wireframe);

    return group;
  }
}
