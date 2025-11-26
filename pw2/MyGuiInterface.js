// MyGuiInterface.js
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from '../pw2/MyApp.js';
import { MyContents } from '../pw2/MyContents.js';
import { MyCube } from '../pw2/geometries/MyCube.js';
import { MyRocks } from './objects/MyRocks.js';
import { MyFloor } from './objects/MyFloor.js';


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

        // ===== CUBE CONTROLS =====
        const cube = this.contents.getCube();
        if (cube) {
            const cubeProperties = cube.getProperties();



            // Cube Folder
            const cubeFolder = this.datgui.addFolder('Cube Properties');
            cubeFolder.open();

            cubeFolder.add(cubeProperties, 'transparency', 0.1, 1.0, 0.05)
                .name('Transparency')
                .onChange(() => {
                    cube.updateMaterial();
                });
        }


        const cameraFolder = this.datgui.addFolder('Camera');
        const camNames = this.app.cameras.getCameraNames();

        cameraFolder
            .add(this.app.cameras, 'activeCameraName', camNames)
            .name("Active Camera")
            .onChange(value => this.app.cameras.setActive(value));

        // Live update for camera position
        const pos = this.app.cameras.activeCamera.position;

        cameraFolder.open();

        // ===== ROCK CONTROLS =====
        const rock = this.contents.getRocks();
        if (rock) {
            const rockProperties = rock.getProperties();

            const rockFolder = this.datgui.addFolder('Rock Properties');

            rockFolder.addColor(rockProperties, 'diffuseColor')
                .name('Rock Color')
                .onChange(() => {
                    rock.updateMaterial();
                });

            rockFolder.add(rockProperties, 'scale', 0.5, 3.0, 0.1)
                .name('Scale')
                .onChange(() => {
                    rock.updateScale();
                });
        }

        // ===== FLOOR CONTROLS =====
        const floor = this.contents.getFloor();
        if (floor) {
            const floorProperties = floor.getProperties();

            const floorFolder = this.datgui.addFolder('Sand Floor');

            floorFolder.add(floorProperties, 'heightVariation', 0.0, 1, 0.01)
                .name('Height Variation')
                .onChange(() => {
                    floor.updateIrregularity();
                });

            floorFolder.add(floorProperties, 'textureRepeat', 1, 10, 0.5)
                .name('Texture Repeat')
                .onChange(() => {
                    floor.updateTextureRepeat();
                });

            floorFolder.add({ regenerate: () => floor.updateIrregularity() }, 'regenerate')
                .name('Regenerate Surface');
        }

        const panorama = this.contents.getPanorama();
        if (panorama) {
            const panoramaProperties = panorama.getProperties();

            const panoramaFolder = this.datgui.addFolder('Ocean Panorama');

            panoramaFolder.add(panoramaProperties, 'enabled')
                .name('Show Panorama')
                .onChange((value) => {
                    panorama.setEnabled(value);
                });


        }
        const forest = this.contents.MycoralForest; 
        const wireframeParams = { showWireframe: false };

        const forestFolder = this.datgui.addFolder('Coral Forest');
        forestFolder.add(wireframeParams, 'showWireframe')
            .name('Wireframe Mode')
            .onChange(value => {
                forest.setWireframeAll(value); 
            });


    }
}

export { MyGuiInterface };