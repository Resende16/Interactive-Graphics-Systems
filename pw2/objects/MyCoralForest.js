import * as THREE from 'three';
import { MyCoral } from './MyCoral.js';

export class MycoralForest {
    constructor(app, color = 0xff6699, size = 1) {
        this.app = app;
        this.color = color;
        this.size = size;
        this.materials = []
    }

    randomizeColor(baseColor) {
        const c = new THREE.Color(baseColor);
        const hsl = {};
        c.getHSL(hsl);

        hsl.h += (Math.random() - 0.5) * 1.4;  
        hsl.s += (Math.random() - 0.5) * 0.60; 
        hsl.l += (Math.random() - 0.5) * 0.90; 

        hsl.h = THREE.MathUtils.clamp(hsl.h, 0, 1);
        hsl.s = THREE.MathUtils.clamp(hsl.s, 0, 1);
        hsl.l = THREE.MathUtils.clamp(hsl.l, 0, 1);

        return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
    }



    createForest(baseHeight = -2, positions = []) {
        const group = new THREE.Group();

        const randomizeColor = (baseColor) => {
            const c = new THREE.Color(baseColor);
            const hsl = {};
            c.getHSL(hsl);

            hsl.h += (Math.random() - 0.5) * 0.1;
            hsl.s += (Math.random() - 0.5) * 0.2;
            hsl.l += (Math.random() - 0.5) * 0.1;

            hsl.h = THREE.MathUtils.clamp(hsl.h, 0, 1);
            hsl.s = THREE.MathUtils.clamp(hsl.s, 0, 1);
            hsl.l = THREE.MathUtils.clamp(hsl.l, 0, 1);

            return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
        };

        for (const pos of positions) {
            const colorVar = randomizeColor(this.color);


            const coral = new MyCoral(
                this.app,
                colorVar,
                this.size * (0.8 + Math.random() * 0.4)
            );
            const coralGroup = coral.createCoral(3 + Math.floor(Math.random() * 2));

            this.materials.push(coral.material);

            coralGroup.position.set(pos.x, baseHeight, pos.z);
            coralGroup.rotation.y = Math.random() * Math.PI * 2;

            group.add(coralGroup);
        }


        return group;
    }
    setWireframeAll(value) {
        for (const mat of this.materials) {
            mat.wireframe = value;
        }
    }
}
