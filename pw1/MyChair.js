import * as THREE from 'three';

export class MyChair extends THREE.Group {
    constructor(app, color = 0x8B4513, rotationY = 0) {
        super()
        this.app = app

        // Chair dimensions
        this.seatWidth = 1.5
        this.seatDepth = 1.5
        this.seatHeight = 0.1
        this.legHeight = 1.2
        this.legRadius = 0.05
        this.backHeight = 2.0
        this.backThickness = 0.1

        // Materials
        this.chairColor = color;
        this.matSeat = new THREE.MeshStandardMaterial({ color: this.chairColor })
        this.matLeg = new THREE.MeshStandardMaterial({ color: this.chairColor })
        this.matBack = new THREE.MeshStandardMaterial({ color: this.chairColor })
        this.matCarpet = new THREE.MeshStandardMaterial()

        this.rotation.y = rotationY

        this.makeSeat()
        this.makeLegs()
        this.makeBack()
        this.addCarpet()
    }

    makeSeat() {
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(this.seatWidth, this.seatHeight, this.seatDepth),
            this.matSeat
        )

        seat.position.y = this.legHeight + this.seatHeight / 2
        this.add(seat)
    }

    makeLegs() {
        const x = this.seatWidth / 2 - this.legRadius
        const z = this.seatDepth / 2 - this.legRadius

        this.add(
            this.makeLeg(x, z),
            this.makeLeg(-x, z),
            this.makeLeg(x, -z),
            this.makeLeg(-x, -z)
        )
    }

    makeLeg(x, z) {
        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(this.legRadius, this.legRadius, this.legHeight, 32),
            this.matLeg
        )
        
        leg.position.set(x, this.legHeight / 2, z)
        return leg
    }

    makeBack() {
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(this.seatWidth, this.backHeight, this.backThickness),
            this.matBack
        )

        back.position.set(
            0, 
            this.legHeight + this.seatHeight + this.backHeight / 2, 
            -this.seatDepth / 2 + this.backThickness / 2
        )
        this.add(back)
    }

    // Adds a carpet on top of the seat with a texture
    addCarpet() {
        const carpetWidth = 0.9 * this.seatWidth
        const carpetDepth = 0.9 * this.seatDepth
        const carpetThickness = 0.05;

        // Load carpet texture
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load(
            './textures/carpet.jpg',
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter

                this.matCarpet.map = texture
                this.matCarpet.needsUpdate = true
            },
            undefined,
            (error) => {
                //
            }
        );

        const carpet = new THREE.Mesh(
            new THREE.BoxGeometry(carpetWidth, carpetDepth, carpetThickness),
            this.matCarpet
        )

        // Position it just above the seat
        carpet.position.set(0, this.legHeight + this.seatHeight + carpetThickness / 2, 0)
        carpet.rotation.x = -Math.PI / 2

        this.add(carpet)
    }

    // Updates the chair color
    updateColor(color) {
        this.chairColor = color
        this.matSeat.color.set(color)
        this.matLeg.color.set(color)
        this.matBack.color.set(color)
    }
}
