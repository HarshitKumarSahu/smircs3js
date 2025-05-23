import * as THREE from 'three'
import vertexShader from '../shaders/vertex.glsl' 
import fragmentShader from '../shaders/fragment.glsl' 

export default function(w, h) {
    const geometry = new THREE.PlaneGeometry(w, h, 128, 128)

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uProgress: new THREE.Uniform(0.0),
            uSize: new THREE.Uniform(new THREE.Vector2(w, h)),
            uTexture: new THREE.Uniform(),
            uTextureSize: { value: new THREE.Vector2(1, 1) },
            uPlaneResolution: { value: new THREE.Vector2(w, h) },
        },
    })

    const mesh = new THREE.Mesh(geometry, material)
    return mesh
}