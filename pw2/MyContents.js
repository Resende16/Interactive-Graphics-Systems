// MyContents.js
import * as THREE from 'three';
import { MyCube } from './geometries/MyCube.js';
import { MyRocks } from './objects/MyRocks.js';
import { MyFloor } from './objects/MyFloor.js';
import { MyPanorama } from './objects/MyPanorama.js';
import { Plant } from './objects/MyPlant.js';
import { MySeaStar } from './objects/MySeaStar.js';
import { MyBubbles } from './objects/MyBubbles.js';
import { MyFish } from './objects/MyFish.js';
import { MyFish2 } from './objects/MyFish2.js';
import { MySubmarine } from './objects/MySubmarine.js';
import { MycoralForest } from './objects/MyCoralForest.js';
import { MyShark } from './objects/MyShark.js';
import { MyTurtle } from './objects/MyTurtle.js';


class MyContents {
    constructor(app) {
        this.app = app;
        this.cube = null;
        this.rock = null;
        this.seaStar = null;
        this.bubbles = null;
        this.floor = null;
        this.panorama = null;
        this.submarine = null;
        this.plants = [];
        this.fishes = [];
        this.sharks = [];
        this.cubeSize = 15;
        this.corals = [];
        this.forbidden = [];
        this.MycoralForest = null;
        this.turtle = null;
        this.groups = {};
    }

    init() {
        this.groups.corals = new THREE.Group();
        this.app.scene.add(this.groups.corals);
        
        this.panorama = new MyPanorama(this.app, this.cubeSize);
        this.panorama.init();

        // Create the Floor first (so it appears behind everything)
        this.floor = new MyFloor(this.app, this.cubeSize);
        this.floor.init();

        this.createPlants();

        // Create and Centralize the Cube (Aquarium)
        this.cube = new MyCube(this.app, this.cubeSize);
        this.cube.init();

        // Create Rock
        this.rock = new MyRocks(this.app, this.cubeSize);
        this.rock.init();

        const extraRockPositions = [
        new THREE.Vector3(-4, -5.5, 6),
        new THREE.Vector3(-0, -5.5, 0),
        new THREE.Vector3(5, -5.5, 0),
        ];

        this.extraRocks = [];

        for (const pos of extraRockPositions) {
        const r = new MyRocks(this.app, this.cubeSize);
        r.init();                          
        r.group.position.copy(pos);        
        r.group.scale.multiplyScalar(0.25); 
        this.extraRocks.push(r);
        }

        this.createFishes();

        this.createSharks();


        // Submarino
        this.submarine = new MySubmarine(this.app, this.cubeSize);
        this.submarine.init();

        // Register submarine camera to GUI
        if (this.submarine.camera && this.app.cameras) {
            this.app.cameras.addCamera('Submarine', this.submarine.camera);
        }

        // Turtle
        this.turtle = new MyTurtle(this.app, this.cubeSize);
        this.turtle.init();

        // Sea star
        this.seaStar = new MySeaStar(this.app, this.cubeSize);
        const floorTopY = this.floor.getTopY();
        this.seaStar.init(new THREE.Vector3(2, floorTopY + 0.9, 4));

        this.bubbles = new MyBubbles(this.app, this.cubeSize, {
            // You can adjust these:
            // spawnPerSecond: 8,
            // radiusMin: this.cubeSize * 0.009,
            // radiusMax: this.cubeSize * 0.016
        });
        this.bubbles.init();

        const coralPositions = [
            new THREE.Vector3(4, 0, 2),
            new THREE.Vector3(-1, 0, -6),
            new THREE.Vector3(-6, 0, -2),
            new THREE.Vector3(0, 0, -4),
            new THREE.Vector3(-2, 0, 4),
            new THREE.Vector3(5, 0, -5),
            new THREE.Vector3(-5, 0, 5),
            new THREE.Vector3(1.5, 0, 5.5),
            new THREE.Vector3(-4.5, 0, 0),
        ];
        
        const forest = new MycoralForest(this.app, 0xff7799, 5);
        const forestGroup = forest.createForest(-6, coralPositions);
        this.MycoralForest = forest;
        this.groups.corals.add(forestGroup);
    }

