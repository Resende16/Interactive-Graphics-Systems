// src/pw2/MyApp.js
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

    init() {
        // --- Scene ---
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x101010);

        // --- Stats ---
        this.stats = new Stats();
        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);

        // --- Cameras ---
        this.cameras.init();
        this.cameras.setActive('Perspective');

        // --- Renderer ---
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("canvas").appendChild(this.renderer.domElement);

        // --- Resize handler ---
        window.addEventListener('resize', this.onResize.bind(this), false);
    }

    onResize() {
        this.cameras.resize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setContents(contents) { this.contents = contents; }
    setGui(gui) { this.gui = gui; }

    updateCameraIfRequired() {
        if (this.cameras.lastCameraName !== this.cameras.activeCameraName) {
            this.cameras.lastCameraName = this.cameras.activeCameraName;
            document.getElementById("camera").innerHTML = this.cameras.activeCameraName;

            if (!this.controls) {
                this.controls = new OrbitControls(this.cameras.activeCamera, this.renderer.domElement);
                this.controls.enableZoom = true;
            } else {
                this.controls.object = this.cameras.activeCamera;
            }

            this.onResize();
        }
    }

    render() {
        this.stats.begin();
        this.updateCameraIfRequired();

        if (this.contents && this.cameras.activeCamera) {
            this.contents.update();
        }

        if (this.controls)
            this.controls.update();

        this.renderer.render(this.scene, this.cameras.activeCamera);

        requestAnimationFrame(this.render.bind(this));
        this.stats.end();
    }
}

export { MyApp };
