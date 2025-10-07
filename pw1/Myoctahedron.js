import * as THREE from 'three';

export class Myoctahedron extends THREE.Group {
    constructor(app, size = 1, color = 0xffaa00, transparent = false, opacity = 0.5) {
        super();
        this.app = app;
        this.size = size;
        this.color = color;
        this.transparent = transparent;
        this.opacity = opacity;
        this.createPolyhedron();
    }

    createPolyhedron() {
        const vertices = [
            1, 0, 0,   // 0: Right
            -1, 0, 0,   // 1: Left
            0, 1, 0,   // 2: Top
            0, -1, 0,   // 3: Bottom
            0, 0, 1,   // 4: Front
            0, 0, -1    // 5: Back
        ];

        // Face indices (8 triangular faces)
        const indices = [
            // Top faces
            2, 0, 4,    // Top-Right-Front
            2, 4, 1,    // Top-Front-Left
            2, 1, 5,    // Top-Left-Back
            2, 5, 0,    // Top-Back-Right

            // Bottom faces
            3, 4, 0,    // Bottom-Front-Right
            3, 1, 4,    // Bottom-Left-Front
            3, 5, 1,    // Bottom-Back-Left
            3, 0, 5     // Bottom-Right-Back
        ];

        // Create polyhedron geometry
        const geometry = new THREE.PolyhedronGeometry(vertices, indices, this.size, 0);

        // Material
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.3,
            metalness: 0.1,
            side: THREE.DoubleSide,
            transparent: this.transparent,
            opacity: this.opacity
        });

        if (!this.transparent) {
            material.emissive = new THREE.Color(this.color);
            material.emissiveIntensity = 10;
        }
        const mesh = new THREE.Mesh(geometry, material);
        this.add(mesh);
    }

    updateColor(color) {
        this.color = color;
        // Garante que o material existe e aceita a cor
        if (this.children[0] && this.children[0].material) {
            this.children[0].material.color.set(color);
            this.children[0].material.needsUpdate = true;
        }
    }

    setTransparency(transparent, opacity = 0.5) {
        this.transparent = transparent;
        this.opacity = opacity;
        this.children[0].material.transparent = transparent;
        this.children[0].material.opacity = opacity;
        this.children[0].material.needsUpdate = true;
    }

    toggleTransparency() {
        this.setTransparency(!this.transparent, this.opacity);
    }
}