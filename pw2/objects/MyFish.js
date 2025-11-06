import * as THREE from 'three';
//import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class MyFish {
  constructor(app, options = {}) {
    this.app = app;
    this.divisions = options.divisions || 200;
    this.showCurves = options.showCurves ?? true;

    // Curve control points
    this.curveData = {
      top: [
        [0, 0],
        [1, 2],
        [5, 5],
        [10, 0],
      ],
      bottom: [
        [0, 0],
        [0.1, -0.15],
        [0.5, -0.35],
        [4.5, -1],
        [8, -0.6],
        [9.5, -0.45],
        [10, -0.5],
      ],
      side: [
        [0, 0, 0],
        [0.1, 0, 0.125],
        [1, 0, 0.375],
        [4, -0.25, 0.6],
        [8, 0, 0.25],
        [10, 0, 0.05],
      ],
      tail: [
        [11, -1],
        [12.5, -1.5],
        [12, 0],
        [12.5, 1.5],
        [11, 1],
        [10, 0]
      ],
      fins: {
        dorsal: [
          [7, 2],
          [7, 5],
          [6, 5.3],
          [4.9, 4.9],
          [4.7, 4.7],
        ],
        rectal: [
          [6, -0.9],
          [7.25, -1.5],
          [7.5, -0.75],
        ],
        pelvic: [
          [2.25, -0.7],
          [3.75, -2],
          [4, -1],
        ],
      },
    };

    // Material + other properties
    this.properties = {
      color: options.color || "#f88f8f",
    };

    this.fishGroup = new THREE.Group();
    if (this.showCurves) {
      this.curvesGroup = new THREE.Group();
      this.fishGroup.add(this.curvesGroup);
    }

    this.mesh = null;
  }

  init() {
    this._createFish();
    this.app.scene.add(this.fishGroup);
  }

  _createFish() {
    const { top, bottom, side, tail, fins } = this.curveData;

    // Curves
    const topPts = this._createCurve(top).getSpacedPoints(100);
    const bottomPts = this._createCurve(bottom).getSpacedPoints(100);
    const sidePts = this._createCurve(side).getSpacedPoints(100);

    if (this.showCurves) {
      this._showCurve(topPts, 0x00ffff);
      this._showCurve(bottomPts, 0xffffff);
      this._showCurve(sidePts, 0xffff00);
    }

    // Body frames and geometry
    const frames = this._computeFrames(topPts, bottomPts, sidePts);
    const bodyGeometry = this._buildBodyGeometry(frames, tail);

    // Material
    const texture = new THREE.TextureLoader().load('textures/fish.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1); // stretch along body
    texture.flipY = true;
    texture.colorSpace = THREE.SRGBColorSpace

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(bodyGeometry, material);
    this.fishGroup.add(this.mesh);

    // Fins
    const dorsalFin = this._createFin(topPts, this._createCurve(fins.dorsal), true);
    const rectFin = this._createFin(bottomPts, this._createCurve(fins.rectal), false);
    const pelvicFin = this._createFin(bottomPts, this._createCurve(fins.pelvic), false);

    this.fishGroup.add(new THREE.Mesh(dorsalFin, material));
    this.fishGroup.add(new THREE.Mesh(rectFin, material));
    this.fishGroup.add(new THREE.Mesh(pelvicFin, material));
  }

  // Construction of the Fish body

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
    geom.computeVertexNormals();
    return geom;
  }

  // Fins

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

  // Utilities

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

  // Transformations

  setPosition(x, y, z) { this.fishGroup.position.set(x, y, z); }
  setRotation(x, y, z) { this.fishGroup.rotation.set(x, y, z); }
  setScale(s) { this.fishGroup.scale.setScalar(s); }

  // Cleanup/ dispose of the Fish
  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.app.scene.remove(this.fishGroup);
  }
}
