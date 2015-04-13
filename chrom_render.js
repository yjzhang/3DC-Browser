
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

// adding controls
var controls = new THREE.TrackballControls( camera , renderer.domElement);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

controls.noZoom = false;
controls.noPan = false;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

controls.keys = [ 65, 83, 68 ];

controls.addEventListener( 'change', render );

// adding lights
var light1 = new THREE.DirectionalLight( 0xffffff , 1); // soft white light 
light1.position.set(0, 1, 0);
scene.add( light1 );
var light2 = new THREE.DirectionalLight( 0xffffff , 0.7); // soft white light 
light2.position.set(1, 0, 0);
scene.add( light2 );
var light3 = new THREE.DirectionalLight( 0xffffff , 0.7); // soft white light 
light3.position.set(0, 0, 1);
scene.add( light3 );


// 2. setting up the geometry...

// global parameters
var objectText = "";
var tubeRadius = 0.01;
var colorMap = BLUE_WHITE_RED_SCHEME;
var colors = [];
var colorValues = null;

/**
 * Given a string of coords, this returns an array of Vector3 objects.
 * */
function pointsToCurve(coords) {
    var coords_str = coords.trim().split("\n");
    console.log(coords_str);
    var all_coords = Array(Number(coords_str[0]));
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

/**
 * Given an array of Vector3 objects, this returns an array containing
 * THREE.Color objects for each point. Right now this just does linear
 * interpolation.
 * */
function coordsToColors(num_points, colorScheme, values) {
    var l = num_points;
    var colors = [];
    if (values == null) {
        // do linear interpolation
        for (var i = 0; i<num_points; i++) {
            colors.push(new THREE.Color(makeColor(i, 0, l-1, colorScheme)));
        }
    } else {
        // need to get min, max
        var cmin = min(values);
        var cmax = max(values);
        for (var i = 0; i<num_points; i++) {
            colors.push(new THREE.Color(makeColor(values[i], cmin, cmax, colorScheme)));
        }
    }
    return colors;
}

/**
 * Creates a Geometry from the given list of coords
 * */
function coordsToLineGeometry(all_coords) {
    var geometry = new THREE.Geometry();
    for (var i in all_coords) {
        var c = all_coords[i];
        geometry.vertices.push(c);
    }
    return geometry;
}

/**
 * Given a text file, this generates a geometry and replaces oldObject.
 * */
function reloadObject(text, oldObject) {
    scene.remove(oldObject);
    all_coords = pointsToCurve(text);
    console.log(all_coords);
    curve = new THREE.SplineCurve3(all_coords);
    console.log(curve);
    //geometry = new THREE.TubeGeometry(curve, all_coords.length, tubeRadius, 
    //      8, false); 
    geometry = coordsToLineGeometry(all_coords);
    if (colorValues != null && colorValues.length == geometry.vertices.length) {
        colors = coordsToColors(geometry.vertices.length, colorMap, colorValues);
    } else {
        colors = coordsToColors(geometry.vertices.length, colorMap, null);
    }
    geometry.colors = colors;
    geometry.vertexColors = colors;
    console.log(geometry);
    //material = new THREE.MeshPhongMaterial( { color : 0xffffff, opacity:1, 
    //      shading: THREE.FlatShading, vertexColors: THREE.VertexColors} ); 
    material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1, 
        linewidth: 3, vertexColors: THREE.VertexColors } );
    //Create the final Object3d to add to the scene 
    //splineObject = new THREE.Mesh(geometry, material);
    splineObject = new THREE.Line(geometry, material);
    scene.add(splineObject);
    // draw color map
    drawColorMap(document.getElementById("colormap-canvas"), colorMap, 1, -1);
    return splineObject;
}

function updateColors(newValues, oldObject) {
    colorValues = newValues;
    if (newValues != null && newValues.length == geometry.vertices.length) {
        colorValues = newValues;
        colors = coordsToColors(geometry.vertices.length, colorMap, colorValues);
    } else {
        colorValues = newValues.slice(0, geometry.vertices.length);
        colors = coordsToColors(geometry.vertices.length, colorMap, colorValues);
    }
    console.log("removing new object")
    scene.remove(oldObject);
    geometry = oldObject.geometry;
    geometry.vertexColors = colors;
    geometry.colors = colors;
    console.log("adding new object");
    splineObject = new THREE.Line(geometry, oldObject.material);
    scene.add(splineObject);
    return splineObject;
}

// Testing
var text_init = "5\n0.566046 0.297772 0.928499\n0.610989 0.358840 0.944009\n0.702651 0.392072 0.915918\n0.788991 0.373088 0.865537\n0.885824 0.423299 0.798283\n0.938226 0.431045 0.807664\n0.979563 0.436933 0.850140\n0.879564 0.392228 0.872330\n0.986126 0.514608 0.806436\n1.014283 0.272586 0.776961\n1.023788 0.293796 0.818363\n1.070421 0.368948 0.809370\n1.111069 0.396415 0.776139\n1.173737 0.444256 0.861438\n1.197271 0.408099 0.874555\n1.138319 0.335163 0.959901\n1.068201 0.324114 0.975166\n0.991536 0.322119 0.996538\n0.893452 0.358959 0.987836\n0.827682 0.372347 0.959612\n0.741301 0.335776 0.994867";
var splineObject = reloadObject(text_init, null);
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
// registering mouse events - unnecessary since this is all done in control
//renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
//renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
//renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
window.addEventListener( 'resize', onWindowResize, false );


// 4. Setting up data tracks / colors
// TODO: implement this

/**
 * Given a bedfile (as a string), this should return a list of values...
 * Params:
 *  - bedfile - a string
 *  - resolution - the resolution of the 3d model
 *  - chrom - the chromosome number
 *  - value_name - the name of the header corresponding to the value that
 *    should be plotted.
 *  - arm - no use for now
 *  - removed_bins - the bins that should be removed...
 * */
function readBedfile(bedfile, resolution, chrom, value_name, arm, removed_bins) {
    var values = [];
    var bedfile_split = bedfile.trim().split("\n");
    var line1 = bedfile_split[0].split(/\s+/);
    // ldict maps column headers to column indices
    // it should contain "chr", "start", "end", and something else
    var ldict = {};
    for (var j = 0; j<line1.length; j++) {
        if (line1[j].length > 0)
            ldict[line1[j]] = j;
    }
    console.log(line1);
    console.log(ldict);
    var current_bin = [];
    var bin_id = 0;
    var bin_start = 0;
    for (var i = 0; i<bedfile_split.length; i++) {
        var line_values = bedfile_split[i].split(/\s+/);
        //console.log(line_values);
        var chr = line_values[ldict.chr];
        var start = line_values[ldict.start];
        var end = line_values[ldict.end];
        var val = line_values[ldict.eigenvector];
        // TODO: something like bedtools intersect
        if (chr == chrom) {
            if (removed_bins != null && !contains(removed_bins, bin_id)) {
                values.push(Number(val));
            }
            bin_id++;
        }
    }
    return values;
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
    renderer.render( scene, camera ); 
} 

