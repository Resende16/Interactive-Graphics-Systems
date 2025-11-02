// MyContents.js
import * as THREE from 'three';
import { MyCube } from './geometries/MyCube.js';
import { MyRocks } from './objects/MyRocks.js';
import { MyFloor } from './objects/MyFloor.js';
import { MyPanorama } from './objects/MyPanorama.js';
import { Plant } from './objects/MyPlant.js';


class MyContents {
    constructor(app) {
        this.app = app;
        this.cube = null;
        this.rock = null;
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
}

export { MyContents };