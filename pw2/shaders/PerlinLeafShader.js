import * as THREE from 'three';

export const PerlinLeafShader = {
  uniforms: {
    time: { value: 0 },
    speed: { value: 0.25 },
    scale: { value: 2.5 },
    intensity: { value: 0.25 },
    baseColor: { value: new THREE.Color(0.8, 1.0, 0.8) },
    map: { value: null },
    useMap: { value: false }
  },

  vertexShader: `
    uniform float time;
    uniform float speed;
    uniform float scale;

    varying vec2 vUv;
    varying vec3 vPos;

    void main() {
      vUv = uv;
      vPos = position;

      vec3 pos = position;
      // slight waving similar to existing WaveShader
      float wave = sin(pos.y * 1.5 + time * speed) * 0.06;
      pos.x += wave * 0.4;
      pos.z += wave * 0.6;

      vec4 worldPos = vec4(pos, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * worldPos;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform float scale;
    uniform float intensity;
    uniform vec3 baseColor;
    uniform sampler2D map;
    uniform bool useMap;

    varying vec2 vUv;
    varying vec3 vPos;

    // Simple hash and value-noise functions
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = hash(i + vec2(0.0, 0.0));
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // Fractal Brownian Motion
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = m * p * 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // sample base color or texture
      vec3 color = baseColor;
      if (useMap) {
        vec4 t = texture2D(map, vUv);
        color *= t.rgb;
      }

      // compute animated noise pattern in UV space and also slightly by position
      vec2 nUV = vUv * scale + vec2(time * 0.05, time * 0.03);
      float n = fbm(nUV + vPos.xz * 0.2);

      // subtle color variation and small contrast
      float pattern = smoothstep(0.35, 0.75, n);
      vec3 noiseColor = mix(vec3(0.9,1.0,0.9), vec3(0.6,0.9,0.6), pattern);

      // blend noise with base color
      color = mix(color, noiseColor, intensity);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};
