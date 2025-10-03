
import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';
import { MyPainting } from './MyPainting.js';
import { MyChair } from './MyChair.js';

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
        this.boxEnabled = false
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        // room dimensions (shared between walls and floor)
        this.roomSize = 20;

        // plane related attributes
        this.diffusePlaneColor = "#ecb86f"
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
        this.chairs = []
        this.chairColor = 0xb17f39 
        
        // painting related attributes
        this.paintingColor = 0xffff00

        // Caminhos das imagens locais da pasta textures
        this.paintingImages = [
            './textures/painting1.jpg',
            './textures/painting2.jpg',
            './textures/painting1.jpg',
            './textures/painting2.jpg'
        ]
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
        const wallLength = this.roomSize;
        const wallThickness = 0.3;

        // Wall positions: front, back, left, right
        const wallConfigs = [
            { position: [0, wallHeight/2, wallLength/2], rotation: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] },
            { position: [0, wallHeight/2, -wallLength/2], rotation: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] },
            { position: [-wallLength/2, wallHeight/2, 0], rotation: [0, Math.PI/2, 0], size: [wallLength, wallHeight, wallThickness] },
            { position: [wallLength/2, wallHeight/2, 0], rotation: [0, Math.PI/2, 0], size: [wallLength, wallHeight, wallThickness] }
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
     * builds all chairs around the table
     */
    buildChairs() {
        // Remove existing chairs if they exist
        this.chairs.forEach(chair => {
            this.app.scene.remove(chair);
        });
        this.chairs = [];

        // Define chair positions and rotations around the table
        const chairConfigs = [
            { position: [1, 0, 2], rotation: -Math.PI/2 },    // Right side
            { position: [1, 0, -2], rotation: -Math.PI/2 },    // Left side
            { position: [-4, 0, 2], rotation: Math.PI/2 },          // Back side
            { position: [-4, 0, -2], rotation: Math.PI/2 }    // Front side
        ];

        chairConfigs.forEach(config => {
            const chair = new MyChair(this, this.chairColor, config.rotation);
            chair.position.set(config.position[0], config.position[1], config.position[2]);
            this.chairs.push(chair);
            
            if (this.chairEnabled) {
                this.app.scene.add(chair);
            }
        });
    }

    /**
     * updates the chair color for all chairs
     * @param {number} value - The new color in hexadecimal
     */
    updateChairColor(value) {
        this.chairColor = value
        this.chairs.forEach(chair => {
            chair.updateColor(value)
        })
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

        // Create and add table (moved to the left)
        let table = new MyTable(this)
        table.position.x = -1.5 // Move table 1.5 units to the left
        this.app.scene.add(table)

        // Create and add chairs
        this.buildChairs();

        // Create paintings with imagens locais
        const painting1 = new MyPainting(
            this, 
            0.3, 0.3, 0.15, 
            this.paintingImages[0] // Primeira imagem
        )
        painting1.position.y += 5
        painting1.position.x += 9.8
        painting1.position.z += -4
        painting1.rotation.y += Math.PI/2
        this.app.scene.add(painting1)

        const painting2 = new MyPainting(
            this, 
            0.3, 0.3, 0.15, 
            this.paintingImages[1] // Segunda imagem
        )
        painting2.position.y += 5
        painting2.position.x += 9.8
        painting2.position.z += 4
        painting2.rotation.y += Math.PI/2
        this.app.scene.add(painting2)

        const painting3 = new MyPainting(
            this,
            0.3, 0.3, 0.15,
            this.paintingImages[2] // Terceira imagem 
        )
        painting3.position.y += 5
        painting3.position.x += -9.8
        painting3.position.z += -4
        painting3.rotation.y += -Math.PI/2
        this.app.scene.add(painting3)

        const painting4 = new MyPainting(
            this,
            0.4, 0.5, 0.15,
            this.paintingImages[3] // Quarta imagem 
        )
        painting4.position.y += 5
        painting4.position.x += 4
        painting4.position.z += -9.8
        painting4.rotation.y += Math.PI
        this.app.scene.add(painting4)
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
     * rebuilds all chairs
     */
    rebuildChairs() {
        this.buildChairs();
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
     * updates the chairs visibility if required
     * this method is called from the render method of the app
     * updates are triggered by chairEnabled property changes
     */
    updateChairsIfRequired() {
        if (this.chairEnabled !== this.lastChairEnabled) {
            this.lastChairEnabled = this.chairEnabled
            this.chairs.forEach(chair => {
                if (this.chairEnabled) {
                    this.app.scene.add(chair)
                } else {
                    this.app.scene.remove(chair)
                }
            });
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

        // check if chairs need to be updated
        this.updateChairsIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
    }
}

export { MyContents };
