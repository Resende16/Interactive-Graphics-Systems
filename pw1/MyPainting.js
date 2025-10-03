
import * as THREE from 'three';

export class MyPainting extends THREE.Group {
    constructor(app, fw, fh, fd, imagePath, matFrame) {
        super()
        this.app = app

        // Painting itself
        this.w = 3
        this.h = 4
        this.d = 0.05

        // Frame
        this.fw = fw ?? 0.3
        this.fh = fh ?? 0.3
        this.fd = fd ?? 0.15

        // Materials
        let defaultMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
        this.mat = defaultMat // Será atualizado quando a imagem carregar
        this.matFrame = matFrame ?? new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // Madeira para a moldura

        this.imagePath = imagePath;
        
        this.loadPaintingTexture();
    }

    loadPaintingTexture() {
        if (this.imagePath) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                this.imagePath,
                (texture) => {
                    // Cria material com a textura da imagem
                    this.mat = new THREE.MeshStandardMaterial({ 
                        map: texture,
                        side: THREE.DoubleSide
                    });
                    
                    // Constrói o painting depois da textura carregar
                    this.makePainting();
                    this.makeFrame();
                },
                undefined,
                (error) => {
                    console.error('Erro a carregar imagem do painting:', error);
                    // Fallback: usa cor sólida
                    this.mat = new THREE.MeshStandardMaterial({ color: 0x3498db }); // Azul como fallback
                    this.makePainting();
                    this.makeFrame();
                }
            );
        } else {
            // Sem path, usa material padrão
            this.makePainting();
            this.makeFrame();
        }
    }

    makePainting() {
        const painting = new THREE.Mesh(
            new THREE.BoxGeometry(this.w, this.h, this.d),
            this.mat
        )
        
        painting.position.z = this.fd/2 - this.d/2
        this.add(painting)
    }

    makeFrame() {
        const outerW = this.w + 2* this.fw
        const outerH = this.h + 2* this.fh

        // utility
        const makeStrip = (geo, px, py, pz) => {
            const m = new THREE.Mesh(geo, this.matFrame)
            m.position.set(px, py, pz)
            return m
        }

        const geoV = new THREE.BoxGeometry(outerW, this.fh, this.fd)
        const geoH = new THREE.BoxGeometry(this.fw, outerH, this.fd)

        const top = makeStrip(geoV, 0, this.h/2 + this.fh/2, 0);
        const bottom = makeStrip(geoV, 0, -this.h/2 - this.fh/2, 0);

        const left = makeStrip(geoH, -this.w/2 - this.fw/2, 0, 0);
        const right = makeStrip(geoH, this.w/2 + this.fw/2, 0, 0);

        this.add(left, right, top, bottom)
    }
}
