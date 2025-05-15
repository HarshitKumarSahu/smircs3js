import * as THREE from 'three';
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";

// Canvas & Renderer
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ 
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Scene & Camera
const scene = new THREE.Scene();
const cameraDistance = 5;
const fov = 2 * Math.atan((window.innerHeight / 2) / cameraDistance) * (180 / Math.PI);
const camera = new THREE.PerspectiveCamera(
  fov, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  100
);
camera.position.z = cameraDistance;

// Image element
const image = document.querySelector("img"); // Make sure <img> exists in HTML
const imageBounds = image.getBoundingClientRect();

// Load texture from image's src
const texture = new THREE.TextureLoader().load(image.src);

// Create shader material
const material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  uniforms: {
    uTexture: { value: texture },
    uProgress: { value: 0 },
    uSize: { value: new THREE.Vector2(imageBounds.width, imageBounds.height) }
  }
});

// Plane geometry & mesh
const geometry = new THREE.PlaneGeometry(imageBounds.width, imageBounds.height);
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(
  imageBounds.left - window.innerWidth / 2 + imageBounds.width / 2,
  -imageBounds.top + window.innerHeight / 2 - imageBounds.height / 2,
  0
);
scene.add(mesh);

// Handle resizing
function updatePlanePosition() {
  const bounds = image.getBoundingClientRect();
  mesh.position.set(
    bounds.left - window.innerWidth / 2 + bounds.width / 2,
    -bounds.top + window.innerHeight / 2 - bounds.height / 2,
    0
  );
  material.uniforms.uSize.value.set(bounds.width, bounds.height);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updatePlanePosition();
});

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Animate progress (0 to 1)
  const t = performance.now() * 0.001;
  material.uniforms.uProgress.value = (Math.sin(t) * 0.5) + 0.5;

  renderer.render(scene, camera);
}

animate();
