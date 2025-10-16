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
        
        

    }
}

export { MyGuiInterface };