// We can use these ES6 imports because we're using the type="module" script import in index.html
import * as THREE from './three.module.js'; 
import { OBJLoader } from './OBJLoader.js';


// This reflects where flight systems stores their data in their GUI
var currentData = new Array(23);    // Array to store most recent data received on socket for each data type
// dummy starting values
currentData[6] = 0; // roll
currentData[7] = 0; // pitch
currentData[8] = 0; // yaw



var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// TODO: perhaps an orthographic perspective is what we want?
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
// TODO: look at Object.matrixWorld of the camera to point it?
// Camera looks down along its local -z axis
camera.position.set(0, 0, 15);

window.addEventListener('resize', function () {
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

var scene = new THREE.Scene();

var light = new THREE.AmbientLight( 0xF0F0F0, 0.5 ); // soft white light
scene.add( light );

var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// import the rocket and its material into the scene
var objLoader = new OBJLoader();
var rocket = null;
loadRocketOBJ(objLoader, true); // this is asynchronous

// rendering loop (scene + camera + renderer = wow!)
animate();

function animate() {
	requestAnimationFrame( animate ); // this will call animate later on, creating a perpetual loop
	renderer.render( scene, camera );
}

function loadRocketOBJ(objLoader, forceDefaultMaterial = false) {
	objLoader.load(
		// resource URL
		'assets/rocket.obj',
		// called when resource is loaded
		function ( object ) {
			// the obj gets imported as a group of meshes
			rocket = object; // let's keep a handle on this guy
			
			if (forceDefaultMaterial) {
				// materials for the rocket
				rocket.children.forEach(mesh => {
					mesh.material = new THREE.MeshLambertMaterial( { color: 0xf0f0f0 } );
				});
			}
			
			scene.add( rocket );
			
			// Now that the rocket is loaded and textured, we'll just let these keep polling away
			setInterval(updateRocketOrientation, 15);
			setInterval(loadNextDummyData, 15);
		},
		// called when loading is in progresses
		function ( xhr ) {
			console.log( 'Rocket is ' + ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'Could not load rocket.' );
		}
	);
}

function updateRocketOrientation() {
	if (rocket == null) return;
	
	rocket.rotation.x = currentData[6]; // roll
	rocket.rotation.y = currentData[7]; // pitch
	rocket.rotation.z = currentData[8]; // yaw
}

function loadNextDummyData() {
	currentData[6] += 0.02; // roll
	currentData[7] += 0.02; // pitch
	currentData[8] += 0.002; // yaw
}