import * as THREE from 'three';

export class MySphere extends THREE.Group {
    constructor(app, radius = 1, color = 0xffffff, segments = 32, halfSphere = false) {
        super();
        this.app = app;
        this.radius = radius;
        this.color = color;
        this.segments = segments;
        this.halfSphere = halfSphere;

        this.createSphere();
    }

    createSphere() {
        let geometry;
        
        if (this.halfSphere) {
            geometry = new THREE.SphereGeometry(
                this.radius, 
                this.segments, 
                this.segments, 
                0, 
                Math.PI * 2, 
                0, 
                Math.PI / 2
            );
        } else {
            geometry = new THREE.SphereGeometry(this.radius, this.segments, this.segments);
        }

        const material = new THREE.MeshStandardMaterial({ 
            color: this.color,
            roughness: 0.3,
            metalness: 0.1,
            transparent: false, // Garante que não seja transparente
            opacity: 1.0, // Opacidade total
            side: this.halfSphere ? THREE.DoubleSide : THREE.FrontSide // Para meia esfera, renderiza ambos os lados
        });

        const sphere = new THREE.Mesh(geometry, material);
        this.add(sphere);
    }

    /**
     * Updates the sphere color
     * @param {number} color - The new color in hexadecimal
     */
    updateColor(color) {
        this.color = color;
        this.children[0].material.color.set(color);
    }
}