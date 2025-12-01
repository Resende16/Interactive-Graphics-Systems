import * as THREE from "three";

export const WaveShaderCoral = {

    uniforms: {
        time:      { value: 0 },
        amplitude: { value: 0.25 },
        frequency: { value: 1.2 },
        speed:     { value: 1.5 },

        baseColor: { value: new THREE.Color(1, 1, 1) }
    },

    vertexShader: `
        uniform float time;
        uniform float amplitude;
        uniform float frequency;
        uniform float speed;

        varying vec2 vUv;

        void main() {
            vUv = uv;
            
            vec3 pos = position;
            
            float wave = sin(pos.y * frequency + time * speed) * amplitude;
            
            pos.x += wave * 0.3;
            pos.z += wave * 0.5;
            
            // Apply transformations in correct order
            vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,

    fragmentShader: `
        varying vec2 vUv;
        uniform vec3 baseColor;

        void main() {
            gl_FragColor = vec4(baseColor, 1.0);
        }
    `
};
