// MyContents.js
import * as THREE from 'three';
import { MyApp } from '../pw2/MyApp.js';
import { MyCube } from '../pw2/MyCube.js';

class MyContents {
    constructor(app) {
        this.app = app;
        this.cube = null;
        this.fish = null;
    }

    init() {
        // Create and Centralize the Cube
        this.cube = new MyCube(this.app);
        this.cube.init();

    }

    update() {
    }

    getCube() {
        return this.cube;
    }

    
}

export { MyContents };