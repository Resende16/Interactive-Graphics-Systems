import * as THREE from 'three';

export class FishLODHelper {
    static createLowPoly(color = 0xff8844) {
        const geo = new THREE.IcosahedronGeometry(0.5, 0);
        const mat = new THREE.MeshStandardMaterial({
            color,
            flatShading: true
        });
        return new THREE.Mesh(geo, mat);
    }

    static createMidPoly(color = 0xff8844) {
        const geo = new THREE.BoxGeometry(1.2, 0.4, 0.3);
        const mat = new THREE.MeshStandardMaterial({
            color,
            flatShading: true
        });
        return new THREE.Mesh(geo, mat);
    }
}
