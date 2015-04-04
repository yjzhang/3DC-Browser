
// 1. setting up the basic scene
//
var h = window.innerHeight;
var w = window.innerWidth;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 
        w/h, 0.001, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);

document.body.appendChild(renderer.domElement);

var controls = new THREE.TrackballControls( camera );
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

controls.noZoom = false;
controls.noPan = false;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

controls.keys = [ 65, 83, 68 ];

controls.addEventListener( 'change', render );

// 2. setting up the geometry...

/**
 * Given a string of coords, this returns an array of Vector3 objects.
 * */
function pointsToCurve(coords) {
    var coords_str = coords.trim().split("\n");
    console.log(coords_str);
    var all_coords = Array(coords_str.length - 1);
    for (var i in coords_str) {
        var c = coords_str[i];
        var c_nums = c.trim().split(" ");
        if (c_nums.length == 1)
            continue;
        else if (c_nums.length == 3) {
            all_coords[i-1] = new THREE.Vector3(Number(c_nums[0]), 
                    Number(c_nums[1]), Number(c_nums[2]));
        }
    }
    // now, all_coords is set up... time to do stuff
    // TODO: create a THREE.Curve object,
    return all_coords;
}

function reloadObject(text, oldObject) {
    scene.remove(oldObject);
    all_coords = pointsToCurve(text);
    console.log(all_coords);
    curve = new THREE.SplineCurve3(all_coords);
    console.log(curve);
    geometry = new THREE.TubeGeometry(curve, all_coords.length, 0.01, 4, false); 
    console.log(geometry);
    material = new THREE.MeshLambertMaterial( { color : 0xff0000, shading: THREE.FlatShading } ); 
    //Create the final Object3d to add to the scene 
    splineObject = new THREE.Mesh( geometry, material );
    scene.add(splineObject);
    return splineObject;
}

// Testing
var light1 = new THREE.DirectionalLight( 0xffffff , 1); // soft white light 
light1.position.set(0, 1, 0);
scene.add( light1 );
var light2 = new THREE.DirectionalLight( 0xffffff , 0.7); // soft white light 
light2.position.set(1, 0, 0);
scene.add( light2 );
var light3 = new THREE.DirectionalLight( 0xffffff , 0.7); // soft white light 
light3.position.set(0, 0, 1);
scene.add( light3 );

var all_coords = pointsToCurve("5\n0.566046 0.297772 0.928499\n0.610989 0.358840 0.944009\n0.702651 0.392072 0.915918\n0.788991 0.373088 0.865537\n0.885824 0.423299 0.798283\n0.938226 0.431045 0.807664\n0.979563 0.436933 0.850140\n0.879564 0.392228 0.872330\n0.986126 0.514608 0.806436\n1.014283 0.272586 0.776961\n1.023788 0.293796 0.818363\n1.070421 0.368948 0.809370\n1.111069 0.396415 0.776139\n1.173737 0.444256 0.861438\n1.197271 0.408099 0.874555\n1.138319 0.335163 0.959901\n1.068201 0.324114 0.975166\n0.991536 0.322119 0.996538\n0.893452 0.358959 0.987836\n0.827682 0.372347 0.959612\n0.741301 0.335776 0.994867");
console.log(all_coords);
var curve = new THREE.SplineCurve3(all_coords);
var geometry = new THREE.TubeGeometry(curve, all_coords.length, 0.01, 4, false); 
var material = new THREE.MeshPhongMaterial( { color : 0xff0000 } ); 
//Create the final Object3d to add to the scene 
var splineObject = new THREE.Mesh( geometry, material );
scene.add(splineObject);
camera.position.z = 5;

// 3. Setting up mouse interactions
// if the mouse is down, we enter into a mode where moving the mouse would
// change the camera position.
var mouseX = 0;
var mouseY = 0;
var mouseDown = false;

function onMouseMove( event ) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseDown(event) {
    mouseDown = true;
}

function onMouseUp(event) {
    mouseDown = false;
}
// registering mouse events
//renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
//renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
//renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
window.addEventListener( 'resize', onWindowResize, false );


// 4. Setting up data tracks / colors
// TODO: implement this

/**
 * Given a bedfile, this should return a list of colors...
 * */
function readBedfile(bedfile, chrom, arm, removed_bins) {
}


// 5. rendering
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
    render();
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
}

function render() { 
    requestAnimationFrame( render ); 
    renderer.render( scene, camera ); 
} 

