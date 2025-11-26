import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyCameras } from '../pw2/objects/MyCameras.js';
import Stats from 'three/addons/libs/stats.module.js';

class MyApp {
    constructor() {
        this.scene = null;
        this.stats = null;

        this.clock = new THREE.Clock();

        // Cameras
        this.cameras = new MyCameras(20);

        // Other
        this.renderer = null;
        this.controls = null;
        this.gui = null;
        this.axis = null;
        this.contents = null;
        this.activeCamera = null;
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
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // --- Cameras ---
        this.cubeSize = 15;
        this.cameras.init(this.cubeSize);
        this.activeCamera = this.cameras.activeCamera;

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

        // (NÃO criamos MyContents nem MyGuiInterface aqui;
        //  isso é feito em main.js e ligado com setContents)

        // --- Resize inicial ---
        this.cameras.resize();

        const ambient = new THREE.HemisphereLight(
            0x74c7ff,  
            0x0a1a33,  
            0.7        
        );
        this.scene.add(ambient);

        const sunLight = new THREE.DirectionalLight(0x89c6ff, 3.5);
        sunLight.position.set(0, this.cubeSize * 2, this.cubeSize * 0.5);

        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;

        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = this.cubeSize * 6;
        sunLight.shadow.camera.left = -this.cubeSize;
        sunLight.shadow.camera.right = this.cubeSize;
        sunLight.shadow.camera.top = this.cubeSize;
        sunLight.shadow.camera.bottom = -this.cubeSize;

        this.scene.add(sunLight);
        this.sunLight = sunLight;

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

        const delta = this.clock.getDelta();

        if (this.contents?.update) this.contents.update(delta);

        this.controls.update();
        this.renderer.render(this.scene, this.activeCamera);
        this.stats.end();
    }
}

export { MyApp };
