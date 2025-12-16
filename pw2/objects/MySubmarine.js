// MySubmarine.js
import * as THREE from 'three';

class MySubmarine {
    constructor(app, cubeSize) {
        this.app = app;
        this.cubeSize = cubeSize;

        this.group = new THREE.Group();

        // movimento
        this.speed = cubeSize * 0.10;
        this.turnSpeed = 1.4;
        this.keys = new Set();

        // luz 
        this.headlight = null;

        this._lastTime = performance.now();

        // keyboard bindings
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
    }

    init() {
        this._buildGeometry();
        this.app.scene.add(this.group);

        // posição inicial
        const bottom = -this.cubeSize / 2 + this.cubeSize / 10;
        const top = this.cubeSize / 2;
        this.group.position.set(0, (bottom + top) * 0.55, 0);

        // eventos teclado
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);

    }

    _buildGeometry() {
        const s = this.cubeSize;

        const radius = s * 0.03;
        const bodyLength = s * 0.20;

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x6b635b,
            roughness: 0.45,
            metalness: 0.15
        });

        const periscopeMat = new THREE.MeshStandardMaterial({
            color: 0xb1adaa,
            roughness: 0.7,
            metalness: 0.05
        });

        const bodyGeo = new THREE.CylinderGeometry(radius, radius, bodyLength, 48, 1, true);
        bodyGeo.rotateZ(Math.PI / 2);

        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = body.receiveShadow = true;
        this.group.add(body);

        // parte da frente
        const rearGeo = new THREE.SphereGeometry(radius * 1, 32, 16);
        const rear = new THREE.Mesh(rearGeo, bodyMat);
        rear.position.z = bodyLength * 0;
        rear.position.x = bodyLength * -0.5;
        this.group.add(rear);

        // parte de trás
        const coneGeo = new THREE.ConeGeometry(radius, radius * 1.4, 48);
        const cone = new THREE.Mesh(coneGeo, bodyMat);
        cone.rotation.z = Math.PI / 2;
        cone.position.z = -bodyLength * 0;
        rear.position.x = bodyLength * - 0.5;
        cone.position.x = -bodyLength * 0.59;

        const noseGeo = new THREE.SphereGeometry(radius * 0.75, 32, 16);
        const nose = new THREE.Mesh(noseGeo, bodyMat);
        nose.position.z = -bodyLength * 0;
        nose.position.x = -bodyLength * 0.59;
        rear.position.x = bodyLength * 0.5;

        this.group.add(cone);
        this.group.add(nose);

        // parte de cima

        const towerGeo = new THREE.BoxGeometry(radius * 1.2, radius * 1, radius * 1.1);
        const tower = new THREE.Mesh(towerGeo, periscopeMat);
        tower.position.set(0, radius * 1.1, -bodyLength * 0.1);
        tower.position.z = bodyLength * 0;
        tower.position.y = bodyLength * 0.1;
        this.group.add(tower);

        // periscopio
        const pipeGeo = new THREE.CylinderGeometry(radius * 0.12, radius * 0.12, radius * 2.2, 12);
        const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: 0x444444 }));
        pipe.position.set(-0.5, radius * 2.0, -bodyLength * 0.1);
        pipe.position.y = bodyLength * 0.1;
        pipe.position.z = bodyLength * 0;
        pipe.position.x = bodyLength * (-0.02);
        this.group.add(pipe);

        // cabeçote do periscópio
        const headGeo = new THREE.BoxGeometry(radius * 0.55, radius * 0.22, radius * 0.3);
        const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
        head.position.set(0, radius * 2.3, -bodyLength * 0.1);
        head.position.z = bodyLength * 0;
        head.position.y = bodyLength * 0.25;

        this.group.add(head);

        const warningLightGeo = new THREE.SphereGeometry(radius * 0.07, 12, 12);
        const warningLightMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.0,   // começa apagada
        metalness: 0.2,
        roughness: 0.4
        });
        const warningLight = new THREE.Mesh(warningLightGeo, warningLightMat);

        warningLight.position.set(0.13, radius * 0.015, radius * 0 );

        head.add(warningLight);     

        this.warningLight = warningLight;
        this.warningLightPhase = 0;

        // helice para colocar na parte de trás do submarino

        const hubGeo = new THREE.CylinderGeometry(radius * 0.18, radius * 0.18, radius * 0.15, 12);
        hubGeo.rotateZ(Math.PI / 2);
        const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({ color: 0x999999 }));
        hub.rotateY(Math.PI/2);
        hub.position.set(0, 0, bodyLength * 0);
        hub.position.x = -bodyLength * 0.69;
        

        // pás simples
        const bladeGeo = new THREE.BoxGeometry(radius * 0.05, radius * 0.6, radius * 0.04);
        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0xbcbcbc }));
            blade.position.y = radius * 0.35;
            blade.rotation.z = (i / 3) * Math.PI * 2;
            hub.add(blade);
        }

        const hubLightGeo = new THREE.CylinderGeometry(radius * 0.10, radius * 0.10, radius * 0.04, 16);
        hubLightGeo.rotateZ(Math.PI / 2);

        const hubLightMat = new THREE.MeshStandardMaterial({
        color: 0xffffaa,
        emissive: 0xffffaa,
        emissiveIntensity: 2.0,
        metalness: 0.0,
        roughness: 0.3
        });

        const hubLight = new THREE.Mesh(hubLightGeo, hubLightMat);


        hubLight.position.set(0, 11.3, 32.8); 
        hubLight.rotateY(Math.PI/2);

        const hubPointLight = new THREE.PointLight(0xffffaa, 1.5, s * 0.2);
        hubPointLight.position.set(0.0, 0.0, 0.0);
        hubLight.add(hubPointLight);

        hub.add(hubLight);

        this.group.add(hub);

        const light = new THREE.SpotLight(0xffffff, 2.0, s * 1.0, Math.PI / 7, 0.4);
        light.position.set(0, 0, -bodyLength * 0.62);

        light.castShadow = true;
        light.shadow.mapSize.set(1024, 1024);

        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = this.cubeSize * 1.5;
        light.shadow.camera.fov = 30;

        light.penumbra = 0.35;
        light.decay = 1.2;

        const target = new THREE.Object3D();
        target.position.set(0, 0, -s * 0.50);
        this.group.add(target);
        light.target = target;

        light.visible = false;
        this.headlight = light;
        this.group.add(light);


        const frontLight = new THREE.SpotLight(0xffdd88, 2.2, this.cubeSize * 0.9, Math.PI / 6, 0.45);
        frontLight.position.set( bodyLength * 0.3, 0, 0 ); 
        frontLight.castShadow = true;
        frontLight.shadow.mapSize.set(1024, 1024);

        const targetObj = new THREE.Object3D();
        targetObj.position.set( bodyLength, -this.cubeSize * 0.15, 0 );
        this.group.add(targetObj);
        frontLight.target = targetObj;

        this.group.add(frontLight);
        this.frontLight = frontLight;

        
    }

    _onKeyDown(e) {
        this.keys.add(e.code);
    }
    

    _onKeyUp(e) {
        this.keys.delete(e.code);
    }

    update() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - this._lastTime) / 1000);
        this._lastTime = now;

        const move = this.speed * dt;
        const rot = this.turnSpeed * dt;

        if (this.keys.has("KeyA")) this.group.rotation.y += rot;
        if (this.keys.has("KeyD")) this.group.rotation.y -= rot;

        const forward = new THREE.Vector3(1, 0, 0).applyQuaternion(this.group.quaternion);      
        if (this.keys.has("KeyW")) this.group.position.addScaledVector(forward, move);
        if (this.keys.has("KeyS")) this.group.position.addScaledVector(forward, -move);

        // Vertical movement with P (up) and L (down)
        if (this.keys.has("KeyP")) this.group.position.y += move;
        if (this.keys.has("KeyL")) this.group.position.y -= move;

        if (this.warningLight) {
            this.warningLightPhase += dt * 2 * Math.PI * 2; 
            const blink = (Math.sin(this.warningLightPhase) + 1) / 2; 

            const minIntensity = 0.1;
            const maxIntensity = 2.5;
            const intensity = minIntensity + blink * (maxIntensity - minIntensity);

            this.warningLight.material.emissiveIntensity = intensity;
        }

        this._stayInsideAquarium();
    }

    _stayInsideAquarium() {
        const p = this.group.position;
        const s = this.cubeSize;

        const limit = s * 0.48;
        const bottom = -s / 2 + s / 10 + s * 0.04;
        const top = s / 2 - s * 0.10;

        p.x = THREE.MathUtils.clamp(p.x, -limit, limit);
        p.z = THREE.MathUtils.clamp(p.z, -limit, limit);
        p.y = THREE.MathUtils.clamp(p.y, bottom, top);
    }

    dispose() {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
        this.app.scene.remove(this.group);
    }
}

export { MySubmarine };
