// Plant.js
import * as THREE from 'three';
import { createLeafGeometry } from './MyLeaf.js';


class Plant {
    constructor(app, cubeSize, opts = {}) {
        this.app = app;
        this.cubeSize = cubeSize;
        this.group = new THREE.Group();

        this.options = Object.assign({
            stemColor: '#2e6f4e',
            leafColor: '#7ecb7a',
            leafEdgeColor: '#a8e6a3',
            baseHeight: cubeSize * 0.35,       
            stemRadius: cubeSize * 0.015,
            levels: 12,                         
            leavesPerLevel: 3,                  
            goldenAngle: Math.PI * (3 - Math.sqrt(5)), 
            leafLength: cubeSize * 0.15,
            leafWidth: cubeSize * 0.05,
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
        const leafMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.options.leafColor),
            emissive: new THREE.Color(0x000000),
            roughness: 0.7,
            metalness: 0.0
        });

        let angle = 0;
        for (let level = 0; level < this.options.levels; level++) {
            const t = level / (this.options.levels - 1);       
            const y = (t * h);                                   
            const ringRadius = this.options.leafLength * (1.0 - 0.55 * t); 
            const scale = (1.0 - (1.0 - this.options.taper) * t);          

            const leavesInRing = this.options.leavesPerLevel;
            for (let i = 0; i < leavesInRing; i++) {
                const a = angle + (i * (2 * Math.PI / leavesInRing));
                const x = Math.cos(a) * ringRadius * 0.35;
                const z = Math.sin(a) * ringRadius * 0.35;

                const leaf = new THREE.Mesh(leafGeo, leafMat.clone());
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
}

export { Plant };
