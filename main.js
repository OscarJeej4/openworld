import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let keysPressed = {};

let moveSpeed = 0.1;
let touchStart = null;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaec6cf);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("world"), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 10, 5).normalize();
  scene.add(light);

  // Terrain with web texture
  const textureURL = 'https://cdn.pixabay.com/photo/2017/02/07/14/32/grass-2041583_1280.jpg';
  const loader = new THREE.TextureLoader();
  loader.load(textureURL, function(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50);
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshLambertMaterial({ map: texture });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
  });

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Desktop Movement
  document.addEventListener('keydown', (e) => keysPressed[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', (e) => keysPressed[e.key.toLowerCase()] = false);

  // Touch Look
  renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStart = e.touches[0];
  });

  renderer.domElement.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && touchStart) {
      const touch = e.touches[0];
      const deltaX = (touch.clientX - touchStart.clientX) * 0.005;
      const deltaY = (touch.clientY - touchStart.clientY) * 0.005;
      camera.rotation.y -= deltaX;
      camera.rotation.x -= deltaY;
      touchStart = touch;
    }
  });

  // Touch Move (Swipe forward/backward)
  renderer.domElement.addEventListener('touchend', () => touchStart = null);
}

function animate() {
  requestAnimationFrame(animate);

  // WASD Movement
  const forward = keysPressed['w'] ? 1 : keysPressed['s'] ? -1 : 0;
  const strafe = keysPressed['a'] ? -1 : keysPressed['d'] ? 1 : 0;

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  const side = new THREE.Vector3();
  side.crossVectors(camera.up, direction).normalize();

  camera.position.addScaledVector(direction, forward * moveSpeed);
  camera.position.addScaledVector(side, strafe * moveSpeed);

  controls.update();
  renderer.render(scene, camera);
}

