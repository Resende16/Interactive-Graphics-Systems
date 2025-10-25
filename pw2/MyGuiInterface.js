// MyGuiInterface.js
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from '../pw2/MyApp.js';
import { MyContents } from '../pw2/MyContents.js';

class MyGuiInterface {
    constructor(app) {
        this.app = app;
        this.datgui = new GUI();
        this.contents = null;
    }

    setContents(contents) {
        this.contents = contents;
    }

    init() {
        if (!this.contents) return;

        const cube = this.contents.getCube();
        if (!cube) return;

        const cubeProperties = cube.getProperties();

        // Cube Folder
        const cubeFolder = this.datgui.addFolder('Cube Properties');
        cubeFolder.open();

        // Control Difuse Color
        cubeFolder.addColor(cubeProperties, 'diffuseColor')
            .name('Diffuse Color')
            .onChange(() => {
                cube.updateMaterial();
            });

        // Control Transparency
        cubeFolder.add(cubeProperties, 'transparency', 0.1, 1.0, 0.05)
            .name('Transparency')
            .onChange(() => {
                cube.updateMaterial();
            });

        const cameraFolder = this.datgui.addFolder('Camera');
        const camNames = this.app.cameras.getCameraNames();

        cameraFolder
            .add(this.app.cameras, 'activeCameraName', camNames)
            .name("Active Camera")
            .onChange(value => this.app.cameras.setActive(value));

        // Live update for camera position
        const pos = this.app.cameras.activeCamera.position;
        cameraFolder.add(pos, 'x', -50, 50).name("X");
        cameraFolder.add(pos, 'y', -50, 50).name("Y");
        cameraFolder.add(pos, 'z', -50, 50).name("Z");

        cameraFolder.open();


    }
}

export { MyGuiInterface };