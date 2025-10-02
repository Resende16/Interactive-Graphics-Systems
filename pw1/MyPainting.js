import * as THREE from 'three';

export class MyPainting extends THREE.Group {
    constructor(app, fw, fh, fd, mat, matFrame) {
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
        this.mat = mat ?? defaultMat
        this.matFrame = matFrame ?? defaultMat

        this.makePainting()
        this.makeFrame()
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
