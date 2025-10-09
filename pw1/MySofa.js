import * as THREE from 'three';

export class MySofa extends THREE.Group {
    constructor(app, color = 0xeedcc4) {
        super()
        this.app = app

        this.sofaColor = color
        this.matSofa = new THREE.MeshStandardMaterial({ 
            color: this.sofaColor,
            roughness: 0.8,
            metalness: 0.1
        })
        
        this.matCushion = new THREE.MeshStandardMaterial({ 
            color: 0xaedbea,
            roughness: 0.9,
            metalness: 0.0
        })

        this.seatHeight = 0.8
        this.seatDepth = 3
        this.backHeight = 2.5
        this.backThickness = 0.3
        this.armrestHeight = 2.0
        this.armrestWidth = 0.4

        this.mainLength = 10
    
        this.makeSofa();
    }

    makeSofa() {
        this.makeMainSection();
        
        this.addCushions();
    }

    makeMainSection() {
        const seatWidth = this.mainLength / 3;
        const gap = 0.02;

        for (let i = 0; i < 3; i++) {
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(seatWidth - gap, this.seatHeight, this.seatDepth),
                this.matSofa
            )
            const xPos = (i * seatWidth) + (seatWidth / 2);
            seat.position.set(xPos, this.seatHeight/2, 0)
            this.add(seat)

            const back = new THREE.Mesh(
                new THREE.BoxGeometry(seatWidth - gap, this.backHeight, this.backThickness),
                this.matSofa
            )
            back.position.set(xPos, this.seatHeight + this.backHeight/2, -this.seatDepth/2 + this.backThickness/2)
            this.add(back)

            this.addRoundedFront(xPos, seatWidth - gap);
        }

        const rightArm = new THREE.Mesh(
            new THREE.BoxGeometry(this.armrestWidth, this.armrestHeight, this.seatDepth),
            this.matSofa
        )
        rightArm.position.set(this.mainLength - this.armrestWidth/2, this.armrestHeight/2, 0)
        this.add(rightArm)

        const leftArm = new THREE.Mesh(
            new THREE.BoxGeometry(this.armrestWidth, this.armrestHeight, this.seatDepth),
            this.matSofa
        )
        leftArm.position.set(this.armrestWidth/2, this.armrestHeight/2, 0)
        this.add(leftArm)

        this.addLegs(this.mainLength, 0);
    }

    addRoundedFront(centerX, width) {
        const frontRadius = this.seatHeight / 2;
        const front = new THREE.Mesh(
            new THREE.CylinderGeometry(frontRadius, frontRadius, width, 8),
            this.matSofa
        )
        front.rotation.z = Math.PI / 2;
        front.position.set(centerX, frontRadius, this.seatDepth/2 - frontRadius/2);
        this.add(front);
    }

    addCushions() {
        const cushionRadius = 1;
        const cushionHeight = 0.40;
        const seatWidth = this.mainLength / 3;

        const cushionPositions = [
            seatWidth / 2,
            this.mainLength - seatWidth / 2 
        ];

        cushionPositions.forEach(xPos => {
            const cushion = new THREE.Mesh(
                new THREE.CylinderGeometry(cushionRadius, cushionRadius, cushionHeight, 16),
                this.matCushion
            )
            cushion.position.set(
                xPos, 
                this.seatHeight + cushionHeight/2 + 0.05, 
                -this.seatDepth/18 
            )
            this.add(cushion);

            this.addCushionDetail(xPos, cushionRadius, cushionHeight);
        });
        
    }

    addCushionDetail(xPos, radius, height) {
        const button = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0xaedbea })
        )
        button.position.set(
            xPos,
            this.seatHeight + height + 0.05,
            -this.seatDepth/4
        )
        this.add(button);
    }

    addLegs(length, zOffset) {
        const legRadius = 0.08
        const legHeight = 0.15
        const legPositions = [
            [this.armrestWidth, -legHeight/2, -this.seatDepth/2 + legRadius], 
            [length - this.armrestWidth, -legHeight/2, -this.seatDepth/2 + legRadius], 
            [this.armrestWidth, -legHeight/2, this.seatDepth/2 - legRadius], 
            [length - this.armrestWidth, -legHeight/2, this.seatDepth/2 - legRadius] 
        ]

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 8),
                this.matSofa
            )
            leg.position.set(pos[0], pos[1], pos[2] + zOffset)
            this.add(leg)
        })
    }

    /**
     * Updates the sofa color
     * @param {number} color - The new color in hexadecimal
     */
    updateColor(color) {
        this.sofaColor = color
        this.matSofa.color.set(color)
    }

    /**
     * Updates the cushion color
     * @param {number} color - The new color in hexadecimal
     */
    updateCushionColor(color) {
        this.matCushion.color.set(color)
    }
}