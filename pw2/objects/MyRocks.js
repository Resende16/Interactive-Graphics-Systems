import * as THREE from 'three';

class MyRocks {
    constructor(app, cubeSize) {
        this.app = app;
        this.group = null;
        this.cubes = [];
        this.cubeSize = cubeSize;

        this.properties = {
            diffuseColor: "#796e63",
            transparency: 1.0,
            heightRatio: 0.40,
            xzOffsetRatio: { x: -0.25, z: -0.25 },
            scale: 2
        };
    }

    init() {
        // Create a group to hold all rock cubes
        this.group = new THREE.Group();

        // Define multiple cubes with different positions, rotations and sizes
        const cubeData = [
            // Core/center cubes (larger)
            { pos: [0, 0, 0], rot: [0.2, 0.3, 0.1], size: [1.5, 1.3, 1.5] },
            { pos: [0.8, 0.1, 0.5], rot: [0.5, 0.8, 0.3], size: [1.3, 1.1, 1.3] },
            { pos: [-0.6, 0, 0.8], rot: [0.3, 1.2, 0.4], size: [1.4, 1.2, 1.4] },
            { pos: [0.2, 0.3, -0.8], rot: [0.7, 0.4, 0.9], size: [1.2, 1.3, 1.2] },
            { pos: [-0.5, -0.1, -0.6], rot: [0.4, 1.5, 0.2], size: [1.3, 1.2, 1.4] },

            // Medium cubes (fill gaps)
            { pos: [1.1, -0.3, -0.3], rot: [0.6, 0.9, 1.1], size: [1.0, 1.1, 1.0] },
            { pos: [-0.9, 0.2, 0], rot: [0.8, 0.5, 0.7], size: [1.0, 0.9, 1.1] },
            { pos: [0.4, -0.7, 0.8], rot: [1.0, 0.2, 0.5], size: [0.9, 1.0, 0.9] },
            { pos: [-0.2, 0.7, 0.5], rot: [0.3, 1.1, 0.8], size: [1.0, 0.9, 0.9] },
            { pos: [0.7, 0.6, 0.3], rot: [0.9, 0.6, 0.4], size: [0.9, 1.0, 1.0] },

            // Smaller detail cubes
            { pos: [1.4, 0, 0.3], rot: [0.5, 1.3, 0.6], size: [0.7, 0.8, 0.7] },
            { pos: [-1.2, -0.3, 0.5], rot: [1.2, 0.7, 0.9], size: [0.7, 0.7, 0.8] },
            { pos: [0, -1.0, 0], rot: [0.4, 0.8, 1.4], size: [0.8, 0.7, 0.7] },
            { pos: [0.5, 1.0, -0.5], rot: [0.7, 1.0, 0.3], size: [0.7, 0.7, 0.7] },
            { pos: [-0.8, 0.3, -1.0], rot: [1.1, 0.4, 0.8], size: [0.7, 0.8, 0.7] },
            { pos: [1.0, -0.4, 1.0], rot: [0.6, 1.2, 0.5], size: [0.6, 0.7, 0.7] },

            // Very small detail cubes (rough edges)
            { pos: [1.5, 0.5, -0.3], rot: [0.8, 0.5, 1.3], size: [0.5, 0.5, 0.5] },
            { pos: [-1.3, 0.7, -0.3], rot: [1.3, 0.9, 0.6], size: [0.5, 0.5, 0.5] },
            { pos: [0.3, 1.2, 0.3], rot: [0.5, 1.4, 1.0], size: [0.5, 0.5, 0.5] },
            { pos: [-0.5, -1.1, -0.5], rot: [1.0, 0.7, 1.2], size: [0.5, 0.5, 0.5] }
        ];

        // --- TEXTURA DA ROCHA ---
        const loader = new THREE.TextureLoader();
        const rockTex = loader.load('./textures/rocha.jpg', () => {
        console.log('Rock texture loaded');
        });
        rockTex.colorSpace = THREE.SRGBColorSpace;   // cores corretas
        rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
        // repete a textura para não “esticar”; afina à vontade
        rockTex.repeat.set(2.5, 2.5);

        // Se quiseres anisotropy (melhor nitidez em ângulos):
        // rockTex.anisotropy = this.app.renderer.capabilities.getMaxAnisotropy();

        // MATERIAL com textura (podes manter Phong)
        this.material = new THREE.MeshPhongMaterial({
        color: this.properties.diffuseColor, // atua como tint
        map: rockTex,
        transparent: this.properties.transparency < 1.0,
        opacity: this.properties.transparency,
        specular: 0x111111,
        shininess: 10,
        flatShading: true
        });

        // Create all cubes
        cubeData.forEach(data => {
            const geometry = new THREE.BoxGeometry(data.size[0], data.size[1], data.size[2]);
            const mesh = new THREE.Mesh(geometry, this.material);

            mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
            mesh.rotation.set(data.rot[0], data.rot[1], data.rot[2]);

            this.cubes.push(mesh);
            this.group.add(mesh);
        });

        this._fitToCubeAndPlace();
        this.app.scene.add(this.group);
    }



    _fitToCubeAndPlace() {
        const sandHeight = this.cubeSize / 10
        if (!this.group) return;

        const bbox = new THREE.Box3().setFromObject(this.group);
        const originalHeight = Math.max(1e-6, bbox.max.y - bbox.min.y);

        const targetHeight = this.cubeSize * this.properties.heightRatio;
        const scale = targetHeight / originalHeight;

        this.group.scale.setScalar(scale);

        const baseY = -this.cubeSize / 2 + sandHeight;
        const minYScaled = bbox.min.y * scale;

        const posX = this.cubeSize * this.properties.xzOffsetRatio.x;
        const posZ = this.cubeSize * this.properties.xzOffsetRatio.z;
        const posY = baseY - minYScaled;

        this.group.position.set(posX, posY, posZ);
    }

    _placeOnFloor(sandHeight = this.cubeSize / 10) {
        if (!this.group) return;
        this.group.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(this.group);

        const baseY = -this.cubeSize / 2 + sandHeight;
        const minY = bbox.min.y;
        const dy = baseY - minY;

        this.group.position.y += dy;
        this.group.updateMatrixWorld(true);
    }



    updateMaterial() {
        if (this.material) {
            this.material.color.set(this.properties.diffuseColor);
            this.material.opacity = this.properties.transparency;
            this.material.transparent = this.properties.transparency < 1.0;
            this.material.needsUpdate = true;
        }
    }

    updateScale() {
        if (!this.group) return;
        this.group.scale.setScalar(this.properties.scale);
        this._placeOnFloor();
    }

    getProperties() {
        return this.properties;
    }

    dispose() {
        if (this.group) {
            this.app.scene.remove(this.group);
            this.cubes.forEach(cube => {
                cube.geometry.dispose();
            });
            this.material.dispose();
        }
    }
}

export { MyRocks };