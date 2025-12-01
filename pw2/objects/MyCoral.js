import * as THREE from 'three';

export class MyCoral {
    constructor(app, color = 0xff6699, size = 1) {
        this.app = app;
        this.color = color;
        this.size = size;
        this.material = null; 
    }

    chooseRule(options) {
        const total = options.reduce((sum, o) => sum + o.prob, 0);
        let r = Math.random() * total;
        for (const opt of options) {
            r -= opt.prob;
            if (r <= 0) return opt.rule;
        }
        return options[options.length - 1].rule;
    }

    createCoral(iterations = 4) {
        const baseAngle = THREE.MathUtils.degToRad(40);
        const variableAngle = THREE.MathUtils.degToRad(30);

        const rules = {
            'X': [
                { prob: 0.25, rule: 'F[+X][-X][&X][^X]' },      
                { prob: 0.25, rule: 'F[+X][-X][*X][~X]' },      
                { prob: 0.25, rule: 'FX' }                    
            ],
            'F': [
                { prob: 0.3, rule: 'F[+F][-F][&F]' },           
                { prob: 0.3, rule: 'F[+F][-F][*F]' },           
                { prob: 0.2, rule: 'F[+F][-F][~F]' },          
                { prob: 0.2, rule: 'F' }                       
            ]
        };

        let current = 'X';
        for (let i = 0; i < iterations; i++) {
            let next = '';
            for (const c of current) next += rules[c] ? this.chooseRule(rules[c]) : c;
            current = next;
        }

        const stack = [];
        const branches = [];
        const q = new THREE.Quaternion();
        const axes = {
            x: new THREE.Vector3(1, 0, 0),
            y: new THREE.Vector3(0, 1, 0),
            z: new THREE.Vector3(0, 0, 1)
        };

        let turtle = { pos: new THREE.Vector3(0, 0, 0), rot: new THREE.Quaternion() };

        let len = 0.25;
        const shrink = 0.55;

        const randomAngle = (base) => base + (Math.random() * 2 - 1) * variableAngle;

        for (const c of current) {
            switch (c) {
                case 'F': {
                    const start = turtle.pos.clone();
                    const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(turtle.rot).multiplyScalar(len);
                    turtle.pos.add(dir);

                    const mat = new THREE.Matrix4();
                    const orient = new THREE.Quaternion().setFromUnitVectors(axes.y, dir.clone().normalize());
                    mat.compose(start, orient, new THREE.Vector3(0.33, len, 0.33));
                    branches.push(mat);
                    break;
                }

                case '+': turtle.rot.multiply(q.setFromAxisAngle(axes.z, randomAngle(baseAngle))); break;
                case '-': turtle.rot.multiply(q.setFromAxisAngle(axes.z, -randomAngle(baseAngle))); break;
                case '&': turtle.rot.multiply(q.setFromAxisAngle(axes.x, randomAngle(baseAngle))); break;
                case '^': turtle.rot.multiply(q.setFromAxisAngle(axes.x, -randomAngle(baseAngle))); break;
                case '*': turtle.rot.multiply(q.setFromAxisAngle(axes.y, randomAngle(baseAngle))); break;
                case '~': turtle.rot.multiply(q.setFromAxisAngle(axes.y, -randomAngle(baseAngle))); break;

                case '[':
                    stack.push({ pos: turtle.pos.clone(), rot: turtle.rot.clone(), len });
                    len *= shrink;
                    break;
                case ']':
                    if (stack.length > 0) {
                        const s = stack.pop();
                        turtle.pos = s.pos;
                        turtle.rot = s.rot;
                        len = s.len;
                    }
                    break;
            }
        }

        const group = new THREE.Group();
        const geo = new THREE.CylinderGeometry(0.028, 0.045, 1, 6, 1, true);
        geo.translate(0, 0.5, 0);

        const mat = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.9,
            metalness: 0.1
        });

        this.material = mat;

        const mesh = new THREE.InstancedMesh(geo, mat, branches.length);

        branches.forEach((m, i) => mesh.setMatrixAt(i, m));
        group.add(mesh);

        group.scale.setScalar(this.size * 0.55);
        group.position.y = -1.8;
        return group;
    }
}