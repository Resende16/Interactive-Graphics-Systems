// MyContents.js
import * as THREE from 'three';
import { MyCube } from './geometries/MyCube.js';
import { MyRocks } from './objects/MyRocks.js';
import { MyFloor } from './objects/MyFloor.js';


class MyContents {
    constructor(app) {
        this.app = app;
        this.cube = null;
        this.rock = null;
        this.floor = null;
        this.cubeSize = 15;
    }

    init() {
        
        // Create the Floor first (so it appears behind everything)
        this.floor = new MyFloor(this.app,this.cubeSize);
        this.floor.init();

        // Create and Centralize the Cube (Aquarium)
        this.cube = new MyCube(this.app,this.cubeSize);
        this.cube.init();

        // Create Rock
        this.rock = new MyRocks(this.app,this.cubeSize);
        this.rock.init();
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
}

export { MyContents };