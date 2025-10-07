import * as THREE from 'three';
import { Myoctahedron } from './Myoctahedron.js';

export class MyLamp extends THREE.Group {

    constructor(color=0xffff00, position = new THREE.Vector3(0, 5, 0), size = 0.5, ceilingY = 8, isPointLight = true) {
        super();

        // glass outer shell
        this.outerShell = new Myoctahedron(null, size * 2, 0xffffff, true, 0.3);

        // inner octahedron (light source)
        this.innerLamp = new Myoctahedron(null, size, color, false);

        this.add(this.outerShell);
        this.add(this.innerLamp);

       
        if (isPointLight) {
            this.light = new THREE.PointLight(0xffffff, 5, 20);
            this.light.position.set(0, 0, 0);
            this.innerLamp.add(this.light);
        } else {
            this.light = new THREE.SpotLight(0xffffff, 5, 20, Math.PI / 6, 0.2, 1);
            this.light.position.set(0, 0, 0);

            const targetObject = new THREE.Object3D();
            targetObject.position.set(0, -2, 0); 
            this.innerLamp.add(targetObject);
            this.light.target = targetObject;
            this.innerLamp.add(this.light);
        }

        
        this.position.copy(position);

        // wire tht connects the lamp to the ceiling
        const wireHeight = Math.max(0, ceilingY - position.y); 
        const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, wireHeight, 16);
        const wireMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            metalness: 0.3, 
            roughness: 0.7 
        });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        // Position the wire above the lamp
        wire.position.set(0, wireHeight / 2 + size, 0);

        // Add the wire
        this.add(wire);
    }

    setColor(color) {
        this.innerLamp.updateColor(color);
        if (this.light) this.light.color.set(color);
    }
}
