
// 1. setting up the basic scene
//
var h = window.innerHeight;
var w = window.innerWidth;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 
        w/h, 0.001, 1000);
var renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: false 
});
renderer.setSize(w, h);
renderer.setClearColor("rgb(100,100,100)");

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
var light1 = new THREE.AmbientLight( 0x404040 , 0.5); // soft white light 
light1.position.set(0, 0, 0);
scene.add( light1 );
var light2 = new THREE.DirectionalLight( 0xf0f0f0 , 0.9); // soft white light 
light2.position.set(camera.position.x, camera.position.y, camera.position.z);
scene.add( light2 );

// 2. setting up the geometry...

// global parameters
var objectText = "";
var bedText = "";
var tubeRadius = 0.01;
var tubeSegments = 32;
var colorMap = BLUE_WHITE_RED_SCHEME;
var colors = [];
var colorValues = null;
var urlData = null;

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
 * Sets the colors for each face, based on a color map... 
 * colors = 1 color per point
 * geometry: TubeGeometry with 8 segments/point (16 faces per point)
 * */
function setFaceColors(geometry, colors) {
    for(var i = 0; i<geometry.faces.length; i+=tubeSegments*2) {
        for(var j = 0; j<tubeSegments*2; j++) {
            var face = geometry.faces[i+j];
            var ci = i/(tubeSegments*2);
            face.color = colors[ci];
            face.vertexColors[0] = colors[ci];
            face.vertexColors[1] = colors[ci];
            face.vertexColors[2] = colors[ci];
            face.vertexColors[3] = colors[ci];
        }
    }
    return geometry
}

/**
 * Given a text file, this generates a geometry and replaces oldObject.
 * */
function reloadObject(text, oldObject) {
    if (oldObject) {
        removeObjectsFromScene(oldObject, scene);
    }
    all_coords = pointsToCurve(text);
    console.log(all_coords);
    geometry = constructGeometryArray(all_coords, tubeRadius, tubeSegments);
    if (colorValues != null && colorValues.length == all_coords.length) {
        colors = coordsToColors(all_coords.length, colorMap, colorValues);
    } else {
        colors = coordsToColors(all_coords.length, colorMap, null);
    }
    //geometry.colors = colors;
    //geometry.vertexColors = colors;
    setGeometryColors(geometry, colors, tubeSegments);
    console.log(geometry);
    material = new THREE.MeshPhongMaterial( { color : 0xffffff, opacity:0, 
          shading: THREE.FlatShading, vertexColors: THREE.VertexColors} ); 
    splineObject = addGeometriesToScene(all_coords, geometry, material, scene);
    // draw color map
    if (colorValues)
        drawColorMap(document.getElementById("colormap-canvas"), colorMap, max(colorValues), min(colorValues));
    else
        drawColorMap(document.getElementById("colormap-canvas"), colorMap, 1, -1);
    render();
    return splineObject;
}

function updateColors(newValues) {
    colorValues = newValues;
    if (newValues != null && newValues.length == all_coords.length) {
        colorValues = newValues;
    } else if (newValues.length > all_coords.length) {
        colorValues = newValues.slice(0, all_coords.length);
    }
}

// Testing
objectText = "5\n0.566046 0.297772 0.928499\n0.610989 0.358840 0.944009\n0.702651 0.392072 0.915918\n0.788991 0.373088 0.865537\n0.885824 0.423299 0.798283\n0.938226 0.431045 0.807664\n0.979563 0.436933 0.850140\n0.879564 0.392228 0.872330\n0.986126 0.514608 0.806436\n1.014283 0.272586 0.776961\n1.023788 0.293796 0.818363\n1.070421 0.368948 0.809370\n1.111069 0.396415 0.776139\n1.173737 0.444256 0.861438\n1.197271 0.408099 0.874555\n1.138319 0.335163 0.959901\n1.068201 0.324114 0.975166\n0.991536 0.322119 0.996538\n0.893452 0.358959 0.987836\n0.827682 0.372347 0.959612\n0.741301 0.335776 0.994867";
var splineObject = reloadObject(objectText, null);
camera.position.z = 5;

// 3. Setting up mouse interactions
// No need

// registering mouse events - unnecessary since this is all done in control
//renderer.domElement.addEventListener( 'mousemove', onMouseMove, false );
//renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
//renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
window.addEventListener( 'resize', onWindowResize, false );


// 4. Setting up data tracks / colors

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
    console.log("readBedfile");
    if (bedfile.length == 0) {
        return [];
    }
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
    var bin_id = 1;
    var bin_start = 0;
    for (var i = 0; i<bedfile_split.length; i++) {
        var line_values = bedfile_split[i].split(/\s+/);
        //console.log(line_values);
        var chr = line_values[ldict.chr || 0];
        var start = line_values[ldict.start || 1];
        var end = line_values[ldict.end || 2];
        var val = line_values[ldict[value_name] || line_values.length - 1];
        // TODO: something like bedtools intersect
        if (chr == chrom) {
            if (removed_bins != null && !contains(removed_bins, bin_id)) {
                var bin_val = Number(val);
                if (end-start < resolution) {
                    current_bin.push(bin_val);
                    if (end >= bin_start + resolution) {
                        bin_val = mean(current_bin);
                        values.push(bin_val);
                        bin_start += end - start
                    }
                }
                if (end-start > resolution) {
                    // TODO: I have no idea what to do
                }
                if (end-start == resolution) {
                    values.push(bin_val);
                }
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

/**
 * Resets the camera to its original position by re-generating all the global
 * variables
 * */
function resetCamera(zoomSetting) {
    camera = new THREE.PerspectiveCamera(60, 
        window.innerWidth/window.innerHeight, 0.001, 1000);
    camera.position.z = 5*zoomSetting;
    //camera.lookAt(THREE.Vector3(0,0,0));
    camera.updateProjectionMatrix();
    controls = new THREE.TrackballControls( camera , renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    controls.addEventListener( 'change', render );
    render();
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    //render();
}

function render() { 
    light2.position.set(camera.position.x, camera.position.y, camera.position.z);
    renderer.render( scene, camera ); 
} 

/**
 * Takes a screenshot...
 * */
function snapshot() {
    render();
    urlData = renderer.domElement.toDataURL();
    window.open(urlData, "_blank");

}