    createPlants() {
        const positions = [
            new THREE.Vector3(this.cubeSize * 0.20, 0, -this.cubeSize * 0.28),
            new THREE.Vector3(-this.cubeSize * 0.26, 0, this.cubeSize * 0.15)
        ];

        this.plants = [];
        for (const pos of positions) {
            const plant = new Plant(this.app, this.cubeSize);
            plant.init(pos);
            this.plants.push(plant);
        }
    }

    createFishes() {
        const numFishes = 10;
        const s = this.cubeSize;

        for (let i = 0; i < numFishes; i++) {
            const scale = THREE.MathUtils.randFloat(0.6, 1.0);
            const speed = THREE.MathUtils.randFloat(0.5, 1.2);

            const FishClass = (i % 3 === 0) ? MyFish2 : MyFish;

            const fish = new FishClass(this.app, {
                showCurves: false,
                swimSpeed: speed,
                swimAmplitude: 0.20,
                turnSmoothness: 0.05
            });

            fish.init();

            fish.fishGroup.position.x = THREE.MathUtils.randFloat(-s * 0.3, s * 0.3);
            fish.fishGroup.position.y = THREE.MathUtils.randFloat(-s * 0.2, s * 0.2);
            fish.fishGroup.position.z = THREE.MathUtils.randFloat(-s * 0.3, s * 0.3);

            const baseScale = (fish instanceof MyFish2) ? 0.007 : 0.005;
            fish.fishGroup.scale.setScalar(scale * s * baseScale);

            this.fishes.push(fish);
        }
    }

    createSharks() {
        const numSharks = 2;
        const s = this.cubeSize;

        for (let i = 0; i < numSharks; i++) {
            const shark = new MyShark(this.app, {
            showCurves: false,
            swimSpeed: 0.25,
            turnSmoothness: 0.04,
            swimAmplitude: 0.18,
            });

            shark.init();

            shark.fishGroup.position.x = THREE.MathUtils.randFloat(-s * 0.5, s * 0.5);
            shark.fishGroup.position.y = THREE.MathUtils.randFloat(-s * 0.2, s * 0.3);
            shark.fishGroup.position.z = THREE.MathUtils.randFloat(-s * 0.5, s * 0.5);

            shark.fishGroup.scale.setScalar(s * 0.0085);

            this.sharks.push(shark);
        }
        }


    createFishSchool() {
        const s = this.cubeSize;

        this.schoolLeader = new MyFish(this.app, {
            swimSpeed: 1.0, showCurves: false
        });
        this.schoolLeader.init();
        this.schoolLeader.fishGroup.scale.setScalar(s * 0.03);
        this.fishes.push(this.schoolLeader);

        for (let i = 0; i < 6; i++) {
            const follower = new MyFish(this.app, {
                showCurves: false,
                swimSpeed: 0.9
            });
            follower.init();
            follower.fishGroup.scale.setScalar(s * 0.02);

            follower.isFollower = true;
            follower.followTarget = this.schoolLeader;

            this.fishes.push(follower);
        }
    }

    setPlantsWireframe(value) {
        if (!this.plants) return;
        this.plants.forEach(plant => {
            plant.setWireframeAll(value);
        });
    }

    update() {
        const t = performance.now() * 0.001;
        const delta = this.app.clock.getDelta();

        if (this.bubbles) this.bubbles.update();

        if (this.fish) this.fish.update(delta, this.cubeSize);

        for (const f of this.fishes)
            f.update(delta, this.cubeSize);

        for (const shark of this.sharks)
            shark.update(delta, this.cubeSize);

        if (this.submarine) {
            this.submarine.update();
        }

        if (this.turtle) {
            this.turtle.update(delta);
        }

        if (this.seaStar) {
            this.seaStar.update(delta, this.cubeSize);
        }

        // Update plant shaders
        if (this.plants) {
            for (const p of this.plants) {
                if (p.shaderUniforms) {
                    for (const uniforms of p.shaderUniforms) {
                        uniforms.time.value = t;
                    }
                }
            }
        }

    }

    getCube() {
        return this.cube;
    }

    getRocks() {
        return this.rock;
    }

    getFloor() {
        return this.floor;
    }

    getPanorama() {
        return this.panorama;
    }
    
    getSeaStar() {
        return this.seaStar;
    }
}

export { MyContents };