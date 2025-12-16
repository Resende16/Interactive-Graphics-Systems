// MyTurtle.js
import * as THREE from 'three';

class MyTurtle {
  constructor(app, cubeSize) {
    this.app = app;
    this.cubeSize = cubeSize;
    this.group = new THREE.Group();

    this.speed = 0.15;                            
    this.direction = new THREE.Vector3(1, 0.5, 0.3).normalize(); 
    this.bounds = cubeSize * 0.45; 
  }

  init() {
    this._buildGeometry();
    this.app.scene.add(this.group);

    const s = this.cubeSize;
    this.group.position.set(5, -5.5, 5);
    this.group.scale.setScalar(s * 0.05); 
    
    const targetPos = this.group.position.clone().add(this.direction);
    this.group.lookAt(targetPos);
  }

  _buildGeometry() {
    const shellRadius = 1; 

    const textureLoader = new THREE.TextureLoader();
    const shellTexture = textureLoader.load('textures/turtle.jpg');
    shellTexture.wrapS = THREE.RepeatWrapping;
    shellTexture.wrapT = THREE.RepeatWrapping;

    const matShell = new THREE.MeshStandardMaterial({
        map: shellTexture,
        metalness: 0.1,
        roughness: 0.85,
        flatShading: true,
    });

    const matBody = new THREE.MeshStandardMaterial({
        color: 0x385233,
        metalness: 0.1,
        roughness: 0.9,
        flatShading: true
    });

    const shellGeo = new THREE.IcosahedronGeometry(shellRadius, 0);
    shellGeo.scale(1.6, 0.7, 1.2);               
    const shell = new THREE.Mesh(shellGeo, matShell);
    shell.position.set(0, 0, 0);
    shell.castShadow = shell.receiveShadow = true;
    this.group.add(shell);

    const bellyGeo = new THREE.SphereGeometry(shellRadius * 0.85, 8, 6);
    bellyGeo.scale(1.4, 0.4, 1.0);
    const belly = new THREE.Mesh(bellyGeo, matBody);
    belly.position.set(0, -shellRadius * 0.45, 0);  
    belly.castShadow = belly.receiveShadow = true;
    this.group.add(belly);

    const neckGeo = new THREE.CylinderGeometry(
        shellRadius * 0.25, shellRadius * 0.28, shellRadius * 0.5, 8
    );
    const neck = new THREE.Mesh(neckGeo, matBody);
    neck.rotation.z = Math.PI / 2;
    neck.position.set(shellRadius * 0.95, -shellRadius * 0.25, 0); 
    this.group.add(neck);

    const headGeo = new THREE.SphereGeometry(shellRadius * 0.32, 8, 8);
    headGeo.scale(1.3, 0.9, 0.9);
    const head = new THREE.Mesh(headGeo, matBody);
    head.position.set(shellRadius * 1.45, -shellRadius * 0.25, 0);  
    this.group.add(head);

    const snoutGeo = new THREE.ConeGeometry(shellRadius * 0.12, shellRadius * 0.25, 6);
    const snout = new THREE.Mesh(snoutGeo, matBody);
    snout.rotation.z = -Math.PI / 2;
    snout.position.set(shellRadius * 1.70, -shellRadius * 0.25, 0);  
    this.group.add(snout);

    const flipperFrontShape = new THREE.Shape();
    flipperFrontShape.moveTo(0, 0);
    flipperFrontShape.lineTo(shellRadius * 0.15, shellRadius * 0.6);
    flipperFrontShape.lineTo(shellRadius * 0.45, shellRadius * 0.55);
    flipperFrontShape.lineTo(shellRadius * 0.25, 0);
    flipperFrontShape.lineTo(0, 0);
    
    const flipperFrontGeo = new THREE.ExtrudeGeometry(flipperFrontShape, {
        depth: shellRadius * 0.15,
        bevelEnabled: true,
        bevelThickness: shellRadius * 0.02,
        bevelSize: shellRadius * 0.02,
        bevelSegments: 2
    });
    
    const flFrontL = new THREE.Mesh(flipperFrontGeo, matBody);
    flFrontL.rotation.x = Math.PI / 2.2;
    flFrontL.rotation.y = -Math.PI / 16;
    flFrontL.rotation.z = Math.PI / 6;
    flFrontL.position.set(shellRadius * 0.35, -shellRadius * 0.38, shellRadius * 0.72);
    this.group.add(flFrontL);

    const flFrontR = new THREE.Mesh(flipperFrontGeo, matBody);
    flFrontR.rotation.x = -Math.PI / 2.2;
    flFrontR.rotation.y = -Math.PI / 16;
    flFrontR.rotation.z = -Math.PI / 6;
    flFrontR.position.set(shellRadius * 0.35, -shellRadius * 0.38, -shellRadius * 0.72);
    this.group.add(flFrontR);

    const flipperBackShape = new THREE.Shape();
    flipperBackShape.moveTo(0, 0);
    flipperBackShape.lineTo(shellRadius * 0.12, shellRadius * 0.45);
    flipperBackShape.lineTo(shellRadius * 0.32, shellRadius * 0.40);
    flipperBackShape.lineTo(shellRadius * 0.20, 0);
    flipperBackShape.lineTo(0, 0);
    
    const flipperBackGeo = new THREE.ExtrudeGeometry(flipperBackShape, {
        depth: shellRadius * 0.12,
        bevelEnabled: true,
        bevelThickness: shellRadius * 0.02,
        bevelSize: shellRadius * 0.02,
        bevelSegments: 2
    });
    
    const flBackL = new THREE.Mesh(flipperBackGeo, matBody);
    flBackL.rotation.x = Math.PI / 2.5;
    flBackL.rotation.y = Math.PI / 20;
    flBackL.rotation.z = Math.PI / 4;
    flBackL.position.set(-shellRadius * 0.55, -shellRadius * 0.40, shellRadius * 0.62);
    this.group.add(flBackL);

    const flBackR = new THREE.Mesh(flipperBackGeo, matBody);
    flBackR.rotation.x = -Math.PI / 2.5;
    flBackR.rotation.y = Math.PI / 20;
    flBackR.rotation.z = -Math.PI / 4;
    flBackR.position.set(-shellRadius * 0.55, -shellRadius * 0.40, -shellRadius * 0.62);
    this.group.add(flBackR);

    const tailGeo = new THREE.ConeGeometry(shellRadius * 0.12, shellRadius * 0.40, 6);
    tailGeo.scale(1.0, 1.0, 0.6);
    const tail = new THREE.Mesh(tailGeo, matBody);
    tail.rotation.z = Math.PI / 2;
    tail.rotation.y = Math.PI / 2;
    tail.position.set(-shellRadius * 1.15, -shellRadius * 0.40, 0);
    this.group.add(tail);
  }

  update(delta) {
    const moveStep = this.speed * delta;
    const forward = this.direction.clone().normalize();
    
    this.group.position.addScaledVector(forward, moveStep);

    const b = this.bounds;
    const p = this.group.position;

    if (p.x > b || p.x < -b) {
      this.direction.x *= -1;
      p.x = Math.max(-b, Math.min(b, p.x));
    }

    if (p.y > b || p.y < -b) {
      this.direction.y *= -1;
      p.y = Math.max(-b, Math.min(b, p.y));
    }

    if (p.z > b || p.z < -b) {
      this.direction.z *= -1;
      p.z = Math.max(-b, Math.min(b, p.z));
    }

    const targetPos = this.group.position.clone().add(this.direction);
    this.group.lookAt(targetPos);
  }
}

export { MyTurtle };