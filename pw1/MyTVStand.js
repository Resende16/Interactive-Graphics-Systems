import * as THREE from 'three';

export class MyTVStand extends THREE.Group {
    constructor(app) {
        super()
        this.app = app

        // Stand
        this.standWidth = 8
        this.standHeight = 1
        this.standDepth = 2

        // Legs
        this.legRadius = 0.1
        this.legHeight = 0.8

        // Materials
        this.matStand = new THREE.MeshStandardMaterial({ 
            color: 0x6a3d01, 
            roughness: 0.7,
            metalness: 0.3
        })
        
        this.matLeg = new THREE.MeshStandardMaterial({ 
            color: 0x6a3d01, 
            roughness: 0.8,
            metalness: 0.2
        })

        this.makeStand();
        this.makeLegs();
    }

    makeStand() {
        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(this.standWidth, this.standHeight, this.standDepth),
            this.matStand
        )

        stand.position.y = this.legHeight + this.standHeight / 2;
        this.add(stand)
    }

    makeLegs() {
        const x = this.standWidth / 2 - this.legRadius
        const z = this.standDepth / 2 - this.legRadius

        this.add(
            this.makeLeg(x, z),
            this.makeLeg(-x, z),
            this.makeLeg(x, -z),
            this.makeLeg(-x, -z)
        )
    }

    makeLeg(x, z) {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(this.legRadius, this.legRadius, this.legHeight, 16),
            this.matLeg
        )
        
        leg.position.set(x, this.legHeight / 2, z)
        return leg
    }
}