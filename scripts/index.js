/* Solar System with THREE.js */
// Create Scene
const scene = new THREE.Scene();


// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


// Camera & Controls
const camera = new THREE.PerspectiveCamera( 
    75, window.innerWidth / window.innerHeight, 0.1, 1000 
);
const orbit_controls = new THREE.OrbitControls(camera, renderer.domElement);
const fly_controls = new THREE.FlyControls(camera, renderer.domElement);
fly_controls.movementSpeed = 100;
fly_controls.rollSpeed = Math.PI / 24;
fly_controls.autoForward = false;
fly_controls.dragToLook = true;
camera.position.z = 100;


// Light
const Light = new THREE.PointLight(0xFFFFFF, 2, 300);
scene.add(Light)


// Texture Loader
const texture_loader = new THREE.TextureLoader();


// SPACE
const space_geom = new THREE.SphereGeometry(400);
const space_matl = new THREE.MeshBasicMaterial({
    map: texture_loader.load('./textures/scope.jpg'),
    side: THREE.BackSide,
});
const space_mesh = new THREE.Mesh(space_geom, space_matl);
scene.add(space_mesh);

// Sun
const sun_geom = new THREE.SphereGeometry(5);
const sun_matl = new THREE.MeshBasicMaterial({
    map: texture_loader.load('./textures/OIP.jpg'),
});
const sun_mesh = new THREE.Mesh(sun_geom, sun_matl);
scene.add(sun_mesh);


// Planet 1 - Blue
const p1_geom = new THREE.SphereGeometry(2);
const p1_matl = new THREE.MeshStandardMaterial({
    map: texture_loader.load('./textures/venus.jpg'),
});
const p1_mesh = new THREE.Mesh(p1_geom, p1_matl);
sun_mesh.add(p1_mesh);


// Planet 2 - Green
const p2_geom = new THREE.SphereGeometry(3);
const p2_matl = new THREE.MeshStandardMaterial({
    map: texture_loader.load('./textures/earthmap1k.jpg'),
});
const p2_mesh = new THREE.Mesh(p2_geom, p2_matl);
sun_mesh.add(p2_mesh);


// Planet 2 Moon - Grey
const p2_moon_geom = new THREE.SphereGeometry(1);
const p2_moon_matl = new THREE.MeshStandardMaterial({
    map: texture_loader.load('./textures/R.jpg'),
});
const p2_moon_mesh = new THREE.Mesh(p2_moon_geom, p2_moon_matl);
p2_mesh.add(p2_moon_mesh);


// Planet 3 - Yellow
const p3_geom = new THREE.SphereGeometry(4);
const p3_matl = new THREE.MeshStandardMaterial({
    map: texture_loader.load('./textures/nepture.jpg'),
});
const p3_mesh = new THREE.Mesh(p3_geom, p3_matl);
sun_mesh.add(p3_mesh);


// Orbit Function
function calculateOrbit(time, apogee, perigee, inclination, pFlag, tSkip) {
    let a = (apogee + perigee) / 2;  // Length of semi-major axis (center of x pos.)
    let b = Math.sqrt(Math.pow(a,2) - Math.pow(a - perigee, 2));  // Length of semi-minor axis
    let e = Math.sqrt(1 - ((Math.pow(b,2))/(Math.pow(a,2))));  // Eccentricity
    let p = Math.pow(a,3);  // Period
    let O = time; // Theta
    if(pFlag == true) { // Theta w/ period flag
        O = ((t - tSkip * (Math.pow(a, 2)))/ p);  // Theta
    }
    let r = (a * (1 - Math.pow(e, 2))) / (1 - (e * Math.cos(O)));  // Calculate pos. in ellipse
    
    let x = r * Math.cos(O);  // Get x component
    let z = r * Math.sin(O);  // Get z component

    let i = inclination;
    let y = i * Math.sin(O);

    return [ x, y, z ]
}


// Orbit Paths
function drawOrbit(apogee, perigee, inclination, parent) {
    const material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
    const points = [];

    for(k=0; k<(2.2*Math.PI); k+=(Math.PI/64)) {
        const [ x, y, z ] = calculateOrbit(k, apogee, perigee, inclination, false, 0);
        points.push( new THREE.Vector3( x, y, z ) );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    parent.add( line );
}

// TRAIL FUNCTIONS
function createTrail(parent) {
    const material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });
    
    const points = [];
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    points.push( new THREE.Vector3( 0, 0, 0 ) );
    
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    
    const line = new THREE.Line( geometry, material );
    parent.add(line);
    return line;
}

