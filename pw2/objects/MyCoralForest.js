import * as THREE from 'three';
import { MyCoral } from './MyCoral.js';

export class MycoralForest {
    constructor(app, color = 0xff6699, size = 1) {
        this.app = app;
        this.color = color; // cor base
        this.size = size;
    }

    /**
     * Cria uma floresta de corais distribuídos aleatoriamente,
     * com cores ligeiramente variadas e sem se sobreporem.
     * 
     * @param {number} area - Largura da área quadrada (ex: 10 → 10x10).
     * @param {number} baseHeight - Altura base do solo.
     * @param {number} count - Número de corais.
     * @param {number} spacing - Distância mínima entre eles.
     */
    createForest(area = 10, baseHeight = -2, count = 20, spacing = 1.5) {
        const group = new THREE.Group();
        const placed = [];

        let attempts = 0;
        const maxAttempts = count * 20; 

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

        while (placed.length < count && attempts < maxAttempts) {
            attempts++;

            const x = (Math.random() - 0.5) * area;
            const z = (Math.random() - 0.5) * area;
            const pos = new THREE.Vector2(x, z);

            const tooClose = placed.some(p => p.distanceTo(pos) < spacing);
            if (tooClose) continue;

            const colorVar = randomizeColor(this.color);

            const coral = new MyCoral(this.app, colorVar, this.size * (0.8 + Math.random() * 0.4));
            const coralMesh = coral.createCoral(3 + Math.floor(Math.random() * 2)); // 3–4 iterações
            coralMesh.position.set(x, baseHeight, z);
            coralMesh.rotation.y = Math.random() * Math.PI * 2;
            group.add(coralMesh);

            placed.push(pos);
        }

        this.app.scene.add(group);
        return group;
    }
}
