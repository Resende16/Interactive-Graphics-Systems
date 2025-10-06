import * as THREE from 'three';

export class MyTelevision extends THREE.Group {
    constructor(app) {
        super()
        this.app = app

        // Dimensões da TV
        this.screenWidth = 5
        this.screenHeight = 4
        this.screenDepth = 0.2
        
        // Dimensões do corpo da TV
        this.bodyWidth = 3.2
        this.bodyHeight = 2.2
        this.bodyDepth = 0.3

        // Dimensões da base
        this.baseWidth = 1
        this.baseDepth = 0.5
        this.baseHeight = 0.2

        // Materials
        this.matScreen = new THREE.MeshStandardMaterial({ 
            color: 0x000000, // Preto para a tela desligada
            emissive: 0x111122, // Leve emissão azulada
            roughness: 0.1,
            metalness: 0.9
        })
        
        this.matBody = new THREE.MeshStandardMaterial({ 
            color: 0x222222, // Cinza escuro para o corpo
            roughness: 0.6,
            metalness: 0.4
        })
        
        this.matBase = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, // Preto para a base
            roughness: 0.7,
            metalness: 0.3
        })

        this.makeTelevision();
    }

    makeTelevision() {
        // Corpo principal da TV
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(this.bodyWidth, this.bodyHeight, this.bodyDepth),
            this.matBody
        )
        body.position.y = this.baseHeight + this.bodyHeight / 2;
        this.add(body)

        // Tela da TV
        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(this.screenWidth, this.screenHeight, this.screenDepth + 0.01),
            this.matScreen
        )
        screen.position.set(0, this.baseHeight + this.bodyHeight / 2, this.bodyDepth / 2 + 0.01)
        this.add(screen)

        // Base da TV
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(this.baseWidth, this.baseHeight, this.baseDepth),
            this.matBase
        )
        base.position.y = this.baseHeight / 2;
        this.add(base)

        // Adicionar alguns detalhes/controles na parte frontal
        this.addDetails();
    }

    addDetails() {
        // Botão de power (pequeno círculo)
        const powerButton = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        )
        powerButton.position.set(
            -this.bodyWidth / 2 + 0.2,
            this.baseHeight + 0.3,
            this.bodyDepth / 2 + 0.02
        )
        powerButton.rotation.x = Math.PI / 2
        this.add(powerButton)

        // Logo da marca (pequeno retângulo)
        const logo = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.1, 0.02),
            new THREE.MeshStandardMaterial({ color: 0xcccccc })
        )
        logo.position.set(
            0,
            this.baseHeight + 0.1,
            this.bodyDepth / 2 + 0.02
        )
        this.add(logo)
    }

    /**
     * Atualiza a cor da tela (para simular estar ligada)
     * @param {number} color - Cor em hexadecimal
     */
    updateScreenColor(color) {
        this.matScreen.emissive.set(color);
    }

    /**
     * Liga/desliga a TV (muda a emissão da tela)
     * @param {boolean} isOn - true para ligada, false para desligada
     */
    toggleTV(isOn) {
        if (isOn) {
            this.matScreen.emissive.set(0x4466ff); // Azul para tela ligada
        } else {
            this.matScreen.emissive.set(0x111122); // Azul muito escuro para desligada
        }
    }
}