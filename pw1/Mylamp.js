import * as THREE from 'three';
import { Myoctahedron } from './MyOctahedron.js';

export class MyLamp extends THREE.Group {

    constructor(
        color = 0xffff00,
        position = new THREE.Vector3(0, 5, 0),
        size = 0.5,
        ceilingY = 8,
        isPointLight = true,
        floorLight = false
    ) {
        super();

        this.position.copy(position);
        this.color = color;
        this.size = size;
        this.ceilingY = ceilingY;
        this.isPointLight = isPointLight;
        this.floorLight = floorLight;

        this.createLampStructure();
        this.createWireAndBase();
        this.createLight();
    }

    createLampStructure() {
        // inside octahedron (light source)
        this.outerShell = new Myoctahedron(null, this.size * 2, 0xffffff, true, 0.3);

        // inside octahedron (light source)
        this.innerLamp = new Myoctahedron(null, this.size, this.color, false);

        this.add(this.outerShell);
        this.add(this.innerLamp);
    }

    // Creates the wire and the base of the lamp
    createWireAndBase() {
        const wireHeight = this.floorLight
            ? this.position.y
            : this.ceilingY - this.position.y*0.6;

        const wireWidth = this.floorLight ? 0.1 : 0.05;

        const wireGeometry = new THREE.CylinderGeometry(wireWidth, wireWidth, wireHeight, 16);
        const wireMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.3,
            roughness: 0.7
        });

        const wire = new THREE.Mesh(wireGeometry, wireMaterial);

        if (this.floorLight) {
           
            wire.position.set(0, -wireHeight / 2, 0);
            this.add(this.createFloorBase());
        } else {
            wire.position.set(0, wireHeight / 2 + this.size, 0);
            this.add(this.createCeilingBase());
        }

        this.add(wire);
    }

    createFloorBase() {
        const geometry = new THREE.CylinderGeometry(this.size, this.size, 0.1, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.4,
            roughness: 0.8
        });
        const base = new THREE.Mesh(geometry, material);
        base.position.set(0, -this.position.y, 0);
        return base;
    }

    createCeilingBase() {
        const geometry = new THREE.CylinderGeometry(this.size / 4, this.size / 4, 0.1, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.4,
            roughness: 0.8
        });
        const base = new THREE.Mesh(geometry, material);
        return base;
    }

    createLight() {
        if (this.isPointLight) {
            this.light = new THREE.PointLight(0xffffff, 5, 20);
        } else {
            this.light = new THREE.SpotLight(0xffffff, 5, 20, Math.PI / 4, 0.2, 1);

            const target = new THREE.Object3D();
            target.position.set(0, -2, 0);
            this.innerLamp.add(target);
            this.light.target = target;
        }

        this.light.position.set(0, 0, 0);
        this.innerLamp.add(this.light);
    }

    setColor(color) {
        this.color = color;
        this.innerLamp.updateColor(color);
        if (this.light) this.light.color.set(color);
    }
}
