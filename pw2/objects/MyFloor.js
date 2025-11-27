import * as THREE from 'three';

// SimplexNoise mínimo 2D (inline!)
function SimplexNoise() {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0), G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const grad3 = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
    const perm = [];
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    this.noise = function (xin, yin) {
        let n0, n1, n2;
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s), j = Math.floor(yin + s);
        const t = (i + j) * G2;
        const X0 = i - t, Y0 = j - t;
        const x0 = xin - X0, y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
        const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2, y2 = y0 - 1.0 + 2.0 * G2;
        const ii = i & 255, jj = j & 255;
        const gi0 = perm[ii + perm[jj]] % 12;
        const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
        const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0; else {
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0; else {
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0; else {
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
        }
        return 70.0 * (n0 + n1 + n2);
    };
}

class MyFloor {
    constructor(app, cubeSize) {
        this.app = app;
        this.topMesh = null;
        this.bottomMesh = null;
        this.sidesMesh = null;
        this.sandGroup = null;
        this.material = null;
        this.cubeSize = cubeSize;
        this.simplex = new SimplexNoise();

        this.properties = {
            width: this.cubeSize - 0.1,
            depth: this.cubeSize - 0.1,
            sandHeight: this.cubeSize / 10,
            segments: 40,
            heightVariation: 0.1,
            textureRepeat: 4
        };
    }

    init() {
        this.sandGroup = new THREE.Group();

        const textureLoader = new THREE.TextureLoader();
        const sandTexture = textureLoader.load(
            './textures/sand.jpg',
            (texture) => { console.log('Sand texture loaded successfully'); },
            undefined,
            (error) => { console.error('Error loading sand texture:', error); }
        );

        sandTexture.wrapS = THREE.RepeatWrapping;
        sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(this.properties.textureRepeat, this.properties.textureRepeat);

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

        // Simplex noise for "dunas" naturais
        const positions = topGeometry.attributes.position;
        const scale1 = 0.18, amp1 = this.properties.heightVariation*1.00;
        const scale2 = 0.45, amp2 = this.properties.heightVariation*0.04;
        const simplex = this.simplex;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);

            // 2 camadas para detalhes naturais
            const n =  (simplex.noise(x * scale1, y * scale1) * amp1
                      + simplex.noise(x * scale2, y * scale2) * amp2);
            positions.setZ(i, n);
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

        const y = -this.cubeSize / 2;
        this.sandGroup.position.set(0, y + this.properties.sandHeight, 0);

        this.app.scene.add(this.sandGroup);
    }

    updateIrregularity() {
        if (this.topMesh) {
            const positions = this.topMesh.geometry.attributes.position;
            const scale1 = 0.18, amp1 = this.properties.heightVariation*1.00;
            const scale2 = 0.45, amp2 = this.properties.heightVariation*0.4;
            const simplex = this.simplex;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const n =  (simplex.noise(x * scale1, y * scale1) * amp1
                          + simplex.noise(x * scale2, y * scale2) * amp2);
                positions.setZ(i, n);
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

    setWireframeAll(value) {
    if (!this.sandGroup) return;
    this.sandGroup.traverse(o => {
      if (o.isMesh && o.material) {
        o.material.wireframe = value;
        o.material.needsUpdate = true;
      }
    });
  }
}

export { MyFloor };
