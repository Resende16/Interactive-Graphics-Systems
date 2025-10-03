
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // add a folder to the gui interface for the box
        const boxFolder = this.datgui.addFolder( 'Box' );
        boxFolder.add(this.contents, 'boxMeshSize', 0, 10).name("size").onChange( () => { this.contents.rebuildBox() } );
        boxFolder.add(this.contents, 'boxEnabled', true).name("enabled");
        boxFolder.add(this.contents.boxDisplacement, 'x', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'y', -5, 5)
        boxFolder.add(this.contents.boxDisplacement, 'z', -5, 5)
        boxFolder.open()
        
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
            'chair color': this.contents.chairColor,
            'painting color': this.contents.paintingColor
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder( 'Plane' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        planeFolder.open();

        // adds a folder to the gui interface for the walls
        const wallsFolder = this.datgui.addFolder( 'Walls' );
        wallsFolder.add(this.contents, 'wallsEnabled', true).name("enabled");
        wallsFolder.open();

        // adds a folder to the gui interface for the chair
        const chairFolder = this.datgui.addFolder( 'Chair' );
        chairFolder.add(this.contents, 'chairEnabled', true).name("enabled");
        chairFolder.addColor( data, 'chair color' ).onChange( (value) => { this.contents.updateChairColor(value) } );
        chairFolder.open();

        // adds a folder to the gui interface for paintings
        const paintingFolder = this.datgui.addFolder( 'Paintings' );
        paintingFolder.addColor( data, 'painting color' ).onChange( (value) => { 
            this.contents.paintingColor = value;
            // Note: To change painting colors dynamically, you'd need to store painting references
            // and update their materials. For now, this will only affect new paintings.
        } );
        paintingFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Perspective2', 'Left', 'Top', 'Front','Right','Back'] ).name("active camera");
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()
    }
}

export { MyGuiInterface };
