import * as THREE from 'three';

class MySeaStar {
  constructor(app, cubeSize, opts = {}) {
    this.app = app;
    this.cubeSize = cubeSize;
    this.group = new THREE.Group();

    this.options = Object.assign({
      arms: 5,
      armLength: cubeSize * 0.10,
      armBaseRadius: cubeSize * 0.040,
      armTipRadius: cubeSize * 0.004,
      thickness: 0.18,
      segmentsPerArm: 10,
      curveUp: cubeSize * 0.01,
      twist: 0.06,
      startInset: 0.35,
      baseColor: '#f6b149',
      edgeTint: '#f6c970',
      roughness: 0.95,
      metalness: 0.0
    }, opts);

    this.driftPhase = Math.random() * Math.PI * 2;
    this.walkSpeed = cubeSize * 0.5;   
  }

  init(position = new THREE.Vector3(0, 0, 0)) {
    const o = this.options;

    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(o.baseColor),
      roughness: o.roughness,
      metalness: o.metalness,
      flatShading: false
    });

    const bodyRadius = o.armBaseRadius * 0.7;
    const bodyGeo = new THREE.SphereGeometry(bodyRadius, 32, 24);
    bodyGeo.scale(1, o.thickness, 1);
    const body = new THREE.Mesh(bodyGeo, baseMat.clone());
    body.castShadow = body.receiveShadow = true;
    this.group.add(body);

    const stepAngle = (Math.PI * 2) / o.arms;

    for (let a = 0; a < o.arms; a++) {
      const armG = new THREE.Group();
      armG.rotation.y = a * stepAngle;

      const segLength = o.armLength / o.segmentsPerArm;
      const geoLength = segLength * 1.15;   
      const step = segLength * 0.7;         
      const baseOffset = bodyRadius * o.startInset;

      for (let i = 0; i < o.segmentsPerArm; i++) {
        const t0 = i / o.segmentsPerArm;
        const t1 = (i + 1) / o.segmentsPerArm;
        const midT = (t0 + t1) * 0.5;

        const r0 = THREE.MathUtils.lerp(o.armBaseRadius, o.armTipRadius, t0);
        const r1 = THREE.MathUtils.lerp(o.armBaseRadius * 0.7, o.armTipRadius * 0.2, t1);

        const segGeo = new THREE.CylinderGeometry(r1, r0, geoLength, 16, 1, false);
        segGeo.rotateZ(Math.PI / 2);
        segGeo.scale(1, o.thickness * 0.6, 0.55);

        const mat = baseMat.clone();
        const tint = new THREE.Color(o.edgeTint);
        mat.color.lerp(tint, 0.18);

        const seg = new THREE.Mesh(segGeo, mat);
        seg.castShadow = seg.receiveShadow = true;

        // posição com overlap
        seg.position.x = baseOffset + i * step + geoLength * 0.5;
        seg.position.y = Math.sin(midT * Math.PI) * o.curveUp;

        seg.rotation.y = (midT - 0.5) * o.twist;
        seg.rotation.x = (midT - 0.5) * 0.10;

        armG.add(seg);
      }

      const joinGeo = new THREE.CylinderGeometry(
        o.armBaseRadius * 0.95,
        bodyRadius * 0.7,
        bodyRadius * 0.5,
        16,
        1,
        false
      );
      joinGeo.rotateZ(Math.PI / 2);
      joinGeo.scale(1, o.thickness * 0.6, 0.6);

      const join = new THREE.Mesh(joinGeo, baseMat.clone());
      join.castShadow = join.receiveShadow = true;
      join.position.x = bodyRadius * 0.55;
      armG.add(join);

      this.group.add(armG);
    }

    const baseY =
      -this.cubeSize / 2 +
      this.cubeSize / 10 +
      (bodyRadius * o.thickness) * 0.5;

    this.group.position.copy(position);
    this.group.position.y = baseY + 0.1;
    this.group.rotation.y = 0;

    this.app.scene.add(this.group);
  }

  update(delta) {
    if (!this.group) return;

    const t = performance.now() * 0.0006;  

    this.group.rotation.y += 0.12 * delta;

    const moveSpeed = this.walkSpeed;
    this.group.position.x += Math.cos(t + this.driftPhase) * moveSpeed * delta;
    this.group.position.z += Math.sin(t * 0.9 + this.driftPhase) * moveSpeed * delta;

    const limit = this.cubeSize * 0.45;
    this.group.position.x = THREE.MathUtils.clamp(this.group.position.x, -limit, limit);
    this.group.position.z = THREE.MathUtils.clamp(this.group.position.z, -limit, limit);

    let armIndex = 0;
    this.group.children.forEach(child => {
      if (child.type === 'Group') {
        const phase = t * 2.4 + armIndex * 0.7;
        child.rotation.z = Math.sin(phase) * 0.20;
        armIndex++;
      }
    });
  }

  dispose() {
    if (!this.group) return;
    this.app.scene.remove(this.group);
    this.group.traverse(obj => {
      if (obj.isMesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
    this.group = null;
  }
}

export { MySeaStar };
