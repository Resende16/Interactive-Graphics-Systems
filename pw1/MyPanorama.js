import * as THREE from 'three';

export class MyPanorama extends THREE.Group {
    constructor(app) {
        super()
        this.app = app

        // Sphere
        this.radius = 50
        this.widthSegments = 60
        this.heightSegments = 40

        // Material
        this.mat = new THREE.MeshBasicMaterial({ 
            side: THREE.BackSide,
            map: null
        })

        this.loadTexture();
    }

    loadTexture() {
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(
            './textures/panorama.jpg', 
            (texture) => {
                this.mat.map = texture;
                this.mat.needsUpdate = true;
                this.makeSphere();
            },
            undefined,
            (error) => {
                console.error('Error loading panorama texture:', error);
                this.makeSphere();
            }
        );
    }

    makeSphere() {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, this.widthSegments, this.heightSegments),
            this.mat
        )
        
        this.add(sphere)
    }
}