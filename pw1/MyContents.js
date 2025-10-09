import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';
import { MyPainting } from './MyPainting.js';
import { MyChair } from './MyChair.js';
import { MyTVStand } from './MyTVStand.js';
import { MyTelevision } from './MyTelevision.js';
import { MySofa } from './MySofa.js';
import { MySphere } from './MySphere.js';
import { MyLamp } from './MyLamp.js';
import { MyChasis } from './MyChasis.js';
import { MyPanorama } from './MyPanorama.js';

/**
 *  This class contains the contents of out application
 */
class MyContents {

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
        this.boxDisplacement = new THREE.Vector3(0, 2, 0)

        // room dimensions (shared between walls and floor)
        this.roomSize = 20;

        // plane related attributes
        this.diffusePlaneColor = "#ecb86f"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.2
        })

        // walls related attributes
        this.wallHeight = 8
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
        this.chairColor = 0xf4eee6

        // bowl and oranges related attributes
        this.bowlAndOrangesEnabled = true
        this.lastBowlAndOrangesEnabled = null
        this.bowlAndOrangesGroup = null
        this.bowlColor = 0xf4eee6
        this.orangeColor = 0xff8c00

        // painting related attributes
        this.paintingColor = 0xffff00

        this.paintingImages = [
            './textures/selfie2.jpeg',
            './textures/selfiet.jpeg',
            './textures/monalisa.jpg',
            './textures/selfie2.jpeg'
        ]

        this.tableGroup = null
        this.tableGroupPosition = { x: -1.5, y: 0, z: 0 } // Posição inicial do grupo


        this.tvEnabled = true
        this.lastTvEnabled = null
        this.tvOn = false

        this.tvStand = null
        this.television = null

        this.sofa = null
        this.sofaEnabled = true
        this.lastSofaEnabled = null
        this.sofaColor = 0xf4eee6

        this.cushionColor = 0xaedbea


        //Lamp atributes;
        this.lampType = 'Point';
        this.lampColor = "#ffff00";
        this.lampIntensity = 5;
        // carpet related attributes
        this.carpetEnabled = true
        this.lastCarpetEnabled = null
        this.carpetMesh = null
        this.carpetWidth = 7
        this.carpetDepth = 10
        this.carpetHeight = 0.02
        this.carpetColor = 0xf4eee6

        // baseboard related attributes
        this.baseboardEnabled = true
        this.lastBaseboardEnabled = null
        this.baseboards = []
        this.baseboardHeight = 0.3
        this.baseboardDepth = 0.1

    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {
        let boxMaterial = new THREE.MeshPhongMaterial({
            color: "#ffff77",
            specular: "#000000", emissive: "#000000", shininess: 90
        })

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(this.boxMeshSize, this.boxMeshSize, this.boxMeshSize);
        this.boxMesh = new THREE.Mesh(box, boxMaterial);
        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.rotation.x = Math.PI / 6;
        this.boxMesh.scale.set(3, 2, 1);
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

        const wallHeight = this.wallHeight;
        const wallLength = this.roomSize;
        const wallThickness = 0.3;

        // Wall positions: front, back, left, right
        const wallConfigs = [
            { position: [0, wallHeight / 2, wallLength / 2], rotation: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] },
            { position: [0, wallHeight / 2, -wallLength / 2], rotation: [0, 0, 0], size: [wallLength, wallHeight, wallThickness] },
            { position: [-wallLength / 2, wallHeight / 2, 0], rotation: [0, Math.PI / 2, 0], size: [wallLength, wallHeight, wallThickness] },
            { position: [wallLength / 2, wallHeight / 2, 0], rotation: [0, Math.PI / 2, 0], size: [wallLength, wallHeight, wallThickness] }
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

     buildLamp() {
        const lampPosition = new THREE.Vector3(0, this.wallHeight * 0.8, 0);

        if (this.lamp) {
            if (this.app.scene.children.includes(this.lamp)) {
                this.app.scene.remove(this.lamp);
            }
            if (this.tableGroup && this.tableGroup.children.includes(this.lamp)) {
                this.tableGroup.remove(this.lamp);
            }
            this.lamp = null;
        }

        const isPointLight = this.lampType === 'Point';
        this.lamp = new MyLamp(this.lampColor,lampPosition, 0.5, this.wallHeight, isPointLight);

        this.lamp.setColor(this.lampColor);
        this.lamp.light.intensity = this.lampIntensity;

        if (this.tableGroup) {
            this.tableGroup.add(this.lamp);
        }
    }


    /**
     * builds the floor plane with texture
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

        // Load floor texture
        this.loadFloorTexture();

        this.app.scene.add(this.planeMesh);
    }

    /**
     * Loads and applies the floor texture
     */
    loadFloorTexture() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            './textures/floor.png',
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                const repeatCount = 4; // Quantas vezes a textura se repete
                texture.repeat.set(repeatCount, repeatCount);

                // Aplicar a textura ao material
                this.planeMaterial.map = texture;
                this.planeMaterial.needsUpdate = true;

                console.log('Textura do chão carregada com sucesso!');
            },
            undefined,
            (error) => {
                console.error('Erro ao carregar textura do chão:', error);
                this.planeMaterial.color.set(this.diffusePlaneColor);
            }
        );
    }

    /**
     * creates a bowl with oranges on the table
     */
    createBowlWithOranges() {
        // Remove existing bowl and oranges if they exist
        if (this.bowlAndOrangesGroup !== undefined && this.bowlAndOrangesGroup !== null) {
            this.tableGroup.remove(this.bowlAndOrangesGroup);
        }

        // Create a group for bowl and oranges
        this.bowlAndOrangesGroup = new THREE.Group();

        // Create the bowl (half sphere)
        const bowl = new MySphere(this, 0.8, this.bowlColor, 32, true);
        bowl.position.y = 0.5; // Adjust height to sit on table
        bowl.rotation.x = Math.PI

        // Create oranges (small spheres)
        const orangePositions = [
            { x: -0.3, y: 0.2, z: 0.2 },
            { x: 0.3, y: 0.2, z: -0.2 },
            { x: 0, y: 0.5, z: 0 }
        ];

        orangePositions.forEach(pos => {
            const orange = new MySphere(this, 0.3, this.orangeColor, 16, false);
            orange.position.set(pos.x, pos.y, pos.z);
            this.bowlAndOrangesGroup.add(orange);
        });

        this.bowlAndOrangesGroup.add(bowl);

        // Position the bowl group on the table
        this.bowlAndOrangesGroup.position.y = 3.5; // Height of table + bowl base

        if (this.bowlAndOrangesEnabled) {
            this.tableGroup.add(this.bowlAndOrangesGroup);
        }
    }

    /**
     * builds all chairs around the table
     */
    buildChairs() {
        // Remove existing chairs if they exist
        this.chairs.forEach(chair => {
            this.tableGroup.remove(chair);
        });
        this.chairs = [];

        // Define chair positions and rotations around the table
        const chairConfigs = [
            { position: [3, 0, 2], rotation: -Math.PI / 2 },    // Right side
            { position: [3, 0, -2], rotation: -Math.PI / 2 },    // Left side
            { position: [-3, 0, 2], rotation: Math.PI / 2 },          // Back side
            { position: [-3, 0, -2], rotation: Math.PI / 2 }    // Front side
        ];

        chairConfigs.forEach(config => {
            const chair = new MyChair(this, this.chairColor, config.rotation);
            chair.position.set(config.position[0], config.position[1], config.position[2]);
            this.chairs.push(chair);

            if (this.chairEnabled) {
                this.tableGroup.add(chair);
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
     * updates the bowl and oranges visibility if required
     */
    updateBowlAndOrangesIfRequired() {
        if (this.bowlAndOrangesEnabled !== this.lastBowlAndOrangesEnabled) {
            this.lastBowlAndOrangesEnabled = this.bowlAndOrangesEnabled;
            if (this.bowlAndOrangesGroup) {
                if (this.bowlAndOrangesEnabled) {
                    this.tableGroup.add(this.bowlAndOrangesGroup);
                } else {
                    this.tableGroup.remove(this.bowlAndOrangesGroup);
                }
            }
        }
    }

    /**
     * builds the carpet under the table
     */
    buildCarpet() {
        // Remove existing carpet if it exists
        if (this.carpetMesh !== undefined && this.carpetMesh !== null) {
            this.app.scene.remove(this.carpetMesh);
        }

        // Create carpet material with texture
        this.carpetMaterial = new THREE.MeshStandardMaterial({
            color: this.carpetColor,
            roughness: 0.9,
            metalness: 0.1
        });

        // Load carpet texture
        this.loadCarpetTexture();

        // Create carpet geometry
        const carpetGeometry = new THREE.BoxGeometry(this.carpetWidth, this.carpetHeight, this.carpetDepth);
        this.carpetMesh = new THREE.Mesh(carpetGeometry, this.carpetMaterial);

        // Position carpet under the table group
        this.carpetMesh.position.copy(this.tableGroup.position);
        this.carpetMesh.position.y = this.carpetHeight / 2 + 0.01; // Slightly above floor

        if (this.carpetEnabled) {
            this.app.scene.add(this.carpetMesh);
        }
    }

    /**
     * Loads and applies the carpet texture
     */
    loadCarpetTexture() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            './textures/carpet.jpg',
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                const repeatX = this.carpetWidth / 2;
                const repeatY = this.carpetDepth / 2;
                texture.repeat.set(repeatX, repeatY);

                this.carpetMaterial.map = texture;
                this.carpetMaterial.needsUpdate = true;

                console.log('Textura da carpete carregada com sucesso!');
            },
            undefined,
            (error) => {
                console.error('Erro ao carregar textura da carpete:', error);
                this.carpetMaterial.color.set(this.carpetColor);
            }
        );
    }

    /**
     * builds the baseboards around the room
     */
    buildBaseboards() {
        // Clear existing baseboards
        this.baseboards.forEach(baseboard => {
            this.app.scene.remove(baseboard);
        });
        this.baseboards = [];

        const wallLength = this.roomSize;
        const baseboardHeight = this.baseboardHeight;
        const baseboardDepth = this.baseboardDepth;

        // Baseboard positions: front, back, left, right
        const baseboardConfigs = [
            {
                position: [0, baseboardHeight / 2, wallLength / 2 - baseboardDepth / 2 - 0.1],
                rotation: [0, 0, 0],
                size: [wallLength, baseboardHeight, baseboardDepth]
            },
            {
                position: [0, baseboardHeight / 2, -wallLength / 2 + baseboardDepth / 2 + 0.1],
                rotation: [0, 0, 0],
                size: [wallLength, baseboardHeight, baseboardDepth]
            },
            {
                position: [-wallLength / 2 + baseboardDepth / 2 + 0.1, baseboardHeight / 2, 0],
                rotation: [0, Math.PI / 2, 0],
                size: [wallLength, baseboardHeight, baseboardDepth]
            },
            {
                position: [wallLength / 2 - baseboardDepth / 2 - 0.1, baseboardHeight / 2, 0],
                rotation: [0, Math.PI / 2, 0],
                size: [wallLength, baseboardHeight, baseboardDepth]
            }
        ];

        // Create wood material for baseboards
        this.baseboardMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown wood color
            roughness: 0.7,
            metalness: 0.3
        });

        // Load wood texture for baseboards
        this.loadBaseboardTexture();

        baseboardConfigs.forEach(config => {
            const baseboardGeometry = new THREE.BoxGeometry(...config.size);
            const baseboardMesh = new THREE.Mesh(baseboardGeometry, this.baseboardMaterial);
            baseboardMesh.position.set(...config.position);
            baseboardMesh.rotation.set(...config.rotation);

            this.baseboards.push(baseboardMesh);
            if (this.baseboardEnabled) {
                this.app.scene.add(baseboardMesh);
            }
        });
    }

    /**
     * Loads and applies the wood texture for baseboards
     */
    loadBaseboardTexture() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            './textures/tampomesa.jpg',
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                const repeatCount = 8;
                texture.repeat.set(repeatCount, 1);

                this.baseboardMaterial.map = texture;
                this.baseboardMaterial.needsUpdate = true;

                console.log('Textura do rodapé carregada com sucesso!');
            },
            undefined,
            (error) => {
                console.error('Erro ao carregar textura do rodapé:', error);
                this.baseboardMaterial.color.set(0x8B4513);
            }
        );
    }


    /**
     * updates the carpet visibility if required
     */
    updateCarpetIfRequired() {
        if (this.carpetEnabled !== this.lastCarpetEnabled) {
            this.lastCarpetEnabled = this.carpetEnabled;
            if (this.carpetMesh) {
                if (this.carpetEnabled) {
                    this.app.scene.add(this.carpetMesh);
                } else {
                    this.app.scene.remove(this.carpetMesh);
                }
            }
        }
    }

    /**
     * updates the baseboards visibility if required
     */
    updateBaseboardsIfRequired() {
        if (this.baseboardEnabled !== this.lastBaseboardEnabled) {
            this.lastBaseboardEnabled = this.baseboardEnabled;
            this.baseboards.forEach(baseboard => {
                if (this.baseboardEnabled) {
                    this.app.scene.add(baseboard);
                } else {
                    this.app.scene.remove(baseboard);
                }
            });
        }
    }

    /**
     * updates carpet position when table group moves
     */
    updateCarpetPosition() {
        if (this.carpetMesh) {
            this.carpetMesh.position.copy(this.tableGroup.position);
            this.carpetMesh.position.y = this.carpetHeight / 2 + 0.01;
            this.carpetMesh.position.x = 5
        }
    }

    updateLamp() {
        this.buildLamp();
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

        // Create the spotlight
        this.spotLight = new THREE.SpotLight(0xffffff, 15);
        this.spotLight.position.set(5, 10, 2);
        this.spotLight.distance = 14;
        this.spotLight.angle = THREE.MathUtils.degToRad(20);
        this.spotLight.penumbra = 0;
        this.spotLight.decay = 0;
        this.spotLight.target.position.set(1, 0, 1);
        this.app.scene.add(this.spotLight);
        this.app.scene.add(this.spotLight.target);
        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        this.app.scene.add(this.spotLightHelper);

        // add a point light on top of the model
        const pointLight = new THREE.PointLight(0xffffff, 500, 0);
        pointLight.position.set(0, 20, 0);
        this.app.scene.add(pointLight);

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        this.app.scene.add(pointLightHelper);

        // add an ambient light
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.app.scene.add(ambientLight);

        this.buildBox()

        // Build floor with room size
        this.buildFloor();

        // Build walls
        this.buildWalls();

        // Create and add table (moved to the left)
        this.tableGroup = new THREE.Group();
        this.tableGroup.position.set(this.tableGroupPosition.x, this.tableGroupPosition.y, this.tableGroupPosition.z);
        this.app.scene.add(this.tableGroup);

        // Create and add table ao grupo
        let table = new MyTable(this)
        this.tableGroup.add(table)


        // Create bowl with oranges on the table
        this.createBowlWithOranges();

        // Create and add chairs
        this.buildChairs();

        // Build baseboards
        this.buildBaseboards();

        // Build carpet under table
        this.buildCarpet();

        this.moveTableGroupToCorner('bottom-left');

        this.createTVSet();

        this.createSofa();
        this.buildLamp();

        const painting1 = new MyPainting(
            this,
            this.paintingImages[0] 
        )
        painting1.position.y += 5
        painting1.position.x += 9.8
        painting1.position.z += -4
        painting1.rotation.y += Math.PI / 2
        this.app.scene.add(painting1)

        const painting2 = new MyPainting(
            this,
            this.paintingImages[1] 
        )
        painting2.position.y += 5
        painting2.position.x += 9.8
        painting2.position.z += 4
        painting2.rotation.y += Math.PI / 2
        this.app.scene.add(painting2)

        const painting3 = new MyPainting(
            this,
            this.paintingImages[2] 
        )
        painting3.position.y += 5
        painting3.position.x += -9.8
        painting3.position.z += -6
        painting3.rotation.y += -Math.PI / 2
        this.app.scene.add(painting3)

        
    }

    createTVSet() {
        // Create TV stand
        this.tvStand = new MyTVStand(this);
        this.tvStand.rotation.y = Math.PI / 2
        this.tvStand.position.set(-8.8, 0, 0); 
        this.app.scene.add(this.tvStand);

        // Create television
        this.television = new MyTelevision(this, "textures/leopard.jpg", null, 2.75, 5.25, 0.3, 0.15, 0.15, 0.35);
        this.television.position.set(
            this.tvStand.position.x,
            this.tvStand.position.y + 3.3, 
            this.tvStand.position.z
        );
        //this.television.rotation.x = Math.PI / 2
        //this.television.rotation.y = Math.PI / 2
        //this.television.rotation.y += Math.PI / 2
        this.app.scene.add(this.television)

        const panorama = new MyPanorama(this)
        this.app.scene.add(panorama)
    }

    createSofa() {
        this.sofa = new MySofa(this, this.sofaColor);

        const roomHalfSize = this.roomSize / 2;
        const offset = 1.5;

        this.sofa.position.set(-3, 0.2, -5);

        this.sofa.rotation.y = -Math.PI/2;

        this.app.scene.add(this.sofa);
    }

    toggleTV() {
        this.tvOn = !this.tvOn;
        if (this.television) {
            this.television.toggleTV(this.tvOn);
        }
    }

    updateTVIfRequired() {
        if (this.tvEnabled !== this.lastTvEnabled) {
            this.lastTvEnabled = this.tvEnabled
            if (this.tvStand) {
                if (this.tvEnabled) {
                    this.app.scene.add(this.tvStand)
                    this.app.scene.add(this.television)
                } else {
                    this.app.scene.remove(this.tvStand)
                    this.app.scene.remove(this.television)
                }
            }
        }
    }

    /**
     * Updates the sofa color
     * @param {number} value - The new color in hexadecimal
     */
    updateSofaColor(value) {
        this.sofaColor = value;
        if (this.sofa) {
            this.sofa.updateColor(value);
        }
    }

    updateCushionColor(value) {
        this.cushionColor = value;
        if (this.sofa) {
            this.sofa.updateCushionColor(value);
        }
    }

    /**
     * Updates sofa visibility if required
     */
    updateSofaIfRequired() {
        if (this.sofaEnabled !== this.lastSofaEnabled) {
            this.lastSofaEnabled = this.sofaEnabled;
            if (this.sofa) {
                if (this.sofaEnabled) {
                    this.app.scene.add(this.sofa);
                } else {
                    this.app.scene.remove(this.sofa);
                }
            }
        }
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
        // Not used with MeshStandardMaterial
    }

    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        // Not used with MeshStandardMaterial
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

    moveTableGroupToCorner(corner = 'bottom-left') {
        const roomHalfSize = this.roomSize / 2;
        const offset = 7;

        switch (corner) {
            case 'bottom-left':
                this.tableGroup.position.set(-roomHalfSize + offset, 0, -roomHalfSize + offset);
                break;
            case 'bottom-right':
                this.tableGroup.position.set(roomHalfSize - offset, 0, -roomHalfSize + offset);
                break;
            case 'top-left':
                this.tableGroup.position.set(-roomHalfSize + offset, 0, roomHalfSize - offset);
                break;
            case 'top-right':
                this.tableGroup.position.set(roomHalfSize - offset, 0, roomHalfSize - offset);
                break;
            default:
                this.tableGroup.position.set(-roomHalfSize + offset, 0, -roomHalfSize + offset);
        }

        this.tableGroupPosition = {
            x: this.tableGroup.position.x = 5,
            y: this.tableGroup.position.y = 0.05,
            z: this.tableGroup.position.z
        };

        this.updateCarpetPosition();
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
                    this.tableGroup.add(chair)
                } else {
                    this.tableGroup.remove(chair)
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

        // check if TV needs to be updated
        this.updateTVIfRequired()

        this.updateSofaIfRequired()

        // check if carpet needs to be updated
        this.updateCarpetIfRequired()

        // check if baseboards need to be updated
        this.updateBaseboardsIfRequired()

        // check if bowl and oranges need to be updated
        this.updateBowlAndOrangesIfRequired()
        this.updateLamp();
        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
    }

   
}

export { MyContents };