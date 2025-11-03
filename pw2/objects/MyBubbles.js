

import * as THREE from 'three';

class MyBubbles {
  constructor(app, cubeSize, opts = {}) {
    this.app = app;
    this.cubeSize = cubeSize;
    this.group = new THREE.Group();
    this.bubbles = [];
    this._lastTime = performance.now();

    this.props = Object.assign({
      spawnRangeXZ: this.cubeSize * 0.25,
      spawnPerSecond: 7,               
      radiusMin: this.cubeSize * 0.01, 
      radiusMax: this.cubeSize * 0.028,
      speedMin:  this.cubeSize * 0.20,  
      speedMax:  this.cubeSize * 0.35,
      color: '#7fc9ff',
      opacity: 0.25,                    
      animateScale: true
    }, opts);

    // limites do aquário
    this.sandHeight = this.cubeSize / 10;
    this.bottomY = -this.cubeSize / 2 + this.sandHeight + this.cubeSize * 0.01;
    this.topY    =  this.cubeSize / 2 - this.cubeSize * 0.02;

    this.baseGeo = new THREE.SphereGeometry(0.4, 16, 12); 
    this.baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.props.color),
      transparent: true,
      opacity: this.props.opacity,
      roughness: 0.2,  
      metalness: 0.0,
      emissive: new THREE.Color(0x16394a), 
      emissiveIntensity: 0.15
    });
  }

  init() {
    this.app.scene.add(this.group);
  }

  // cria 1 bolha
  spawnBubble() {
    const r = THREE.MathUtils.lerp(this.props.radiusMin, this.props.radiusMax, Math.random());
    const x = (Math.random() * 2 - 1) * this.props.spawnRangeXZ;
    const z = (Math.random() * 2 - 1) * this.props.spawnRangeXZ;

    const mesh = new THREE.Mesh(this.baseGeo, this.baseMat.clone());
    mesh.scale.setScalar(r);                
    mesh.position.set(x, this.bottomY, z);
    mesh.castShadow = false;
    mesh.receiveShadow = false;

    const speed = THREE.MathUtils.lerp(this.props.speedMin, this.props.speedMax, Math.random());
    const driftX = (Math.random() * 2 - 1) * this.cubeSize * 0.02;
    const driftZ = (Math.random() * 2 - 1) * this.cubeSize * 0.02;

    this.group.add(mesh);
    this.bubbles.push({ mesh, r, speed, driftX, driftZ, t: 0 });
  }

  spawnRandom(dt) {
    const expected = this.props.spawnPerSecond * dt;
    let n = Math.floor(expected);
    if (Math.random() < (expected - n)) n += 1;
    for (let i = 0; i < n; i++) this.spawnBubble();
  }

  update() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this._lastTime) / 1000); 
    this._lastTime = now;

    this.spawnRandom(dt);

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.t += dt;

      const m = b.mesh;
      m.position.y += b.speed * dt;
      m.position.x += Math.sin(b.t * 1.7) * b.driftX * dt;
      m.position.z += Math.cos(b.t * 1.3) * b.driftZ * dt;

      if (this.props.animateScale) {
        const s = (0.98 + 0.04 * Math.sin(b.t * 6.0));
        m.scale.setScalar(b.r * s);
      }

      const fadeStart = this.topY - this.cubeSize * 0.08;
      if (m.position.y > fadeStart) {
        const k = THREE.MathUtils.clamp((this.topY - m.position.y) / (this.topY - fadeStart), 0, 1);
        m.material.opacity = this.props.opacity * k;
      } else {
        m.material.opacity = this.props.opacity;
      }

      if (m.position.y >= this.topY) {
        this.group.remove(m);
        m.geometry = null; 
        m.material.dispose();
        this.bubbles.splice(i, 1);
      }
    }
  }

  dispose() {
    if (!this.group) return;
    this.app.scene.remove(this.group);
    this.bubbles.forEach(b => { b.mesh.material.dispose(); });
    this.bubbles.length = 0;
    this.group = null;
  }
}

export { MyBubbles };
