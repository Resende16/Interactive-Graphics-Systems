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
            'chair color': this.contents.chairColor,
            'painting color': this.contents.paintingColor
        };

        // adds a folder to the gui interface for the plane
        const planeFolder = this.datgui.addFolder( 'Floor' );
        planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        planeFolder.add(this.contents.planeMaterial, 'roughness', 0, 1).name("roughness");
        planeFolder.add(this.contents.planeMaterial, 'metalness', 0, 1).name("metalness");
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

        // adds a folder to the gui interface for the TV
        const tvFolder = this.datgui.addFolder( 'Television' );
        tvFolder.add(this.contents, 'tvEnabled', true).name("enabled");
        tvFolder.add(this.contents, 'tvOn').name("TV On").onChange( (value) => { 
            this.contents.tvOn = value;
            if (this.contents.television) {
                this.contents.television.toggleTV(value);
            }
        });
        tvFolder.open();

        // adds a folder to the gui interface for paintings
        const paintingFolder = this.datgui.addFolder( 'Paintings' );
        paintingFolder.addColor( data, 'painting color' ).onChange( (value) => { 
            this.contents.paintingColor = value;
        } );
        paintingFolder.open();

        // adds a folder to the gui interface for the table group
        const tableGroupFolder = this.datgui.addFolder('Table Group');
        tableGroupFolder.add(this.contents.tableGroupPosition, 'x', -this.contents.roomSize/2, this.contents.roomSize/2)
            .name("position x")
            .onChange((value) => {
                this.contents.tableGroup.position.x = value;
            });
        tableGroupFolder.add(this.contents.tableGroupPosition, 'z', -this.contents.roomSize/2, this.contents.roomSize/2)
            .name("position z")
            .onChange((value) => {
                this.contents.tableGroup.position.z = value;
            });
        
        // Opções para mover para cantos específicos
        const cornerOptions = {
            corner: 'bottom-left'
        };
        tableGroupFolder.add(cornerOptions, 'corner', ['bottom-left', 'bottom-right', 'top-left', 'top-right'])
            .name("move to corner")
            .onChange((value) => {
                this.contents.moveTableGroupToCorner(value);
            });
        
        tableGroupFolder.open();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Perspective2', 'Left', 'Top', 'Front','Right','Back'] ).name("active camera");
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()
    }
}

export { MyGuiInterface };