function updateTrail(trail, apogee, perigee, inclination) {
    let index = 0;

    for(back = 0; back < (6 * Math.PI); back += Math.PI) {        
        let [ x, y, z ] = calculateOrbit(t, apogee, perigee, inclination, true, back);

        trail.geometry.attributes.position.array[ index++ ] = x
        trail.geometry.attributes.position.array[ index++ ] = y
        trail.geometry.attributes.position.array[ index++ ] = z

        trail.geometry.attributes.position.needsUpdate = true;
    }
}


// DRAW ORBITS AND TRAILS
drawOrbit(10,10,5, sun_mesh);
drawOrbit(25,25,0, sun_mesh);
drawOrbit(7.5,7.5,0, p2_mesh);
drawOrbit(100,50,0, sun_mesh);

let p1_trail = createTrail(sun_mesh);
let p2_trail = createTrail(sun_mesh);
let p2_moon_trail = createTrail(p2_mesh);
let p3_trail = createTrail(sun_mesh);


// Dat.GUI
const gui = new dat.GUI();
gui.add(p1_trail, 'visible', false, true).name("Planet 1 Trail");
gui.add(p2_trail, 'visible', false, true).name("Planet 2 Trail");
gui.add(p2_moon_trail, 'visible', false, true).name("Moon Trail");
gui.add(p3_trail, 'visible', false, true).name("Planet 3 Trail");


// Rendering Scene
let t = 0;
let view = 'default';
function animate() {
    // Planet Spin

    // Planet Positioning
    let [x,y,z] = calculateOrbit(t, 10, 10, 5, true, 0);
    p1_mesh.position.set( x,y,z );

    [x,y,z] = calculateOrbit(t, 25, 25, 0, true, 0);
    p2_mesh.position.set( x,y,z );

    [x,y,z] = calculateOrbit(t, 7.5, 7.5, 0, true, 0);
    p2_moon_mesh.position.set( x,y,z );

    [x,y,z] = calculateOrbit(t, 100, 50, 0, true, 0);
    p3_mesh.position.set( x,y,z );
    
    // Trail Draw
    updateTrail(p1_trail, 10, 10, 5);
    updateTrail(p2_trail, 25, 25, 0);
    updateTrail(p2_moon_trail, 7.5, 7.5, 0);
    updateTrail(p3_trail, 100, 50, 0);

    // Camera Control
    orbit_controls.update();
    if(view == 'default') {
    } else if(view == "p1") {
        orbit_controls.target.set(
            p1_mesh.position.x,
            p1_mesh.position.y,
            p1_mesh.position.z
        )
        camera.position.set(
            p1_mesh.position.x,
            p1_mesh.position.y + 50,
            p1_mesh.position.z,
        );
    } else if(view == "p2") {
        camera.position.set(
            p2_mesh.position.x,
            p2_mesh.position.y + 50,
            p2_mesh.position.z,
        );

        orbit_controls.target.set(
            p2_mesh.position.x,
            p2_mesh.position.y,
            p2_mesh.position.z
        )

    } else if(view == "p3") {
        camera.position.set(
            p3_mesh.position.x,
            p3_mesh.position.y + 50,
            p3_mesh.position.z,
        );

        orbit_controls.target.set(
            p3_mesh.position.x,
            p3_mesh.position.y,
            p3_mesh.position.z
        )

    } else if(view == "p2_moon") {
        var target = new THREE.Vector3(); // create once an reuse it

        p2_moon_mesh.getWorldPosition( target );
        camera.position.set(
            target.x,
            target.y + 50,
            target.z
        );

        orbit_controls.target.set(
            target.x,
            target.y,
            target.z
        )
        
    }




    // Increment Time
    t += 10;

    // Misc.
    fly_controls.update(0.01)
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();


// Handle Resizing
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


// Key Controls
document.onkeydown = function(e) {
    // Path visibility
    if (e.key === '=') {
        p1_trail.visible = true;
        p2_trail.visible = true;
        p2_moon_trail.visible = true;
        p3_trail.visible = true;

    } else if (e.key === '-') {
        p1_trail.visible = false;
        p2_trail.visible = false;
        p2_moon_trail.visible = false;
        p3_trail.visible = false;
    }

    // Camera Control
    else if (e.key === '1') {
        view = 'p1'
    } else if (e.key === '2') {
        view = 'p2'
    } else if (e.key === '3') { 
        view = 'p2_moon'
    } else if (e.key === '4') {
        view = 'p3'
    } else if (e.key === '5') {
        view = 'default'
        controls.reset();
    }
}
