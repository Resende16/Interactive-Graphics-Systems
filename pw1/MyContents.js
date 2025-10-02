import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';
import { MyPainting } from './MyPainting.js';
import { MyChair } from './MyChair.js'; // Import the new Chair class

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        // room dimensions (shared between walls and floor)
        this.roomSize = 20; // Tamanho da sala (comprimento e largura)

        // plane related attributes
        this.diffusePlaneColor = "#00ffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess })

        // walls related attributes
        this.wallsEnabled = true
        this.lastWallsEnabled = null
        this.walls = []
        this.wallMaterial = new THREE.MeshPhongMaterial({ 
            color: "#cdaa90ff", 
            specular: "#333333", 
            emissive: "#000000", 
            shininess: 30 
        })

        // chair related attributes
        this.chairEnabled = true
        this.lastChairEnabled = null
        this.chair = null
        this.chairColor = 0x4A90E2 // New color: blue
        this.chairRotation = 520 // 180 degrees in radians
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        let boxMaterial = new THREE.MeshPhongMaterial({ color: "#ffff77", 
        specular: "#000000", emissive: "#000000", shininess: 90 })

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, boxMaterial );
        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.rotation.x = Math.PI / 6;
        this.boxMesh.scale.set(3,2,1);
    }

    /**
     * builds the four walls
     */
    buildWalls() {
        // Clear existing walls
        this.walls.forEach(wall => {
            this.app.scene.remove(wall);
        });
        this.walls = [];

        const wallHeight = 8;
        const wallLength = this.roomSize; // Usar o tamanho da sala
        const wallThickness = 0.3;

        // Wall positions: front, back, left, right
        const wallConfigs = [
            { position: [0, wallHeight/2, wallLength/2], rotation: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] }, // Front wall
            { position: [0, wallHeight/2, -wallLength/2], rotation: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] }, // Back wall
            { position: [-wallLength/2, wallHeight/2, 0], rotation: [0, Math.PI/2, 0], size: [wallLength, wallHeight, wallThickness] }, // Left wall
            { position: [wallLength/2, wallHeight/2, 0], rotation: [0, Math.PI/2, 0], size: [wallLength, wallHeight, wallThickness] }  // Right wall
        ];

        wallConfigs.forEach(config => {
            const wallGeometry = new THREE.BoxGeometry(...config.size);
            const wallMesh = new THREE.Mesh(wallGeometry, this.wallMaterial);
            wallMesh.position.set(...config.position);
            wallMesh.rotation.set(...config.rotation);
            
            this.walls.push(wallMesh);
            if (this.wallsEnabled) {
                this.app.scene.add(wallMesh);
            }
        });
    }

    /**
     * builds the floor plane
     */
    buildFloor() {
        // Remove existing floor if it exists
        if (this.planeMesh !== undefined && this.planeMesh !== null) {
            this.app.scene.remove(this.planeMesh);
        }

        // Create a Plane Mesh with the same size as the room
        let plane = new THREE.PlaneGeometry(this.roomSize, this.roomSize);
        this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = 0;
        this.app.scene.add(this.planeMesh);
    }

    /**
     * builds the chair
     */
    buildChair() {
        // Remove existing chair if it exists
        if (this.chair !== undefined && this.chair !== null) {
            this.app.scene.remove(this.chair);
        }

        // Create the chair with custom color and rotation
        this.chair = new MyChair(this, this.chairColor, this.chairRotation);
        
        // Position the chair next to the table
        this.chair.position.set(3, 0, 0); // 3 units to the right of the table

        if (this.chairEnabled) {
            this.app.scene.add(this.chair);
        }
    }

    /**
     * updates the chair color
     * @param {number} value - The new color in hexadecimal
     */
    updateChairColor(value) {
        this.chairColor = value
        if (this.chair !== null) {
            this.chair.updateColor(value)
        }
    }

    /**
     * updates the chair rotation
     * @param {number} value - The rotation in radians
     */
    updateChairRotation(value) {
        this.chairRotation = value
        this.rebuildChair()
    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        this.app.scene.add( ambientLight );

        this.buildBox()
        
        // Build floor with room size
        this.buildFloor();

        // Build walls
        this.buildWalls();

        // Create and add table
        let table = new MyTable(this)
        this.app.scene.add(table)

        // Create and add chair
        this.buildChair();

        const painting = new MyPainting(this)
        painting.position.y += 5
        this.app.scene.add(painting)
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }

    /**
     * rebuilds the floor with current room size
     */
    rebuildFloor() {
        this.buildFloor();
    }

    /**
     * rebuilds the chair
     */
    rebuildChair() {
        this.buildChair();
    }
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    /**
     * updates the walls visibility if required
     * this method is called from the render method of the app
     * updates are triggered by wallsEnabled property changes
     */
    updateWallsIfRequired() {
        if (this.wallsEnabled !== this.lastWallsEnabled) {
            this.lastWallsEnabled = this.wallsEnabled
            this.walls.forEach(wall => {
                if (this.wallsEnabled) {
                    this.app.scene.add(wall)
                } else {
                    this.app.scene.remove(wall)
                }
            });
        }
    }

    /**
     * updates the chair visibility if required
     * this method is called from the render method of the app
     * updates are triggered by chairEnabled property changes
     */
    updateChairIfRequired() {
        if (this.chairEnabled !== this.lastChairEnabled) {
            this.lastChairEnabled = this.chairEnabled
            if (this.chairEnabled) {
                this.app.scene.add(this.chair)
            } else {
                this.app.scene.remove(this.chair)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        // check if walls need to be updated
        this.updateWallsIfRequired()

        // check if chair needs to be updated
        this.updateChairIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
    }
}

export { MyContents };