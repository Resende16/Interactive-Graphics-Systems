// MyContents.js
import * as THREE from 'three';
import { MyCube } from './geometries/MyCube.js';
import { MyRocks } from './geometries/MyRocks.js';
import { MyFloor } from './MyFloor.js';


class MyContents {
    constructor(app) {
        this.app = app;
        this.cube = null;
        this.rock = null;
        this.floor = null;
    }

    init() {
        // Create the Floor first (so it appears behind everything)
        this.floor = new MyFloor(this.app);
        this.floor.init();

        // Create and Centralize the Cube (Aquarium)
        this.cube = new MyCube(this.app);
        this.cube.init();

        // Create Rock
        this.rock = new MyRocks(this.app);
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