// MyTurtle.js
import * as THREE from 'three';

class MyTurtle {
  constructor(app, cubeSize) {
    this.app = app;
    this.cubeSize = cubeSize;
    this.group = new THREE.Group();
  }

  init() {
    this._buildGeometry();
    this.app.scene.add(this.group);

    const s = this.cubeSize;
    const bottom = -s / 2 + s / 10;
    const top = s / 2;
    this.group.position.set(5, -(bottom + top) * 0.005, 5); 
    this.group.scale.setScalar(s * 0.01);   
    
    this.group.rotation.z = -Math.PI * 0.08;   
    this.group.rotation.y =  Math.PI * 0.25;
  }

  _buildGeometry() {
    const s = this.cubeSize;
    const shellRadius = s * 0.16;

    const matShell = new THREE.MeshStandardMaterial({
        color: 0xc88f56,
        metalness: 0.1,
        roughness: 0.85,
        flatShading: true
    });

    const matBody = new THREE.MeshStandardMaterial({
        color: 0x6b8e23,
        metalness: 0.1,
        roughness: 0.9,
        flatShading: true
    });

    // CARAPAÇA alongada e achatada
    const shellGeo = new THREE.IcosahedronGeometry(shellRadius, 0);
    shellGeo.scale(1.6, 0.7, 1.2);               
    const shell = new THREE.Mesh(shellGeo, matShell);
    shell.rotation.y = Math.PI / 6;
    shell.position.set(0, 0, 0);
    shell.castShadow = shell.receiveShadow = true;
    this.group.add(shell);

    // BARRIGA por baixo (ligeiro volume castanho‑esverdeado)
    const bellyGeo = new THREE.CylinderGeometry(
        shellRadius * 0.6, shellRadius * 0.8, shellRadius * 0.5, 8
    );
    const belly = new THREE.Mesh(bellyGeo, matBody);
    belly.rotation.z = Math.PI / 2;
    belly.position.set(0, -shellRadius * 0.35, 0);
    belly.castShadow = belly.receiveShadow = true;
    this.group.add(belly);

    // PESCOÇO
    const neckGeo = new THREE.CylinderGeometry(
    shellRadius * 0.18, shellRadius * 0.22, shellRadius * 0.7, 6
    );
    const neck = new THREE.Mesh(neckGeo, matBody);
    neck.rotation.z = Math.PI / 2;                    // ao longo do X
    neck.position.set(shellRadius * 1.05, -shellRadius * 0.12, 0.0);
    this.group.add(neck);

    // CABEÇA
    const headGeo = new THREE.ConeGeometry(shellRadius * 0.30, shellRadius * 0.7, 7);
    const head = new THREE.Mesh(headGeo, matBody);
    head.rotation.z = -Math.PI / 2;                   // a apontar para +X
    head.position.set(shellRadius * 1.55, -shellRadius * 0.12, 0.0);
    this.group.add(head);

    // PATAS DIANTEIRAS – grandes “asas” triangulares
    const flipperFrontGeo = new THREE.CylinderGeometry(
        shellRadius * 0.10, shellRadius * 0.35, shellRadius * 1.3, 5
    );
    const flFrontL = new THREE.Mesh(flipperFrontGeo, matBody);
    flFrontL.rotation.z = -Math.PI / 3.0;
    flFrontL.rotation.y =  Math.PI / 8;
    flFrontL.position.set(shellRadius * 0.4, -shellRadius * 0.35, shellRadius * 0.95);
    this.group.add(flFrontL);

    const flFrontR = flFrontL.clone();
    flFrontR.rotation.y = -Math.PI / 8;
    flFrontR.position.z *= -1;
    this.group.add(flFrontR);

    // PATAS TRASEIRAS – menores e mais recuadas
    const flipperBackGeo = new THREE.CylinderGeometry(
        shellRadius * 0.08, shellRadius * 0.22, shellRadius * 0.9, 5
    );
    const flBackL = new THREE.Mesh(flipperBackGeo, matBody);
    flBackL.rotation.z = -Math.PI / 3.2;
    flBackL.rotation.y =  Math.PI / 10;
    flBackL.position.set(-shellRadius * 0.65, -shellRadius * 0.40, shellRadius * 0.80);
    this.group.add(flBackL);

    const flBackR = flBackL.clone();
    flBackR.rotation.y = -Math.PI / 10;
    flBackR.position.z *= -1;
    this.group.add(flBackR);

    // CAUDA pequena em V
    const tailGeo = new THREE.ConeGeometry(shellRadius * 0.10, shellRadius * 0.35, 5);
    const tail = new THREE.Mesh(tailGeo, matBody);
    tail.rotation.z = Math.PI / 2.3;
    tail.position.set(-shellRadius * 1.2, -shellRadius * 0.35, 0);
    this.group.add(tail);
    }


    update(delta, cubeSize) {
        this.group.rotation.y += delta * 0.1;
    }
}

export { MyTurtle };
