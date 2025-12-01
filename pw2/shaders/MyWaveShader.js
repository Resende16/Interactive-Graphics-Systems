import * as THREE from "three";

export const WaveShader = {

    uniforms: {
        time:      { value: 0 },
        amplitude: { value: 0.15 },
        frequency: { value: 1.5 },
        speed:     { value: 1.0 },

        baseColor: { value: new THREE.Color(1, 1, 1) },
        map:       { value: null },
        useMap:    { value: false }
    },

    vertexShader: `
        uniform float time;
        uniform float amplitude;
        uniform float frequency;
        uniform float speed;

        varying vec2 vUv;

        #ifdef USE_INSTANCING
            attribute mat4 instanceMatrix;
        #endif

        void main() {

            vUv = uv;

            vec3 pos = position;

            float wave = sin(pos.y * frequency + time * speed) * amplitude;

            pos.x += wave * 0.4;
            pos.z += wave * 0.6;

            vec4 worldPos = vec4(pos, 1.0);

            #ifdef USE_INSTANCING
                worldPos = instanceMatrix * worldPos;
            #endif

            gl_Position =
                projectionMatrix *
                modelViewMatrix *
                worldPos;
        }
    `,

    fragmentShader: `
        uniform vec3 baseColor;
        uniform sampler2D map;
        uniform bool useMap;

        varying vec2 vUv;

        void main() {

            vec3 color = baseColor;

            if (useMap) {
                vec4 tex = texture2D(map, vUv);
                color *= tex.rgb;
            }

            gl_FragColor = vec4(color, 1.0);
        }
    `
};
