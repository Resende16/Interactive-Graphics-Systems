import * as THREE from 'three';
import { Myoctahedron } from './MyOctahedron.js';

export class MyLamp extends THREE.Group {

    constructor(color = 0xffff00, position = new THREE.Vector3(0, 5, 0), size = 0.5, ceilingY = 8, isPointLight = true, floorLight = false) {
        super();

        // glass outer shell
        this.outerShell = new Myoctahedron(null, size * 2, 0xffffff, true, 0.3);

        // inner octahedron (light source)
        this.innerLamp = new Myoctahedron(null, size, color, false);

        this.add(this.outerShell);
        this.add(this.innerLamp);


        if (isPointLight) {
            //point light
            this.light = new THREE.PointLight(0xffffff, 5, 20);
            this.light.position.set(0, 0, 0);
            this.innerLamp.add(this.light);
        } else {
            //spot light
            this.light = new THREE.SpotLight(0xffffff, 5, 20, Math.PI / 4, 0.2, 1);
            this.light.position.set(0, 0, 0);

            const targetObject = new THREE.Object3D();
            targetObject.position.set(0, -2, 0);
            this.innerLamp.add(targetObject);
            this.light.target = targetObject;
            this.innerLamp.add(this.light);
        }

        const wireHeight = floorLight ? position.y : ceilingY - position.y;
        const wireWidth = floorLight ? 0.1 : 0.05;
        const wireGeometry = new THREE.CylinderGeometry(wireWidth, wireWidth, wireHeight, 16);

        const wireMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.3,
            roughness: 0.7
        });
        this.position.copy(position);
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);

        if (floorLight) {
            
            wire.position.set(0, -wireHeight / 2, 0);

            // flor lamp base
            const baseGeometry = new THREE.CylinderGeometry(size , size , 0.1, 16);
            const baseMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.4,
                roughness: 0.8
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(0, -position.y, 0); 
            this.add(base);
        }
        else {

            const base = new THREE.CylinderGeometry(size / 4, size / 4, 0.1, 16)
            this.add(base)
            wire.position.set(0, wireHeight / 2 + size, 0);

        }

        this.add(wire);
    }

    setColor(color) {
        this.innerLamp.updateColor(color);
        if (this.light) this.light.color.set(color);
    }
}
