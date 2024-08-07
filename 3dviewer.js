//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

let progressElement = document.getElementById('loading');
let progressContainerElement = document.getElementById('loading-container');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let loadedModel;
let orbitController;
const loader = new GLTFLoader();

var modelLoaded = false;
let modelPath = '';
let modelName = '';

const scene = new THREE.Scene();
if (modelName == "celltower") {
    scene.background = new THREE.Color(0xF1F1F1);
}
else {
    scene.background = new THREE.Color(0xc3c3c3);
}

if (window.location.pathname.includes('antenna')) {
    modelPath = 'models/antenna_textured.gltf'; // Path for page1
    modelName = "antenna";
} else {
    modelPath = 'models/celltower.gltf'; // Default model
    progressElement = document.getElementById('loading-celltower');
    progressContainerElement = document.getElementById('loading-container-celltower');
    modelName = "celltower";
}

loader.load(
    modelPath,
    function (gltf) {
        loadedModel = gltf.scene;

        //Update the values to change the initial scale
        if (modelName == "antenna") {
            loadedModel.scale.set(0.5, 0.5, 0.5);
        } else {
            loadedModel.scale.set(0.12, 0.12, 0.12);
        }

        // Compute the bounding box of the model
        const box = new THREE.Box3().setFromObject(loadedModel);
        const boxSize = box.getSize(new THREE.Vector3());

        // Adjust the loadedModel position so that its center is at the origin
        loadedModel.position.y = -boxSize.y / 2;

        scene.add(loadedModel);

        progressContainerElement.style.display = 'none';

        modelLoaded = true
    },
    function (xhr) {
        let load_amount = (xhr.loaded / xhr.total) * 99;
        if (load_amount < 100) {
            console.log(load_amount + '% loaded');
        } else {
            console.log('99% loaded');
        }
        progressElement.innerText = `Loading: ${xhr.loaded / xhr.total * 99}%`;
    },
    function (error) {
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 30;

//Add lights to the scene, so we can actually see the 3D model
const topLight = new THREE.DirectionalLight(0xffffff, 1.3); // (color, intensity)
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);

let ambientLight; 
if (modelName == "celltower") {
    ambientLight = new THREE.AmbientLight(0x333333, 4);
} else {
    ambientLight = new THREE.AmbientLight(0x333333, 1.5);
}
scene.add(ambientLight);

orbitController = new OrbitControls(camera, renderer.domElement);

renderer.render(scene, camera);

function animate() {
    requestAnimationFrame(animate);

    if (modelLoaded == true) {
        loadedModel.rotation.y += 0.0015;
        topLight.position.copy(camera.position);
    }
    renderer.render(scene, camera);

    //Add a listener to the window, so we can resize the window and the camera
    window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

animate()