

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from '../pw2/MyContents.js';
import { MyGuiInterface } from '../pw2/MyGuiInterface.js';
import { MyCameras } from '../pw2/objects/MyCameras.js';
import Stats from 'three/addons/libs/stats.module.js';

class MyApp {
    constructor() {
        this.scene = null;
        this.stats = null;

        // Cameras
        this.cameras = new MyCameras(20);

        // Other
        this.renderer = null;
        this.controls = null;
        this.gui = null;
        this.axis = null;
        this.contents = null;
    }

    setContents(contents) {
        this.contents = contents;
        if (this.gui) {
            this.gui.setContents(contents);
        }
    }

    render() {
        this.renderer.render(this.scene, this.activeCamera);
    }

    init() {
        // --- Scene ---
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        // --- Renderer ---
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // --- Cameras ---
        this.cubeSize = 15;
        this.cameras.init(this.cubeSize);        this.activeCamera = this.cameras.activeCamera;

        // --- Controls ---
        this.controls = new OrbitControls(this.activeCamera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.03;

        // --- Stats ---
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // --- Axis ---
        this.axis = new THREE.AxesHelper(5);
        this.scene.add(this.axis);


        // --- Resize ---
        this.cameras.resize();

        this.animate();
    }

    onResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cameras.onResize(window.innerWidth, window.innerHeight);
    }

    switchCamera(name) {
        this.activeCamera = this.cameras.getCamera(name);
        this.controls.object = this.activeCamera;
        this.controls.update();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.stats.begin();

        if (this.contents?.update) this.contents.update();

        this.controls.update();
        this.renderer.render(this.scene, this.activeCamera);
        this.stats.end();
    }
}

export { MyApp };
