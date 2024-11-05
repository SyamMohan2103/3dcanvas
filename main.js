import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Add this before the loader
let distance; // Declare distance variable in wider scope

// function init() {
// Create scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xf0f0f0);

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 3);

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Add after creating the scene and before the loader
// Create grid helper
const size = 100;
const divisions = 20;
const gridHelper = new THREE.GridHelper(size, divisions, 0x9370DB, 0x9370DB);
scene.add(gridHelper);

// Add a ground plane beneath the grid
const planeGeometry = new THREE.PlaneGeometry(size, size);
const planeMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x111111,
    opacity: 0.6,
    transparent: true
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
plane.position.y = -0.01; // Slightly below the grid to avoid z-fighting
scene.add(plane);

// Adjust renderer
renderer.setClearColor(0x000000); // Black background
renderer.shadowMap.enabled = true;

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Create orbit controls for zooming only
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false; // Disable orbit rotation
controls.enablePan = false;    // Disable panning
controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
controls.minPolarAngle = 0;    // Allow camera to go directly above

// Create a group for the model that will rotate
const modelGroup = new THREE.Group();
scene.add(modelGroup);

// Load 3D model
const loader = new GLTFLoader();
loader.load('/models/human/female Avatar.glb', (gltf) => {
    const model = gltf.scene;
    
    // Center the model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Calculate model height and adjust position to sit on grid
    const size = box.getSize(new THREE.Vector3());
    model.position.y = 0; // Move up by half height
    
    // Add model to the group instead of the scene
    modelGroup.add(model);
    
    // Calculate the bounding sphere
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    
    // Calculate optimal camera distance
    const fov = camera.fov * (Math.PI / 180);
    distance = sphere.radius / Math.sin(fov / 2);
    
    // Set up camera
    camera.position.set(0, distance * 0.2, distance * 1.1);
    camera.lookAt(0, sphere.radius / 2, 0);
    
    // Set control limits
    controls.minDistance = distance * 0.5;
    controls.maxDistance = distance * 2;
    controls.target.set(0, sphere.radius / 2, 0);
    controls.update();
});

// Add mouse controls for model rotation only
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        modelGroup.rotation.y += deltaMove.x * 0.01;
        
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function animate() {
	renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// init();

