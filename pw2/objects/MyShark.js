import * as THREE from 'three';

export class MyShark {
  constructor(app, options = {}) {
    this.app = app;
    this.divisions = options.divisions || 200;
    this.showCurves = options.showCurves ?? false;

    // Geometria ajustada estilo tubarão
    this.curveData = {
      top: [
        [0, 0],
        [2, 3],
        [9, 6],
        [16, 3],
        [22, 0],
      ],
      bottom: [
        [0, 0],
        [2, -1.2],
        [9, -1.6],
        [14, -1.2],
        [20, -0.7],
        [22, 0],
      ],
      side: [
        [0, 0, 0],
        [2, 0, 0.3],
        [7, -0.6, 1.6],
        [16, 0, 0.65],
        [22, 0, 0.10],
      ],
      tail: [
        [23, -2.2],
        [26, -4],
        [25.2, 0],
        [26, 4],
        [23, 2.2],
        [22, 0],
      ],
      fins: {
        dorsal: [
            [11, 3.0],   
            [12, 9.5],   
            [11.2, 9.0], 
            [10.2, 5.5], 
            [10.8, 3.2], 
        ],
        rectal: [
          [15, -2], [17.5, -4.3], [18.5, -2.1],
        ],
        pelvic: [
          [7, -1.4], [8.8, -3.8], [10, -2.2],
        ],
      },
    };

    this.properties = {
      color: options.color || "#7a878e",
      swimSpeed: options.swimSpeed ?? 1.1,
      turnSmoothness: options.turnSmoothness ?? 0.04,
      swimAmplitude: options.swimAmplitude ?? 0.18,
    };

    this.fishGroup = new THREE.Group();
    if (this.showCurves) {
      this.curvesGroup = new THREE.Group();
      this.fishGroup.add(this.curvesGroup);
    }
    this.mesh = null;
    this.velocity = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(2),
      THREE.MathUtils.randFloatSpread(1),
      THREE.MathUtils.randFloatSpread(2)
    );
    if (this.velocity.length() > 0) this.velocity.normalize();
    else this.velocity.set(1, 0, 0);
    this.phase = Math.random() * Math.PI * 2;
  }

  init() {
    this._createFish();
    this.app.scene.add(this.fishGroup);
  }

    createSharks() {
        const numSharks = 2;
        const s = this.cubeSize;
        for (let i = 0; i < numSharks; i++) {
            const shark = new MyShark(this.app, {showCurves: false, swimSpeed: 1.1});
            shark.init();
            shark.fishGroup.position.x = THREE.MathUtils.randFloat(-s*0.5, s*0.5);
            shark.fishGroup.position.y = THREE.MathUtils.randFloat(-s*0.2, s*0.3);
            shark.fishGroup.position.z = THREE.MathUtils.randFloat(-s*0.5, s*0.5);
            shark.fishGroup.scale.setScalar(0.040 * s);
            this.sharks.push(shark);
        }
    }

  _createFish() {
      const { top, bottom, side, tail, fins } = this.curveData;
  
      const topPts = this._createCurve(top).getSpacedPoints(100);
      const bottomPts = this._createCurve(bottom).getSpacedPoints(100);
      const sidePts = this._createCurve(side).getSpacedPoints(100);
  
      if (this.showCurves) {
        this._showCurve(topPts, 0x00ffff);
        this._showCurve(bottomPts, 0xffffff);
        this._showCurve(sidePts, 0xffff00);
      }
  
      const frames = this._computeFrames(topPts, bottomPts, sidePts);
      const bodyGeometry = this._buildBodyGeometry(frames, tail);
  
      const texture = new THREE.TextureLoader().load('textures/fish2.jpg');
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 1);
      texture.flipY = true;
      texture.colorSpace = THREE.SRGBColorSpace;
  
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
  
      this.mesh = new THREE.Mesh(bodyGeometry, material);
      this.fishGroup.add(this.mesh);
  
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
  
      const dorsalFin = this._createFin(topPts, this._createCurve(fins.dorsal), true);
      //const rectFin = this._createFin(bottomPts, this._createCurve(fins.rectal), false);
      const pelvicFin = this._createFin(bottomPts, this._createCurve(fins.pelvic), false);
  
      this.fishGroup.add(new THREE.Mesh(dorsalFin, material));
      //this.fishGroup.add(new THREE.Mesh(rectFin, material));
      this.fishGroup.add(new THREE.Mesh(pelvicFin, material));
    }
  
    _computeFrames(top, bottom, side) {
      const frames = [];
      const step = 0.05;
  
      frames.push(Array(this.divisions + 1).fill(0).map(() => new THREE.Vector3()));
      for (let x = step; x < 10; x += step) frames.push(this._getFrame(x, top, bottom, side));
      frames.push(this._getFramePoints(top[100], bottom[100], side[100]));
      return frames;
    }
  
    _getFrame(x, top, bottom, side) {
      const t = this._getPoint(top, x);
      const b = this._getPoint(bottom, x);
      const s = this._getPoint(side, x);
      return this._getFramePoints(t, b, s);
    }
  
    _getFramePoints(top, bottom, side) {
      const left = side.clone().setZ(-side.z);
      const curve = new THREE.CatmullRomCurve3([bottom, side, top, left], true);
      return curve.getSpacedPoints(this.divisions);
    }
  
    _buildBodyGeometry(frames, tailPointsData) {
      const tailCurve = this._createCurve(tailPointsData);
      const tailPoints = tailCurve.getPoints(this.divisions / 2);
      const mirroredTail = [...tailPoints].reverse().slice(1);
      const fullTail = tailPoints.concat(mirroredTail);
  
      if (this.showCurves)
        this._showCurve(fullTail, 0xff00ff);
  
      const tailSlices = 5;
      const tailStep = 1 / tailSlices;
      const pts = [];
  
      const vTemp = new THREE.Vector3();
      frames.forEach(frame => frame.forEach(p => pts.push(p.x, p.y, p.z)));
  
      for (let i = 1; i <= tailSlices; i++) {
        const ratio = i * tailStep;
        frames.at(-1).forEach((p, idx) => {
          vTemp.lerpVectors(p, fullTail[idx], ratio);
          pts.push(vTemp.x, vTemp.y, vTemp.z);
        });
      }
  
      const geom = new THREE.PlaneGeometry(1, 1, this.divisions, frames.length + tailSlices - 1);
      geom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

        const uvs = [];
        const wSegments = this.divisions;
        const hSegments = frames.length + tailSlices - 1;

        for (let iy = 0; iy <= hSegments; iy++) {
        const v = iy / hSegments;
        for (let ix = 0; ix <= wSegments; ix++) {
            const u = ix / wSegments * 2; 
            uvs.push(u, v);
        }
        }

        geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

      geom.computeVertexNormals();
      return geom;
    }
  
    _createFin(basePoints, contourCurve, isTop) {
      const contour = contourCurve.getSpacedPoints(60);
      const shift = 0.05 * (isTop ? 1 : -1);
      const offset = new THREE.Vector3(0, -shift, 0);
  
      const basePts = contour.map(p => this._getPoint(basePoints, p.x).add(offset));
      const mirroredBase = basePts.map(p => p.clone()).reverse().slice(1);
      const mirroredContour = contour.map(p => p.clone()).reverse().slice(1);
  
      basePts.forEach((p, i, arr) => { if (i && i < arr.length - 1) p.z = shift; });
      mirroredBase.forEach((p, i, arr) => { if (i < arr.length - 1) p.z = -shift; });
  
      const allPts = [...contour, ...mirroredContour, ...basePts, ...mirroredBase];
      const geom = new THREE.PlaneGeometry(1, 1, (contour.length - 1) * 2, 1);
      geom.setAttribute('position', new THREE.Float32BufferAttribute(allPts.flatMap(p => [p.x, p.y, p.z]), 3));
      geom.computeVertexNormals();
      return geom;
    }
  
    _createCurve(points) {
      return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    }
  
    _getPoint(points, x) {
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i], b = points[i + 1];
        if (x >= a.x && x <= b.x) return new THREE.Vector3().lerpVectors(a, b, (x - a.x) / (b.x - a.x));
      }
      return points.at(-1).clone();
    }
  
    _showCurve(points, color) {
      if (!this.curvesGroup) return;
      const g = new THREE.BufferGeometry().setFromPoints(points);
      const m = new THREE.LineBasicMaterial({ color });
      this.curvesGroup.add(new THREE.Line(g, m));
    }
  
    setPosition(x, y, z) { this.fishGroup.position.set(x, y, z); }
    setRotation(x, y, z) { this.fishGroup.rotation.set(x, y, z); }
    setScale(s) { this.fishGroup.scale.setScalar(s); }
  
    dispose() {
      if (this.mesh) {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
      }
      this.app.scene.remove(this.fishGroup);
    }
  
    update(delta, cubeSize) {
      if (!this.fishGroup) return;
  
      const dt = (delta && delta > 0 && delta < 1) ? delta : 0.016;
      
      const s = cubeSize;
      const speed = this.properties.swimSpeed * 5; 
  
      // MOVIMENTO: Move o peixe baseado na velocidade
      this.fishGroup.position.x += this.velocity.x * speed * dt;
      this.fishGroup.position.y += this.velocity.y * speed * dt * 0.5;
      this.fishGroup.position.z += this.velocity.z * speed * dt;
  
      const pos = this.fishGroup.position;
      const limit = s * 0.45;
  
      if (pos.x > limit || pos.x < -limit) {
        pos.x = THREE.MathUtils.clamp(pos.x, -limit, limit);
        this.velocity.x *= -1;
      }
      
      if (pos.z > limit || pos.z < -limit) {
        pos.z = THREE.MathUtils.clamp(pos.z, -limit, limit);
        this.velocity.z *= -1;
      }
  
      const top = s * 0.35;
      const bottom = -s * 0.35;
  
      if (pos.y > top || pos.y < bottom) {
        pos.y = THREE.MathUtils.clamp(pos.y, bottom, top);
        this.velocity.y *= -1;
      }
  
      const targetRotY = Math.atan2(this.velocity.z, -this.velocity.x);
      const currentRotY = this.fishGroup.rotation.y;
      
      let diff = targetRotY - currentRotY;
      
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      
      this.fishGroup.rotation.y += diff * this.properties.turnSmoothness;
      
      const t = performance.now() * 0.001;

      this.fishGroup.rotation.y += Math.sin(t * 6 + this.phase) * this.properties.swimAmplitude * 0.1;
      this.fishGroup.rotation.z = Math.sin(t * 3 + this.phase) * this.properties.swimAmplitude * 0.03;


      //if (this.mesh) {
        //const t = performance.now() * 0.001;
        //this.mesh.rotation.y = Math.sin(t * 6) * 0.15;
        //this.mesh.rotation.z = Math.sin(t * 3) * 0.05;
      //}
    }
}


export default MyShark;