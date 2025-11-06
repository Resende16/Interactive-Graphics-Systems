

import * as THREE from 'three';

class MyPanorama {
    constructor(app, cubeSize) {
        this.app = app;
        this.cubeSize = cubeSize;
        this.sphereMesh = null;
        this.material = null;
        this.enabled = true;
        
        this.properties = {
            texturePath: './textures/mar.jpg',
            radius: cubeSize * 2,
            enabled: true
        };
    }   

    init() {
        const geometry = new THREE.SphereGeometry(this.properties.radius, 64, 32);

        const loader = new THREE.TextureLoader();
        const panoramaTexture = loader.load(
            this.properties.texturePath,
            () => { console.log('Panorama texture loaded successfully:', this.properties.texturePath); },
            undefined,
            (error) => {
                console.error('Error loading panorama texture:', error);
                console.log('Make sure the texture file exists at:', this.properties.texturePath);
            }
        );

        panoramaTexture.colorSpace = THREE.SRGBColorSpace;

        this.material = new THREE.MeshBasicMaterial({
            map: panoramaTexture,
            side: THREE.BackSide,   // esfera “virada” para dentro
            fog: false
        });

        this.sphereMesh = new THREE.Mesh(geometry, this.material);
        this.sphereMesh.rotation.y = Math.PI / 2;
        this.app.scene.add(this.sphereMesh);

        this.addUnderwaterFog();
    }

    addUnderwaterFog() {
        const fogColor = 0x0a4f5c; 
        const fogNear = this.cubeSize * 2;    
        const fogFar = this.cubeSize * 4;    
        this.app.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    }

    setTexture(texturePath) {
        this.properties.texturePath = texturePath;
        
        if (this.material) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                texturePath,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    this.material.map = texture;
                    this.material.needsUpdate = true;
                    console.log('Panorama texture updated successfully:', texturePath);
                },
                undefined,
                (error) => {
                    console.error('Error loading new panorama texture:', error);
                }
            );
        }
    }

    setRadius(radius) {
        if (this.sphereMesh) {
            this.app.scene.remove(this.sphereMesh);
            this.sphereMesh.geometry.dispose();
            
            const geometry = new THREE.SphereGeometry(radius, 64, 32);
            this.sphereMesh = new THREE.Mesh(geometry, this.material);
            this.sphereMesh.rotation.y = Math.PI / 2;
            this.app.scene.add(this.sphereMesh);
        }
    }

    update() {}

    getProperties() {
        return this.properties;
    }

    dispose() {
        if (this.sphereMesh) {
            this.app.scene.remove(this.sphereMesh);
            this.sphereMesh.geometry.dispose();
            if (this.material.map) {
                this.material.map.dispose();
            }
            this.material.dispose();
        }
        
        // Remove fog
        if (this.app.scene.fog) {
            this.app.scene.fog = null;
        }
    }
}

export { MyPanorama };
