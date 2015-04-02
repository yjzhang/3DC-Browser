
// 1. setting up the basic scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(15, 
        window.innerWidth/(window.innerHeight-100), 0.1, 10);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight - 100);

document.body.appendChild(renderer.domElement);

// 2. setting up the geometry...

/**
 * Given a string of coords, this returns an array of Vector3 objects.
 * */
function pointsToCurve(coords) {
    var coords_str = coords.split("\n");
    var all_coords = Array(coords_str.length - 1);
    for (var i in coords_str) {
        var c = coords_str[i];
        var c_nums = c.split(" ");
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

// Testing
var light = new THREE.DirectionalLight( 0xffffff , 1); // soft white light 
light.position.set(0, 1, 0);
scene.add( light );

var all_coords = pointsToCurve("5\n0.566046 0.297772 0.928499\n0.610989 0.358840 0.944009\n0.702651 0.392072 0.915918\n0.788991 0.373088 0.865537\n0.885824 0.423299 0.798283\n0.938226 0.431045 0.807664\n0.979563 0.436933 0.850140\n0.879564 0.392228 0.872330\n0.986126 0.514608 0.806436\n1.014283 0.272586 0.776961\n1.023788 0.293796 0.818363\n1.070421 0.368948 0.809370\n1.111069 0.396415 0.776139\n1.173737 0.444256 0.861438\n1.197271 0.408099 0.874555\n1.138319 0.335163 0.959901\n1.068201 0.324114 0.975166\n0.991536 0.322119 0.996538\n0.893452 0.358959 0.987836\n0.827682 0.372347 0.959612\n0.741301 0.335776 0.994867");
var curve = new THREE.SplineCurve3(all_coords);
var geometry = new THREE.TubeGeometry(curve, 50, 0.01, 8, false); 
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
// 4. Setting up data tracks / colors
