// src/pw2/MyCameras.js
import * as THREE from 'three';

class MyCameras {
    constructor(frustumSize = 20) {
        this.frustumSize = frustumSize;
        this.cameras = {};
        this.activeCamera = null;
        this.activeCameraName = null;
    }

    init(cubeSize = 15) {
        const aspect = window.innerWidth / window.innerHeight;

        this.createPerspective('Perspective', new THREE.Vector3(cubeSize * 0.8, cubeSize * 0.8, cubeSize * 0.8));

        this.createFreeFly('FreeFly', new THREE.Vector3(0, cubeSize * 0.5, cubeSize * 1.5));

        this.createUnderwater('Underwater', cubeSize);
        this.createAquarium('Aquarium', cubeSize);

        this.createOrthoViews(cubeSize, aspect);

        this.setActive('Perspective');
    }

    /* ------------------- Factory methods ------------------- */

    createPerspective(name, position) {
        const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cam.position.copy(position);
        cam.lookAt(0, 0, 0);
        this.cameras[name] = cam;
        return cam;
    }

    createFreeFly(name, position) {
        const cam = this.createPerspective(name, position);
        cam.isFreeFly = true;
        return cam;
    }

    createUnderwater(name, cubeSize) {
        const heightAboveSand = cubeSize / 10;
        const offset = cubeSize/30;
        const position = new THREE.Vector3(
            cubeSize / 2,
            -cubeSize / 2 + heightAboveSand + offset,
            cubeSize / 2
        );

        const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, cubeSize * 5);
        cam.position.copy(position);
        cam.lookAt(0, 0, 0);
        cam.isFixed = true;
        cam.isUnderwater = true;
        this.cameras[name] = cam;
        return cam;
    }

    createAquarium(name, cubeSize) {
        const position = new THREE.Vector3(0, cubeSize / 2, 0);
        const cam = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, cubeSize * 5);
        cam.position.copy(position);
        cam.lookAt(0, 0, 0);
        cam.isFixed = true;
        cam.isAquarium = true;
        this.cameras[name] = cam;
        return cam;
    }

    createOrthoViews(size, aspect) {
        const f = this.frustumSize;
        const left = -f / 2 * aspect;
        const right = f / 2 * aspect;
        const top = f / 2;
        const bottom = -f / 2;
        const near = -f / 2;
        const far = f;

        const makeOrtho = (name, pos) => {
            const cam = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
            cam.position.copy(pos);
            cam.lookAt(0, 0, 0);
            this.cameras[name] = cam;
        };

        makeOrtho('Top', new THREE.Vector3(0, size, 0));
        makeOrtho('Front', new THREE.Vector3(0, 0, size));
    }

    /* ------------------- Utilities ------------------- */

    setActive(name) {
        if (!this.cameras[name]) {
            console.warn(`Camera "${name}" not found`);
            return;
        }
        this.activeCamera = this.cameras[name];
        this.activeCameraName = name;
    }

    resize() {
        if (!this.activeCamera) return;
        const aspect = window.innerWidth / window.innerHeight;

        if (this.activeCamera.isPerspectiveCamera) {
            this.activeCamera.aspect = aspect;
            this.activeCamera.updateProjectionMatrix();
        } else if (this.activeCamera.isOrthographicCamera) {
            const f = this.frustumSize;
            this.activeCamera.left = -f / 2 * aspect;
            this.activeCamera.right = f / 2 * aspect;
            this.activeCamera.updateProjectionMatrix();
        }
    }

    getCameraNames() {
        return Object.keys(this.cameras);
    }

    addCamera(name, camera) {
        this.cameras[name] = camera;
    }
}

export { MyCameras };
