import * as THREE from 'three';

export class MyTable extends THREE.Group {
    constructor(app) {
        super()
        this.app = app

        // Tabletop
        this.topX = 5
        this.topY = 0.3
        this.topZ = 8

        // Table legs
        this.legHeight = 3
        this.legRadius = 0.15

        // Materials
        this.matTop = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            map: null
        })
        this.matLeg = new THREE.MeshStandardMaterial({ color: 0x8B4513 })

        this.loadTextures();
    }

    loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(
            './textures/tampomesa.jpg', 
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 1); 
                this.matTop.map = texture;
                this.matTop.needsUpdate = true;
                
                this.makeTop();
                this.makeLegs();
            },
            undefined,
            (error) => {
                this.makeTop();
                this.makeLegs();
            }
        );
    }

    makeTop() {
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(this.topX, this.topY, this.topZ),
            this.matTop
        )

        top.position.y = this.legHeight
        this.add(top)
    }

    makeLegs() {
        const x = this.topX/2 - this.legRadius
        const z = this.topZ/2 - this.legRadius

        this.add(
            this.makeLeg( x,  z),
            this.makeLeg(-x,  z),
            this.makeLeg( x, -z),
            this.makeLeg(-x, -z)
        )
    }

    makeLeg(x, z) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(this.legRadius, this.legRadius, this.legHeight, 50),
        this.matLeg
      )
      
      leg.position.set(x, this.legHeight /2, z)
      return leg
    }
}
