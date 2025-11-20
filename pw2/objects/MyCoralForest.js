import * as THREE from 'three';
import { MyCoral } from './MyCoral.js';

export class MycoralForest {
    constructor(app, color = 0xff6699, size = 1) {
        this.app = app;
        this.color = color;
        this.size = size;
    }

    randomizeColor(baseColor)  {
        const c = new THREE.Color(baseColor);
        const hsl = {};
        c.getHSL(hsl);

        hsl.h += (Math.random() - 0.5) * 0.06; 
        hsl.s += (Math.random() - 0.5) * 0.10; 
        hsl.l += (Math.random() - 0.5) * 0.07; // antes 0.1

        hsl.h = THREE.MathUtils.clamp(hsl.h, 0, 1);
        hsl.s = THREE.MathUtils.clamp(hsl.s, 0, 1);
        hsl.l = THREE.MathUtils.clamp(hsl.l, 0, 1);

        return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
    };



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

            const coralMesh = coral.createCoral(3 + Math.floor(Math.random() * 2));

            // aplica posição fixa
            coralMesh.position.set(pos.x, baseHeight, pos.z);
            coralMesh.rotation.y = Math.random() * Math.PI * 2;

            group.add(coralMesh);
        }


        return group;
    }
    // TODO: optimiza the material usage by sharing materials among corals,
     setWireframeAll(value) {
        for (const mat of this.materials) {
            mat.wireframe = value;
        }
    }
}
