// MyRocks.js
import * as THREE from 'three';

class MyRocks {
  constructor(app, cubeSize) {
    this.app = app;
    this.group = null;
    this.parts = [];
    this.cubeSize = cubeSize;
    this.material = null;

    this.properties = {
      diffuseColor: "#796e63",
      transparency: 1.0,
      heightRatio: 0.40,
      xzOffsetRatio: { x: -0.25, z: -0.25 },
      scale: 1.0,
      texturePath: "./textures/rock.jpg",
      detail: 1,              
      noiseAmplitude: 0.18,  
      partsCount: 8           
    };
  }

  _noise3(x, y, z) {
    const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
    return s - Math.floor(s);
  }

  _perturbGeometry(geo, amp = 0.15) {
    const g = geo.toNonIndexed();
    const pos = g.attributes.position;
    const nrm = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const n = this._noise3(x, y, z) * 2.0 - 1.0;
      
      const len = Math.max(1e-6, Math.hypot(x, y, z));
      const nx = x / len, ny = y / len, nz = z / len;

      pos.setXYZ(i, x + nx * amp * n, y + ny * amp * n, z + nz * amp * n);
      nrm.setXYZ(i, nx, ny, nz);
    }
    g.setAttribute('normal', nrm);
    g.computeBoundingBox();
    g.computeBoundingSphere();
    return g;
  }

  init() {
    this.group = new THREE.Group();

    const loader = new THREE.TextureLoader();
    const rockTex = loader.load(this.properties.texturePath);
    rockTex.colorSpace = THREE.SRGBColorSpace;
    rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
    rockTex.repeat.set(2.0, 2.0);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.properties.diffuseColor),
      map: rockTex,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
      transparent: this.properties.transparency < 1.0,
      opacity: this.properties.transparency
    });
    this.material = material;

    const R = this.cubeSize * 0.16;  
    const centers = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3( R*0.9,  R*0.1,  R*0.4),
      new THREE.Vector3(-R*0.7,  0,      R*0.6),
      new THREE.Vector3( R*0.2,  R*0.5, -R*0.7),
      new THREE.Vector3(-R*0.6, -R*0.2, -R*0.5),
      new THREE.Vector3( R*0.9, -R*0.4, -R*0.2),
      new THREE.Vector3(-R*0.8,  R*0.4,  0),
      new THREE.Vector3( 0.4*R,  -R*0.7,  R*0.6)
    ].slice(0, this.properties.partsCount);

    centers.forEach((c, idx) => {
      const base = R * (1.15 - 0.12 * (idx % 3)); 
      const ico = new THREE.IcosahedronGeometry(base, this.properties.detail);
      const perturbed = this._perturbGeometry(ico, base * this.properties.noiseAmplitude);

      const mesh = new THREE.Mesh(perturbed, material);
      mesh.rotation.set(0.6*idx, 1.1*idx + 0.2, 0.3*idx);
      mesh.position.copy(c);

      mesh.castShadow = mesh.receiveShadow = true;
      this.parts.push(mesh);
      this.group.add(mesh);
    });

    if (this.properties.scale !== 1.0) {
      this.group.scale.setScalar(this.properties.scale);
    }

    this._fitToCubeAndPlace();
    this.app.scene.add(this.group);
  }

  _fitToCubeAndPlace() {
    const sandHeight = this.cubeSize / 10;
    if (!this.group) return;

    this.group.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(this.group);
    const originalHeight = Math.max(1e-6, bbox.max.y - bbox.min.y);

    const targetHeight = this.cubeSize * this.properties.heightRatio;
    const scale = targetHeight / originalHeight;
    this.group.scale.multiplyScalar(scale);

    this.group.updateMatrixWorld(true);
    const bbox2 = new THREE.Box3().setFromObject(this.group);
    const baseY = -this.cubeSize / 1.8 + sandHeight;
    const posY = baseY - bbox2.min.y;

    const posX = this.cubeSize * this.properties.xzOffsetRatio.x;
    const posZ = this.cubeSize * this.properties.xzOffsetRatio.z;

    this.group.position.set(posX, posY, posZ);
  }

  updateMaterial() {
    if (!this.group) return;
    this.group.traverse(o => {
      if (o.isMesh && o.material) {
        o.material.color.set(this.properties.diffuseColor);
        o.material.opacity = this.properties.transparency;
        o.material.transparent = this.properties.transparency < 1.0;
        o.material.needsUpdate = true;
      }
    });
  }

  updateScale() {
    if (!this.group) return;
    this.group.scale.setScalar(this.properties.scale);
    this.group.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(this.group);
    const baseY = -this.cubeSize / 2 + this.cubeSize / 10;
    const dy = baseY - bbox.min.y;
    this.group.position.y += dy;
  }

  getProperties() { return this.properties; }


 setWireframeAll(value) {
    if (!this.group) return;
    this.group.traverse(o => {
      if (o.isMesh && o.material) {
        o.material.wireframe = value;
        o.material.needsUpdate = true;
      }
    });
  }

  dispose() {
    if (!this.group) return;
    this.app.scene.remove(this.group);
    this.group.traverse(o => {
      if (o.isMesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
    this.group = null;
    this.parts = [];
  }
}

export { MyRocks };
