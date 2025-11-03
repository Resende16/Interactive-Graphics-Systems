// MyContents.js
import * as THREE from 'three';
import { MyCube } from './geometries/MyCube.js';
import { MyRocks } from './objects/MyRocks.js';
import { MyFloor } from './objects/MyFloor.js';
import { MyPanorama } from './objects/MyPanorama.js';
import { Plant } from './objects/MyPlant.js';
import { MySeaStar } from './objects/MySeaStar.js';
import { MyBubbles } from './objects/MyBubbles.js';


class MyContents {
    constructor(app) {
        this.app = app;
        this.cube = null;
        this.rock = null;
        this.seaStar = null;
        this.bubbles = null;
        this.floor = null;
        this.panorama = null;
        this.plants = [];
        this.cubeSize = 15;

    }

    init() {

        this.panorama = new MyPanorama(this.app, this.cubeSize);
        this.panorama.init();
        
        // Create the Floor first (so it appears behind everything)
        this.floor = new MyFloor(this.app,this.cubeSize);
        this.floor.init();

        this.createPlants();

        // Create and Centralize the Cube (Aquarium)
        this.cube = new MyCube(this.app,this.cubeSize);
        this.cube.init();

        // Create Rock
        this.rock = new MyRocks(this.app,this.cubeSize);
        this.rock.init();

        // Sea star
        this.seaStar = new MySeaStar(this.app, this.cubeSize, {
            armLength: this.cubeSize * 0.18,   // antes ~0.28
            armBaseRadius: this.cubeSize * 0.022,
            armTipRadius: this.cubeSize * 0.006
        });
        this.seaStar.init(new THREE.Vector3(this.cubeSize * 0.08, 0.25, this.cubeSize * 0.2));

        this.bubbles = new MyBubbles(this.app, this.cubeSize, {
        // podes afinar estes:
        // spawnPerSecond: 8,
        // radiusMin: this.cubeSize * 0.009,
        // radiusMax: this.cubeSize * 0.016
        });
        this.bubbles.init();

    }

    createPlants() {
    const positions = [
        new THREE.Vector3(this.cubeSize * 0.20, 0, -this.cubeSize * 0.28), 
        new THREE.Vector3(-this.cubeSize * 0.26, 0,  this.cubeSize * 0.15) 
    ];

    this.plants = [];
    for (const pos of positions) {
        const plant = new Plant(this.app, this.cubeSize);
        plant.init(pos);
        this.plants.push(plant);
    }
    }

    update() {
        if (this.bubbles) this.bubbles.update();
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