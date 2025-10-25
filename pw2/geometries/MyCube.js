// MyCube.js
import * as THREE from 'three';

class MyCube {
    constructor(app,size) {
        this.app = app;
        this.mesh = null;
        this.material = null;
        
        this.properties = {
            diffuseColor: "#b8f5ff",
            transparency: 0.3,
            size: size
        };
    }

    init() {
        // Create the cube Geometry
        const geometry = new THREE.BoxGeometry(
            this.properties.size, 
            this.properties.size, 
            this.properties.size
        );

        // Create Transparency Material
        this.material = new THREE.MeshPhongMaterial({
            color: this.properties.diffuseColor,
            transparent: true,
            opacity: this.properties.transparency,
            specular: 0x222222,
            shininess: 30
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
        
        this.mesh.position.set(0, 0, 0);

        this.app.scene.add(this.mesh);

        this.addLights();
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.app.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.app.scene.add(directionalLight);
    }

    updateMaterial() {
        if (this.material) {
            this.material.color.set(this.properties.diffuseColor);
            this.material.opacity = this.properties.transparency;
            this.material.needsUpdate = true;
        }
    }

    updateSize() {
        if (this.mesh) {
            this.app.scene.remove(this.mesh);
            this.init();
        }
    }

    getProperties() {
        return this.properties;
    }
}

export { MyCube };