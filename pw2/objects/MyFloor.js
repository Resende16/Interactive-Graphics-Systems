import * as THREE from 'three';

class MyFloor {
    constructor(app,cubeSize) {
        this.app = app;
        this.topMesh = null;
        this.bottomMesh = null;
        this.sidesMesh = null;
        this.sandGroup = null;
        this.material = null;
        this.cubeSize = cubeSize;
        
        this.properties = {
            width: this.cubeSize - 0.1,
            depth: this.cubeSize - 0.1,
            sandHeight:this.cubeSize/10,
            segments: 40, 
            heightVariation: 0.1, 
            textureRepeat: 4
        };
    }

    init() {
        // Create a group to hold all sand parts
        this.sandGroup = new THREE.Group();
        
        const textureLoader = new THREE.TextureLoader();
        const sandTexture = textureLoader.load(
            './textures/sand.jpg', 
            (texture) => {
                console.log('Sand texture loaded successfully');
            },
            undefined,
            (error) => {
                console.error('Error loading sand texture:', error);
            }
        );

        sandTexture.wrapS = THREE.RepeatWrapping;
        sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(this.properties.textureRepeat, this.properties.textureRepeat);

        // Create material
        this.material = new THREE.MeshStandardMaterial({
            map: sandTexture,
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        const topGeometry = new THREE.PlaneGeometry(
            this.properties.width,
            this.properties.depth,
            this.properties.segments,
            this.properties.segments
        );

        // Make the top surface irregular
        const positions = topGeometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            
            const wave1 = Math.sin(x * 1.5) * Math.cos(y * 1.5) * this.properties.heightVariation;
            const wave2 = Math.sin(x * 2.3 + y * 1.7) * this.properties.heightVariation * 0.5;
            const wave3 = Math.cos(x * 3.1 - y * 2.2) * this.properties.heightVariation * 0.3;
            const randomness = (Math.random() - 0.5) * this.properties.heightVariation * 0.4;
            
            const z = wave1 + wave2 + wave3 + randomness;
            positions.setZ(i, z);
        }
        
        topGeometry.computeVertexNormals();
        topGeometry.attributes.position.needsUpdate = true;

        this.topMesh = new THREE.Mesh(topGeometry, this.material);
        this.topMesh.rotation.x = -Math.PI / 2;
        this.topMesh.receiveShadow = true;
        this.sandGroup.add(this.topMesh);

        const bottomGeometry = new THREE.PlaneGeometry(
            this.properties.width,
            this.properties.depth
        );
        
        this.bottomMesh = new THREE.Mesh(bottomGeometry, this.material);
        this.bottomMesh.rotation.x = Math.PI / 2; // Face down
        this.bottomMesh.position.y = -this.properties.sandHeight;
        this.sandGroup.add(this.bottomMesh);

        const sidesGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const uvs = [];
        const indices = [];

        const hw = this.properties.width / 2;
        const hd = this.properties.depth / 2;
        const h = this.properties.sandHeight;

        // Front wall
        vertices.push(
            -hw, 0, hd,
            hw, 0, hd,
            hw, -h, hd,
            -hw, -h, hd
        );
        uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        indices.push(0, 2, 1, 0, 3, 2);

        // Back wall
        const offset1 = 4;
        vertices.push(
            hw, 0, -hd,
            -hw, 0, -hd,
            -hw, -h, -hd,
            hw, -h, -hd
        );
        uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        indices.push(
            offset1 + 0, offset1 + 2, offset1 + 1,
            offset1 + 0, offset1 + 3, offset1 + 2
        );

        // Right wall
        const offset2 = 8;
        vertices.push(
            hw, 0, hd,
            hw, 0, -hd,
            hw, -h, -hd,
            hw, -h, hd
        );
        uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        indices.push(
            offset2 + 0, offset2 + 2, offset2 + 1,
            offset2 + 0, offset2 + 3, offset2 + 2
        );

        // Left wall
        const offset3 = 12;
        vertices.push(
            -hw, 0, -hd,
            -hw, 0, hd,
            -hw, -h, hd,
            -hw, -h, -hd
        );
        uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
        indices.push(
            offset3 + 0, offset3 + 2, offset3 + 1,
            offset3 + 0, offset3 + 3, offset3 + 2
        );

        sidesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        sidesGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        sidesGeometry.setIndex(indices);
        sidesGeometry.computeVertexNormals();

        this.sidesMesh = new THREE.Mesh(sidesGeometry, this.material);
        this.sandGroup.add(this.sidesMesh);

        const y = -this.cubeSize/2 ;

        this.sandGroup.position.set(0, y + this.properties.sandHeight, 0);

        this.app.scene.add(this.sandGroup);
    }

    updateIrregularity() {
        if (this.topMesh) {
            const positions = this.topMesh.geometry.attributes.position;
            
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                
                const wave1 = Math.sin(x * 1.5) * Math.cos(y * 1.5) * this.properties.heightVariation;
                const wave2 = Math.sin(x * 2.3 + y * 1.7) * this.properties.heightVariation * 0.5;
                const wave3 = Math.cos(x * 3.1 - y * 2.2) * this.properties.heightVariation * 0.3;
                const randomness = (Math.random() - 0.5) * this.properties.heightVariation * 0.4;
                
                const z = wave1 + wave2 + wave3 + randomness;
                positions.setZ(i, z);
            }
            
            this.topMesh.geometry.computeVertexNormals();
            this.topMesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    updateTextureRepeat() {
        if (this.material && this.material.map) {
            this.material.map.repeat.set(
                this.properties.textureRepeat,
                this.properties.textureRepeat
            );
        }
    }

    getProperties() {
        return this.properties;
    }

    dispose() {
        if (this.sandGroup) {
            this.app.scene.remove(this.sandGroup);
            this.topMesh.geometry.dispose();
            this.bottomMesh.geometry.dispose();
            this.sidesMesh.geometry.dispose();
            if (this.material.map) this.material.map.dispose();
            this.material.dispose();
        }
    }
}

export { MyFloor };