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
        
        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'chair color': this.contents.chairColor,
            'painting color': this.contents.paintingColor,
            'sofa color': this.contents.sofaColor,
            'cushion color': this.contents.cushionColor
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

        const sofaFolder = this.datgui.addFolder( 'Sofa' );
        sofaFolder.add(this.contents, 'sofaEnabled', true).name("enabled");
        sofaFolder.addColor( data, 'sofa color' ).onChange( (value) => { this.contents.updateSofaColor(value) } );
        sofaFolder.addColor( data, 'cushion color' ).onChange( (value) => { this.contents.updateCushionColor(value) } );
        sofaFolder.open();

        
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


        const lightFolder = this.datgui.addFolder('Light')
        // Parameters object for the spotlight

        const spotParams = {
            color: "#ffffff",
            intensity: 15,
            distance: 14,
            angle: 20,       // degrees
            penumbra: 0,
            decay: 0,
            posY: 10,
            targetY: 0,
            visible: false
        };


        lightFolder.addColor(spotParams, 'color').onChange(val => this.contents.spotLight.color.set(val));
        lightFolder.add(spotParams, 'intensity', 0, 50).onChange(val => this.contents.spotLight.intensity = val);
        lightFolder.add(spotParams, 'distance', 0, 50).onChange(val => this.contents.spotLight.distance = val);

        lightFolder.add(spotParams, 'angle', 1, 90).onChange(val =>
            this.contents.spotLight.angle = THREE.MathUtils.degToRad(val)
        );
        lightFolder.add(spotParams, 'penumbra', 0, 1).step(0.01).onChange(val => this.contents.spotLight.penumbra = val);
        lightFolder.add(spotParams, 'decay', 0, 5).onChange(val => this.contents.spotLight.decay = val);
        lightFolder.add(spotParams, 'posY', -10, 20).onChange(val => this.contents.spotLight.position.y = val);
        lightFolder.add(spotParams, 'targetY', -10, 20).onChange(val => this.contents.spotLight.target.position.y = val);
        this.contents.spotLight.visible = spotParams.visible;
        this.contents.spotLightHelper.visible = spotParams.visible;
        lightFolder.add(spotParams, 'visible').onChange(val => {
            this.contents.spotLight.visible = val;
            if (this.contents.spotLightHelper) {
                this.contents.spotLightHelper.visible = val;
            }
        });
        lightFolder.open();
    }
    

    
}

export { MyGuiInterface };