import * as THREE from 'three';

class MySeaStar {
  constructor(app, cubeSize, opts = {}) {
    this.app = app;
    this.cubeSize = cubeSize;
    this.group = new THREE.Group();

    this.options = Object.assign({
      arms: 5,
      armLength: cubeSize * 0.28,
      armBaseRadius: cubeSize * 0.035,
      armTipRadius:  cubeSize * 0.008,
      thickness: 0.28,
      segmentsPerArm: 10,
      curveUp: cubeSize * 0.025,
      twist: 0.15,
      startInset: 0.55,
      baseColor: '#f6b149',
      edgeTint:  '#f6c970',
      roughness: 0.95,
      metalness: 0.0
    }, opts);
  }

  init(position = new THREE.Vector3(0, 0, 0)) {
    const o = this.options;

    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(o.baseColor),
      roughness: o.roughness,
      metalness: o.metalness,
      flatShading: true
    });

    const bodyRadius = o.armBaseRadius * 1.6;
    const bodyGeo = new THREE.SphereGeometry(bodyRadius, 24, 16);
    bodyGeo.scale(1, o.thickness, 1);
    const body = new THREE.Mesh(bodyGeo, baseMat.clone());
    body.castShadow = body.receiveShadow = true;
    this.group.add(body);

    const stepAngle = (Math.PI * 2) / o.arms;

    for (let a = 0; a < o.arms; a++) {
      const armG = new THREE.Group();
      armG.rotation.y = a * stepAngle;

      for (let i = 0; i < o.segmentsPerArm; i++) {
        const t0 = i / o.segmentsPerArm;
        const t1 = (i + 1) / o.segmentsPerArm;

        const r0 = THREE.MathUtils.lerp(o.armBaseRadius, o.armTipRadius, t0);
        const r1 = THREE.MathUtils.lerp(o.armBaseRadius, o.armTipRadius, t1);
        const len = o.armLength / o.segmentsPerArm;

        const segGeo = new THREE.CylinderGeometry(r1, r0, len, 12, 1, true);
        segGeo.rotateZ(Math.PI / 2);

        const mat = baseMat.clone();
        const tint = new THREE.Color(o.edgeTint);
        mat.color.lerp(tint, 0.12); 

        const seg = new THREE.Mesh(segGeo, mat);
        seg.castShadow = seg.receiveShadow = true;

        const midT = (t0 + t1) * 0.5;
        seg.position.x = bodyRadius * this.options.startInset + (i + 0.5) * len;
        seg.position.y = Math.sin(midT * Math.PI) * o.curveUp;

        seg.rotation.y = (midT - 0.5) * o.twist;
        seg.rotation.x = (midT - 0.5) * 0.08;

        armG.add(seg);
      }

      const joinGeo = new THREE.CylinderGeometry(o.armBaseRadius, bodyRadius * 0.7, bodyRadius * 0.5, 12, 1, true);
      joinGeo.rotateZ(Math.PI / 2);
      const join = new THREE.Mesh(joinGeo, baseMat.clone());
      join.castShadow = join.receiveShadow = true;
      join.position.x = bodyRadius * 0.6;
      armG.add(join);

      this.group.add(armG);
    }

    const baseY = -this.cubeSize / 2 + this.cubeSize / 10 + (bodyRadius * o.thickness) * 0.5;
    this.group.position.copy(position);
    this.group.position.y = baseY;

    // this.group.rotation.y = Math.random() * Math.PI * 2;
    this.group.rotation.y = 0;

    this.app.scene.add(this.group);
  }

  dispose() {
    if (!this.group) return;
    this.app.scene.remove(this.group);
    this.group.traverse(obj => {
      if (obj.isMesh) { obj.geometry.dispose(); obj.material.dispose(); }
    });
    this.group = null;
  }
}

export { MySeaStar };
