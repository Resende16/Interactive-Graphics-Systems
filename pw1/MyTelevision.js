import { MyPainting } from './MyPainting.js';

export class MyTelevision extends MyPainting {
    // based on MyPainting!
    constructor(app, imagePath, matFrame, w, h, d, fw, fh, fd) {
        super(app, imagePath, matFrame, w, h, d, fw, fh, fd)

        this.rotation.x = Math.PI / 2
        this.rotation.y = Math.PI / 2
    }

    // todo: need to fix this
    /**
     * Liga/desliga a TV (turn the TV on/off)
     * @param {boolean} isOn - true for on, false for off
     */
    toggleTV(isOn) {
        if (isOn) {
            //this.updateScreenColor(0x4466ff);  // Change color to blue when the TV is on
        } else {
            //this.updateScreenColor(0x111122);  // Very dark blue when the TV is off
        }
    }
}
