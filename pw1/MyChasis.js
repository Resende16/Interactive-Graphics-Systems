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
        this.windowMarginW = 0.25
        this.windowMarginH = 0.25

        this.mat = mat ?? new THREE.MeshStandardMaterial({ //difuse walls

            color: 0xffffff,
            roughness: 1,       
            metalness: 0        
            })

        this.build()
        this.buildCutout()
         this.addGlassLayer(); 
    }

    
    // Builds the three "full" wall sides, no cutouts
    build() {
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(this.w, this.h, this.depth),
            this.mat
        )

        wall.position.y = this.h / 2

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
    }

    // Builds the side of the wall with the window cutout
    buildCutout() {

        const newW = this.windowMarginW * this.w
        const newH = this.windowMarginH * this.h
        
        // Top and bottom sides first
        const botWall = new THREE.Mesh(
            new THREE.BoxGeometry(this.w, newH, this.depth),
            this.mat
        )
        botWall.position.z = -this.distance

        const topWall = botWall.clone()
        
        topWall.position.y = this.h - newH/2
        botWall.position.y = newH/2
    
        this.add(botWall)
        this.add(topWall)

        // Now left and right sides
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(newW, this.h, this.depth),
            this.mat
        )
        leftWall.position.z = -this.distance
        leftWall.position.y = this.h / 2

        const rightWall = leftWall.clone()

        leftWall.position.x = this.w/2 - newW/2
        rightWall.position.x = -this.w/2 + newW/2

        this.add(leftWall)
        this.add(rightWall)
    }


     addGlassLayer(thickness = 0.05, color = 0x88ccff, opacity = 0.3) {
        const glassWidth = this.w * (1 - this.windowMarginW);
        const glassHeight = this.h * (1 - this.windowMarginH);

        const glassGeometry = new THREE.BoxGeometry(glassWidth, glassHeight, thickness);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color,
            transparent: true,
            opacity,
            transmission: 0.9, 
            roughness: 0.05,
            metalness: 0,
            reflectivity: 0.5,
            clearcoat: 1,
            clearcoatRoughness: 0.05
        });

        const glass = new THREE.Mesh(glassGeometry, glassMaterial);

        glass.position.set(0, this.h / 2, -this.distance);

        this.add(glass);
        this.glass = glass; 
    }
}
