import * as THREE from 'three';

export class MyChasis extends THREE.Group {
    constructor(app, w, h, mat) {
        super()
        this.app = app

        this.w = w ?? 20
        this.h = h ?? 10
        this.depth = 0.3
        this.distance = 10 // distance from origin

        // Window cutout with margin (as a %)
        this.windowMarginW = 0.3
        this.windowMarginH = 0.2

        this.mat = mat ?? new THREE.MeshStandardMaterial({ color: 0xffffff })

        this.build()
    }

    build() {
        // Walls without cutouts

        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(this.w, this.h, this.depth),
            this.mat
        )

        wall.position.y += this.h / 2

        // copied for reuse
        const _wall = wall.clone()
        _wall.position.z = this.distance

        wall.rotation.y = Math.PI / 2
        wall.position.x = this.distance

        // copied for reuse
        const __wall = wall.clone()
        __wall.position.x = -this.distance

        wall.rotation.y = Math.PI / 2

        this.add(wall)
        this.add(_wall)
        this.add(__wall)

        // Wall with cutout for the window
        
        const wallCut = new THREE.Mesh(
            new THREE.BoxGeometry(this.w, this.h, this.depth),
            this.mat
        )
    }
}
