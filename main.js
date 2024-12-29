import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
// import { PMREMGenerator } from 'three/examples/jsm/pmrem/PMREMGenerator.js';

// Create scene 
const scene = new THREE.Scene();

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate ); 
document.body.appendChild( renderer.domElement );

// Create HDRI Loader & Load HDRI
const rgbeLoader = new RGBELoader();

rgbeLoader.load('./public/shanghai_4k.hdr', function(texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1); 

//   const material = new THREE.MeshBasicMaterial({ map: texture });
//   const skySphere = new THREE.Mesh(geometry, material);
//   scene.add(skySphere);

  // Optional: Lighting
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  scene.environment = envMap;
});

// Create GLTF Loader & Load Object
const loader = new GLTFLoader();
let suzzane;
loadObjectFromFile('idcard', './public/passport/passport.gltf', true, testCallback);

// List of objects that should look at the cursor
let objectsToLookAtCursor = [];

// Create camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

// Background color
renderer.setClearColor(0x000000, 1); // The second argument is the alpha value (0 for fully transparent)

// Basic Box Geometry
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

// Create a directional light
createDirectionalLight(0xffffff, 2, {x: 1, y: -1, z: -1});
createDirectionalLight(0xa5aeff, 0.5, {x: -0.5, y: 0.5, z: -1});

const light = new THREE.HemisphereLight( 0xffffff, 0x0000ff, 10 );
scene.add( light );

// const ambientLight = new THREE.AmbientLight( 0x404040, 10 ); // soft white light scene.add( light );
// scene.add( ambientLight );

// Little testing function lol
// testingCubes();

// ### Functions ###

// Basic animation function for the cube 
function animate() {
	renderer.render( scene, camera );
}

function lookAtScreenPos(object, x, y){
    const divisor = 210;
    const sensitivity = 10;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    x = (x - windowHalfX) / divisor;
    y = -(y - windowHalfY) / divisor; // This /10 is impersice I wonder if there's a better weay to do it

    const objectPosition = object.position; 
    const cursorPosition = new THREE.Vector3(x, y, sensitivity);

    const lookPosition = cursorPosition.sub(objectPosition);

    object.lookAt(lookPosition);
}

function loadObjectFromFile(objectName, filePath, addObjectToScene = true, callback = null) {
    let loadedObject;

    loader.load(filePath, 
    (gltf) => { 
        // Access the loaded model here
        const gltfScene = gltf.scene;

        if (addObjectToScene)
            scene.add(gltfScene); 
    
        // Access specific objects by name
        loadedObject = gltf.scene.getObjectByName(objectName);
        console.log(loadedObject);

        if (callback != null)
            callback(loadedObject);
    }, 
    (xhr) => {
        // Optional: Progress callback
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, 
    (error) => {
        // Optional: Error callback
        console.error('An error happened', error);
    });
}

function testCallback(object){
    objectsToLookAtCursor.push(object);
}

function createDirectionalLight(color, intensity, direction){
    // Create a directional light & target
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    const directionalLightTarget = directionalLight.target;

    // Add the light & target to the scene
    scene.add(directionalLight);
    scene.add(directionalLightTarget);   

    // Set the light target's position
    directionalLight.position.set(0, 0, 0);
    directionalLightTarget.position.set(direction.x, direction.y, direction.z);
}

// ### Event Listeners ###

// Event listener for window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});

// Event listener for mouse movement
document.addEventListener('mousemove', (event) => {
    let x = event.clientX;
    let y = event.clientY;
    // console.log(x, y);
    
    objectsToLookAtCursor.forEach((object) => {
        lookAtScreenPos(object, x, y);
    });
});