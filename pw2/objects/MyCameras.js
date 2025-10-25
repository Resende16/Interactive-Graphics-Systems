// src/pw2/MyCameras.js
import * as THREE from 'three';

class MyCameras {
    constructor(frustumSize = 20) {
        this.frustumSize = frustumSize;
        this.cameras = {};
        this.cameraParams = {}; 
        this.activeCamera = null;
        this.activeCameraName = null;
    }

 
    init(size = 10) {
        const aspect = window.innerWidth / window.innerHeight;

        // Perspective base
        this.createPerspective('Perspective', new THREE.Vector3(size * 0.8, size * 0.8, size * 0.8));

        // FreeFly (manual)
        this.createFreeFly('FreeFly', new THREE.Vector3(0, size * 0.5, size * 1.5));

        // Underwater — relativa ao interior do cubo
        this.createUnderwater('Underwater', {
            anchor: 'front-bottom',
            offset: new THREE.Vector3(0, size * 0.1, size * 0.5),
        });

        // Fixed Aquarium View
        this.createAquarium('Aquarium', {
            anchor: 'front-top',
            offset: new THREE.Vector3(0, size * 0.3, size * 0.9),
        });

        this.createOrthoViews(size, aspect);

        this.setActive('Perspective');
    }

    /* -------------------
       Factory methods
       ------------------- */

    createPerspective(name, position) {
        const aspect = window.innerWidth / window.innerHeight;
        const cam = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
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

    createUnderwater(name, params) {
        const cam = this.createPerspective(name, new THREE.Vector3());
        cam.rotation.x = -0.1;
        cam.isUnderwater = true;
        this.cameraParams[name] = { ...params, type: 'relative' };
        this.cameras[name] = cam;
        return cam;
    }

    createAquarium(name, params) {
        const cam = this.createPerspective(name, new THREE.Vector3());
        cam.isAquarium = true;
        this.cameraParams[name] = { ...params, type: 'relative' };
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

    /* -------------------
       Dynamic updates
       ------------------- */

   
    updateForAquariumSize(size) {
        for (const [name, params] of Object.entries(this.cameraParams)) {
            if (params.type !== 'relative') continue;

            const cam = this.cameras[name];
            if (!cam) continue;

            const base = this._anchorPosition(params.anchor, size);
            const offset = params.offset || new THREE.Vector3();
            cam.position.copy(base.clone().add(offset));
            cam.lookAt(0, 0, 0);
        }
    }
    // Used to get anchor positions for relative cameras
    _anchorPosition(anchor, size) {
        const half = size / 2;
        const anchors = {
            'front-top': new THREE.Vector3(0, half, half),
            'front-bottom': new THREE.Vector3(0, -half, half),
            'back-top': new THREE.Vector3(0, half, -half),
            'back-bottom': new THREE.Vector3(0, -half, -half),
            'left': new THREE.Vector3(-half, 0, 0),
            'right': new THREE.Vector3(half, 0, 0),
        };
        return anchors[anchor] || new THREE.Vector3(0, 0, half);
    }

    /* -------------------
       Utility
       ------------------- */

    setActive(name) {
        if (!this.cameras[name]) return console.warn(`Camera ${name} not found`);
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
}

export { MyCameras };
