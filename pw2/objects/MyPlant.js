// Plant.js
import * as THREE from 'three';
import { createLeafGeometry } from '../objects/MyLeaf.js';


class Plant {
    constructor(app, cubeSize, opts = {}) {
        this.app = app;
        this.cubeSize = cubeSize;
        this.group = new THREE.Group();

        this.options = Object.assign({
            stemColor: '#864f19',
            leafColor: '#7ecb7a',
            leafEdgeColor: '#a8e6a3',
            baseHeight: cubeSize * 0.25,       
            stemRadius: cubeSize * 0.010,
            levels: 12,                         
            leavesPerLevel: 3,                  
            goldenAngle: Math.PI * (3 - Math.sqrt(5)), 
            leafLength: cubeSize * 0.08,
            leafWidth: cubeSize * 0.03,
            leafThickness: cubeSize * 0.012,
            randomTilt: 0.25,                   
            taper: 0.75                         
        }, opts);
    }

    init(position = new THREE.Vector3()) {
        const h = this.options.baseHeight;
        const stemMat = new THREE.MeshStandardMaterial({ color: this.options.stemColor, roughness: 0.9, metalness: 0 });
        const stemGeo = new THREE.CylinderGeometry(this.options.stemRadius * 0.8, this.options.stemRadius, h, 8, 1, true);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = h * 0.5;
        this.group.add(stem);

        const leafGeo = createLeafGeometry(this.options.leafWidth, this.options.leafLength, this.options.leafThickness, 24);

        const texLoader = new THREE.TextureLoader();
        const leafTex = texLoader.load('./textures/leaf.jpg', () => {
        console.log('Leaf texture loaded');
        });
        leafTex.colorSpace = THREE.SRGBColorSpace;
        leafTex.wrapS = leafTex.wrapT = THREE.MirroredRepeatWrapping; 
        leafTex.repeat.set(1, 1);
        if (this.app?.renderer?.capabilities?.getMaxAnisotropy) {
        leafTex.anisotropy = this.app.renderer.capabilities.getMaxAnisotropy();
        }

        const leafMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: leafTex,
        roughness: 0.7,
        metalness: 0.0
        });

        let angle = 0;
        for (let level = 0; level < this.options.levels; level++) {
            const t = level / (this.options.levels - 1);       
            const y = (t * h);                                   
            const scale = (1.0 - (1.0 - this.options.taper) * t);          

            const leavesInRing = this.options.leavesPerLevel;
            for (let i = 0; i < leavesInRing; i++) {
                const a = angle + (i * (2 * Math.PI / leavesInRing));
                const ringRadius = this.options.leafLength * (1.0 - 0.55 * t);

                const attach = this.options.stemRadius + this.options.leafThickness * 0.6;

                const xzRadius = Math.max(attach, ringRadius * 0.15);

                const x = Math.cos(a) * xzRadius;
                const z = Math.sin(a) * xzRadius;

                const leaf = new THREE.Mesh(leafGeo, leafMat.clone());

                leaf.material.color
                .set(this.options.leafColor)
                .lerp(new THREE.Color(this.options.leafEdgeColor), 0.12);

                const base = new THREE.Color(this.options.leafColor);
                const edge = new THREE.Color(this.options.leafEdgeColor);
                leaf.material.color.lerpColors(base, edge, 0.15 + 0.15 * Math.random());

                leaf.scale.setScalar(scale * (0.85 + Math.random()*0.15));
                leaf.position.set(x, y, z);

                leaf.lookAt(new THREE.Vector3(0, y + this.options.leafLength * 0.4, 0));
                leaf.rotateX(-Math.PI/2);
                leaf.rotateZ((Math.random()-0.5) * this.options.randomTilt);
                leaf.rotateY((Math.random()-0.5) * this.options.randomTilt);

                this.group.add(leaf);
            }
            angle += this.options.goldenAngle;
        }

        const baseY = -this.cubeSize/2 + this.cubeSize/10;
        this.group.position.copy(position);
        this.group.position.y = baseY;

        // shadows
        this.group.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

        this.app.scene.add(this.group);
    }
    

    dispose() {
        if (!this.group) return;
        this.app.scene.remove(this.group);
        this.group.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
        this.group = null;
    }
    
    setWireframeAll(value) {
    if (!this.group) return;
    this.group.traverse(o => {
      if (o.isMesh && o.material) {
        o.material.wireframe = value;
        o.material.needsUpdate = true;
      }
    });
  }
}

export { Plant };
