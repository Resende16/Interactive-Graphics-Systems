import * as THREE from 'three';

export class MyPanorama extends THREE.Group {
    constructor(app) {
        super()
        this.app = app

        // Sphere
        this.radius = 200
        this.segmentsW = 60
        this.segmentsH = 40

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
                texture.colorSpace = THREE.SRGBColorSpace;
                this.mat.map = texture;
                this.mat.needsUpdate = true;
                this.makeSphere();
            },
            undefined,
            (error) => {
                console.error('Failed to load panorama texture:', error);
                this.makeSphere();
            }
        );
    }

    makeSphere() {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius, this.segmentsW, this.segmentsH),
            this.mat
        )
        
        this.add(sphere)
    }
}
