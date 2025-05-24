import * as THREE from 'three'
import gsap from 'gsap'
import MeshItem from './meshItems'
import Loader from './textureLoader'

/**
 * Setup
 */
const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const fov = 2 * Math.atan((window.innerHeight / 2) / cameraDistance) * (180 / Math.PI);
})

const cameraDistance = 5;
const fov = 2 * Math.atan((window.innerHeight / 2) / cameraDistance) * (180 / Math.PI);
const camera = new THREE.PerspectiveCamera(
  fov, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  100
);
camera.position.z = cameraDistance;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Objects
 */
const objectsDistance = sizes.height;
let sectionMeshes = [];

const loader = new Loader()
loader.loadTextures((textures) => {
    document.body.classList.remove("loading");

    // Select all .imgCont elements
    const imgContainers = document.querySelectorAll('.img');
    
    // Warn if the number of .imgCont elements doesn't match the number of textures
    if (imgContainers.length !== textures.length) {
        console.warn(`Number of .imgCont elements (${imgContainers.length}) does not match number of textures (${textures.length})`);
    }

    // Create meshes dynamically based on .imgCont bounding rect dimensions
    sectionMeshes = textures.map((texture, index) => {
        let width, height, positionX, positionY;

        if (index < imgContainers.length) {
            // Get dimensions and position from .imgCont element
            const rect = imgContainers[index].getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            // Position mesh to align with .imgCont element in viewport
            positionX = rect.left - window.innerWidth / 2 + rect.width / 2;
            positionY = -rect.top + window.innerHeight / 2 - rect.height / 2;
        } else {
            // Fallback to texture dimensions if .imgCont is not available
            const img = texture.image;
            width = img.width;
            height = img.height;
            // Default to centered position if no .imgCont is available
            positionX = 0;
            positionY = -objectsDistance * index; // Maintain original vertical stacking
        }

        // Create MeshItem with dimensions
        const mesh = MeshItem(width, height);
        // Assign texture and update uTextureSize uniform
        mesh.material.uniforms.uTexture.value = texture;
        mesh.material.uniforms.uTextureSize.value.set(
            texture.image?.width || 1,
            texture.image?.height || 1
        );
        // Set position
        mesh.position.set(positionX, positionY, 0);
        scene.add(mesh);
        return mesh;
    });

    observeScroll();
    const section = Math.round(scrollY / sizes.height);
    onSectionEnter(section);
    tick();
});

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = -1
let shift = 0

const observeScroll = () => {
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY
    
        let newSection = (scrollY / sizes.height)
        newSection = Math.round(newSection)
        
        if (currentSection != newSection) {
            shift += newSection - currentSection
            currentSection = newSection 
            onSectionEnter(newSection)
        }
    })
}

const onSectionEnter = (section) => {
    gsap.to(
        sectionMeshes[section].material.uniforms.uProgress,
        {
            duration: 3.5,
            value: 1.0,
        }
    )
}

/**
 * Tick
 */
const clock = new THREE.Clock()
let time = 0
let targetPosY = -scrollY

const lerp = (a, b, t) => {
    return a + (b - a) * t;
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - time
    time = elapsedTime

    targetPosY = lerp(targetPosY, -scrollY, 0.1)
    camera.position.y = targetPosY
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

