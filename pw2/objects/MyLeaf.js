import * as THREE from 'three';

function createLeafGeometry(width = 0.3, length = 0.6, thickness = 0.06, segments = 24) {
    const w = Math.max(0.001, width);
    const L = Math.max(0.001, length);
    const t = Math.max(0.001, thickness);

    const pts = [];
    const N = 16;
    for (let i = 0; i <= N; i++) {
        const u = i / N; 
        const radius = (w/2) * Math.sin(Math.PI * u) ** 0.85;
        const bulge  = t * Math.sin(Math.PI * u);
        pts.push(new THREE.Vector2(radius + bulge*0.15, u * L));
    }

    const geom = new THREE.LatheGeometry(pts, segments);
    geom.rotateX(Math.PI/2);
    geom.computeVertexNormals();
    return geom;
}

export { createLeafGeometry };
