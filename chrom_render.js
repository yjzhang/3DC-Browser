// 0. Objects
//
// TODO: implement features for modifying DNAStructure objects

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

/**
 * DNAStructure objects represent 3D structures for display.
 *
 * */
function DNAStructure(objectText, bedText) {
    this.objectText = objectText || "";
    this.bedText = bedText || "";
    // use filename for the description?
    this.description = "";
    this.colorDesc = "";
    this.coords = null;
    this.colorMap = null;
    this.colorValues = [];
    this.colors = [];
    // array of geometries returned by constructGeometryArray
    this.geometries = null;
    // THREE.Material object
    this.material = null;
    // array of meshes returned by addGeometriesToScene
    this.meshes = null;
    this.graphicsLevel = "medium";
    // an array as seen in geometries...
    this.graphicsOptions = null;
    // other stuff
    this.chrom = null;
    // values for the min/max colors
    this.minColorValue = 0;
    this.maxColorValue = 0;
}

/**
 * DNAView objects represent views for displaying 3d structures.
 *
 * */
function DNAView() {
    this.structures = [];
    this.camera = null;
    this.ambientLight = null;
    this.trackingLight = null;
    this.scene = null;
    this.renderer = null;
    this.controls = null;
    // whether or not to allow multiple structures in one view
    this.multipleStructures = false;
    // DOM element representing the description box
    this.descriptionBox = null;
    this.controlPanelValues = null;
}

/**
 * Object that represents stuff on the control panel.
 * */
function ControlPanelValues() {
    this.structure = "";
    this.graphicsLevel = "medium";
    this.zoom = 1.0;
    this.bedfile = "";
    this.resolution = 200000;
    this.chrom = "";
    this.arm = 0;
    this.minValue = null;
    this.maxValue = null;
    this.excludedBins = "";
    this.radius = 0.01;
    this.column = "";
    this.colorScheme = "BLUE_WHITE_RED_SCHEME";
}

/**
 * Creates a new set of controls for the view.
 * */
function newControls(view1) {
    var controls = new THREE.TrackballControls(view1.camera, 
            view1.renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener( 'change', render );
    return controls;
}

/**
 * Creates a new DNAView, initializing all its fields.
 * Initializes the scene, camera, renderer, controls, and lights.
 *
 * Arguments:
 *  w - width
 *  h - height
 */
function createNewView(w, h) {
    var view1 = new DNAView();
    view1.scene = new THREE.Scene();
    view1.camera = new THREE.PerspectiveCamera(60, 
            w/h, 0.001, 1000);
    view1.camera.position.z = 5;
    view1.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: false 
    });
    view1.renderer.setSize(w, h);
    view1.renderer.setClearColor("rgb(100,100,100)");
    // TODO: weird bug - if this is done afterwards, mouse click
    // controls don't work.
    document.body.appendChild(view1.renderer.domElement);

    view1.controls = newControls(view1);

    view1.trackingLight = new THREE.DirectionalLight( 0xf0f0f0 , 0.9);
    view1.trackingLight.position.set(view1.camera.position.x, 
            view1.camera.position.y, view1.camera.position.z);
    view1.ambientLight = new THREE.AmbientLight( 0x404040 , 0.5);
    view1.ambientLight.position.set(0, 0, 0);
    view1.scene.add(view1.trackingLight);
    view1.scene.add(view1.ambientLight);
    return view1;
}

/**
 * Creates a new view with the same camera as the old view?
 * */
function createViewFromOldView(w, h, oldView) {
    var newView = new DNAView();
    newView.scene = new THREE.Scene();
    newView.camera = oldView.camera;
    newView.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: false 
    });
    newView.renderer.setSize(w, h);
    newView.renderer.setClearColor("rgb(100,100,100)");
    document.body.appendChild(newView.renderer.domElement);

    newView.controls = newControls(newView);
    newView.trackingLight = new THREE.DirectionalLight( 0xf0f0f0 , 0.9);
    newView.trackingLight.position.set(newView.camera.position.x, 
            newView.camera.position.y, newView.camera.position.z);
    newView.ambientLight = new THREE.AmbientLight( 0x404040 , 0.5);
    newView.ambientLight.position.set(0, 0, 0);
    newView.scene.add(newView.trackingLight);
    newView.scene.add(newView.ambientLight);
    return newView;
}

/**
 * Adds a new view to the thing
 * */
function newView() {
    // 1. create new view
    // 2. update old views with their new widths/heights
    // 3. set controls of new view to be controls of old view
    var w = (windowWidth)/(views.length+1) - 15;
    var h = windowHeight;
    var oldView = views[0];
    var nv = createViewFromOldView(w, h, oldView);
    for (var i = 0; i<views.length; i++) {
        console.log("new view - updating old view");
        var view = views[i];
        view.camera.aspect = w / h;
        view.camera.updateProjectionMatrix();
        view.renderer.setSize( w, h );
        view.controls.handleResize();
        if (view.structures[0]) {
            view.descriptionBox = createDescriptionFromView(view, i);
        }
    }
    // create new options in the control panel
    var viewOption = document.getElementById("view-id");
    var newOption = document.createElement("option");
    newOption.value = views.length;
    newOption.text = String(views.length);
    viewOption.appendChild(newOption);  
    views.push(nv);
    render();
    console.log("newView() done")
}

/**
 * Given a DNAView object, appends to the DOM a hidden description element
 * and a control button, and adds it to the DOM, or updates the description
 * element if it already exists.
 * */
function createDescriptionFromView(view, viewId) {
    //TODO: also add a "alignment" box
    var descriptionBox = view.descriptionBox;
    if (descriptionBox == null) {
        descriptionBox = document.createElement("div");
        descriptionBox.setAttribute("class", "button-group");
        descriptionBox.setAttribute("id", "desc-" + String(viewId));
        descriptionBox.style.display = "none";
        descriptionBox.style.float = "right";
    } else {
        // remove all children? destroy the existing description box
        while (descriptionBox.firstChild) {
            descriptionBox.removeChild(descriptionBox.firstChild);
        }
    }
    if (view.structures[0]) {
        // 1. add the name of the structure
        descriptionBox.appendChild(document.createTextNode("File name: " + view.structures[0].description));
        descriptionBox.appendChild(document.createElement("p"));
        descriptionBox.appendChild(document.createTextNode("Track name: " + view.structures[0].colorDesc));
        descriptionBox.appendChild(document.createElement("p"));
        // 2. create a color map
        var cmCanvas = document.createElement("canvas");
        cmCanvas.setAttribute("class", "colormap");
        cmCanvas.width = 300;
        cmCanvas.height = 150;
        var cv = view.structures[0].colorValues;
        var cm = view.structures[0].colorMap;
        if (cv && cv.length > 0) {
            var cmin = view.structures[0].minColorValue;
            var cmax = view.structures[0].maxColorValue;
            if (cmin === null || cmax === null || cmin === cmax) {
                cmin = min(cv);
                cmax = max(cv);
            }
            drawColorMap(cmCanvas, cm, cmax, cmin);
        } else {
            drawColorMap(cmCanvas, cm, 1, 0);
        }
        descriptionBox.appendChild(cmCanvas);
    }
    // create description box group
    var dbGroup = document.getElementById("db-group-" + String(viewId));
    if (!dbGroup) {
        dbGroup = document.createElement("div");
        dbGroup.setAttribute("id",  "db-group-" + String(viewId));
        dbGroup.setAttribute("class", "float-top-group"); 
        //dbGroup.style.right = 0;
        dbGroup.style.width=100;
        // create new "help" button
        var descriptionButton = document.createElement("button");
        descriptionButton.style.float = "right";
        descriptionButton.appendChild(document.createTextNode("Description"));
        descriptionButton.onclick = function() {
            var c = document.getElementById("desc-"+String(viewId));
            if (c.style.display==="none")
                c.style.display="block";
            else 
                c.style.display="none";
        };
        dbGroup.appendChild(descriptionButton);
        view.descriptionBox = descriptionBox;
        dbGroup.appendChild(descriptionBox);
        document.body.appendChild(dbGroup);
    }
    var rendererElement = view.renderer.domElement;
    dbGroup.style.left = rendererElement.offsetLeft + rendererElement.width - 120;
    return descriptionBox;
}

/**
 * Creates a DNAStructure object.
 * */
function createDNAStructure(objectText, bedText, colorValues, 
        graphicsLevel, tubeRadius, colorMap, cmin, cmax) {
    var structure = new DNAStructure(objectText, bedText);
    tubeRadius = tubeRadius || 0.01;
    graphicsLevel = graphicsLevel || "medium";
    colorMap = colorMap || BLUE_WHITE_RED_SCHEME;
    colorValues = colorValues || null;
    structure.graphicsLevel = graphicsLevel;
    structure.tubeRadius = tubeRadius;
    structure.colorMap = colorMap;
    structure.colorValues = colorValues;
    structure.minColorValue = cmin;
    structure.maxColorValue = cmax;
    var all_coords = pointsToCurve(objectText);
    structure.coords = all_coords;
    var g = graphicsOptions[graphicsLevel];
    structure.graphicsOptions = g;
    var geometry = constructGeometryArray(all_coords, tubeRadius, 
            g.tubeSegments, g.sphereWidthSegments, g.sphereHeightSegments);
    // colors... this is terrible because we can't just take in a bedfile...
    var colors = [];
    if (colorValues != null && colorValues.length >= all_coords.length) {
        if (colorValues.length > all_coords.length) {
            alert("Warning there are extra color values - truncating");
        }
        colors = coordsToColors(all_coords.length, colorMap, colorValues,
                cmin, cmax);
    } else if(colorValues != null && colorValues.length > 0 && colorValues.length < all_coords.length) {
        alert("Warning: There are too few color values");
        colors = coordsToColors(all_coords.length, colorMap, null);
    } else {
        colors = coordsToColors(all_coords.length, colorMap, null);
    }
    structure.colors = colors;
    setGeometryColors(geometry, colors, g.tubeSegments);
    // TODO: add something for setting certain segments invisible
    //console.log(geometry);
    var material = new THREE.MeshPhongMaterial( { color : 0xffffff, opacity:0, 
          shading: THREE.FlatShading, vertexColors: THREE.VertexColors} );
    structure.material = material;
    var splineObject = createMeshes(all_coords, geometry, material);
    structure.meshes = splineObject;
    return structure;
}

/**
 * Returns a structure that is a copy of the old structure, with
 * optional new objectText 
 * */
function copyDNAStructure(oldStructure, objectText) {
    // TODO: need a function to create an objectText from a structure, since
    // reloadStructureParams uses the objectText...
    // Or is it a better idea to make reloadStructureParams to use the
    // structure coords rather than the objectText?
    var newValues = oldStructure.colorValues;
    objectText = objectText || oldStructure.objectText;
    bedText = oldStructure.bedText;
    var structure = new DNAStructure(objectText, bedText);
    structure.description = oldStructure.description;
    structure.graphicsLevel = oldStructure.graphicsLevel;
    structure.tubeRadius = oldStructure.tubeRadius;
    structure.colorMap = oldStructure.colorMap;
    structure.colorValues = newValues;
    structure.minColorValue = oldStructure.minColorValue;
    structure.maxColorValue = oldStructure.maxColorValue;
    var all_coords = pointsToCurve(objectText);
    structure.coords = all_coords;
    structure.graphicsOptions = oldStructure.graphicsOptions;
    var g = structure.graphicsOptions;
    var geometry = constructGeometryArray(all_coords, structure.tubeRadius,
        g.tubeSegments, g.sphereWidthSegments, g.sphereHeightSegments);
    structure.geometry = geometry;
    structure.colors = oldStructure.colors;
    setGeometryColors(geometry, structure.colors, g.tubeSegments);
    var material = new THREE.MeshPhongMaterial( { color : 0xffffff, opacity:0,
                  shading: THREE.FlatShading, vertexColors: THREE.VertexColors} );
    structure.material = material;
    var splineObject = createMeshes(all_coords, structure.geometry, 
            structure.material);
    structure.meshes = splineObject;
    return structure;
}

// 1. setting up the basic scene
var views = [];
var h = windowHeight;
var w = windowWidth - 5;
var view1 = createNewView(w, h);
views.push(view1);

// 2. setting up the geometry...

// global parameters
var structures = [];
var structure1 = new DNAStructure();
structures.push(structure1);

// graphics options
var graphicsOptions = {
    low: {tubeSegments: 3, sphereWidthSegments: 3, sphereHeightSegments: 2},
    medium: {tubeSegments: 16, sphereWidthSegments: 8, sphereHeightSegments: 6},
    high: {tubeSegments: 64, sphereWidthSegments: 16, sphereHeightSegments: 12}};

/**
 * Given a string of coords, this returns an array of Vector3 objects.
 * */
function pointsToCurve(coords) {
    var coords_str = coords.trim().split("\n");
    //console.log(coords_str);
    var all_coords = Array(Number(coords_str[0]));
    for (var i in coords_str) {
        var c = coords_str[i];
        var c_nums = c.trim().split(" ");
        if (c_nums.length === 1)
            continue;
        else if (c_nums.length === 3) {
            all_coords[i-1] = new THREE.Vector3(Number(c_nums[0]), 
                    Number(c_nums[1]), Number(c_nums[2]));
        }
    }
    return all_coords;
}

/**
 * Given an array of Vector3 objects, this returns a string
 * */
function curveToString(coords) {
    var s = "";
    s = s + String(coords.length) + "\n";
    for (var i = 0; i<coords.length; i++) {
        s = s + String(coords[i].x) + " " + String(coords[i].y) + " "
            + String(coords[i].z) + "\n";
    }
    return s;
}

/**
 * Given an array of Vector3 objects, this returns an array containing
 * THREE.Color objects for each point. Right now this just does linear
 * interpolation.
 * */
function coordsToColors(num_points, colorScheme, values, cmin, cmax) {
    var l = num_points;
    var colors = [];
    if (values === null) {
        // do linear interpolation
        for (var i = 0; i<num_points; i++) {
            colors.push(new THREE.Color(makeColor(i, 0, l-1, colorScheme)));
        }
    } else {
        // need to get min, max
        if (cmin === null || cmax === null || cmin === cmax) {
            cmin = min(values);
            cmax = max(values);
        }
        for (i = 0; i<num_points; i++) {
            colors.push(new THREE.Color(makeColor(values[i], cmin, cmax, colorScheme)));
        }
    }
    return colors;
}

/**
 * Given a text file, this generates a geometry and replaces oldObject.
 * */
function reloadObject(view, newStructure, oldStructure, noRemove) {
    if (oldStructure && !noRemove) {
        removeObjectsFromScene(oldStructure.meshes, view.scene);
        var oldIndex = view.structures.indexOf(oldStructure);
        view.structures.splice(oldIndex, 1);
    }
    addMeshesToScene(newStructure.meshes, view.scene);
    view.structures.push(newStructure);
    view.descriptionBox = createDescriptionFromView(view, views.indexOf(view));
    render();
}

// 3. Setting up mouse interactions
// No need
// registering mouse events - unnecessary since this is all done in control

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
 *  - removed_bins - the bins that should be removed - an array of ints
 * */
function readBedfile(bedfile, resolution, chrom, value_name, arm, removed_bins) {
    console.log("readBedfile");
    if (bedfile.length === 0) {
        return [];
    }
    var values = [];
    var bedfile_split = bedfile.trim().split("\n");
    var line1 = bedfile_split[0].trim().split(/\s+/);
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
    var selectedArm = 0 || arm;
    // default value for ldict - position of each column
    ldict.chr = ldict.chr || 0;
    ldict.start = ldict.start || 1;
    ldict.end = ldict.end || 2;
    if (selectedArm !== 0 && ldict.arm == undefined) {
        console.log("Bedfile contains no arm information, ignoring");
        selectedArm = 0;
    }
    ldict[value_name] = ldict[value_name] || (line1.length - 1);
    for (var i = 0; i<bedfile_split.length; i++) {
        var line_values = bedfile_split[i].trim().split(/\s+/);
        //console.log(line_values);
        var chr = line_values[ldict.chr];
        // TODO: something like bedtools intersect
        if (chr == chrom) {
            if (selectedArm != 0) {
                var bin_arm = line.values[ldict.arm];
                if (bin_arm != selectedArm) {
                    continue;
                }
            }
            var start = line_values[ldict.start];
            var end = line_values[ldict.end];
            var val = line_values[ldict[value_name]];
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

function onWindowResizeListener(evt) {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    var w = windowWidth/(views.length) - 10;
    var h = windowHeight;
    for (var i = 0; i<views.length; i++) {
        var view = views[i];
        view.camera.aspect = w / h;
        view.camera.updateProjectionMatrix();
        view.renderer.setSize( w, h );
        view.controls.handleResize();
    }
    render();
}
window.addEventListener('resize', onWindowResizeListener, false);

/**
 * Resets the camera to its original position, and links all the cameras.
 *
 * */
function resetCamera(zoomSetting) {
    var v = views[0];
    var renderer = v.renderer;
    var camera = new THREE.PerspectiveCamera(60, 
        renderer.domElement.width/renderer.domElement.height, 
        0.001, 1000);
    camera.position.z = 5*zoomSetting;
    camera.updateProjectionMatrix();
    v.camera = camera;
    v.controls = newControls(v);
    for (var i = 0; i<views.length; i++) {
        v = views[i];
        v.camera = camera;
        v.controls = newControls(v);
    }
    render();
}

/**
 * Unlinks cameras and resets the zoom.
 * */
function unlinkCameras(zoomSetting) {
    for (var i = 0; i<views.length; i++) {
        var v = views[i];
        var renderer = v.renderer;
        var camera = new THREE.PerspectiveCamera(60, 
                renderer.domElement.width/renderer.domElement.height, 
                0.001, 1000);
        camera.position.z = 5*zoomSetting;
        camera.updateProjectionMatrix();
        var controls = new THREE.TrackballControls(camera, 
        renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', render );
        v.camera = camera;
        v.controls = controls;
    }
    render();
}

function animate() {
    requestAnimationFrame( animate );
    for (var i = 0; i<views.length; i++) {
        views[i].controls.update();
    }
}

function render() { 
    for (var i = 0; i<views.length; i++) {
        var camera = views[i].camera;
        var light2 = views[i].trackingLight;
        var scene = views[i].scene;
        light2.position.set(camera.position.x, 
                camera.position.y, camera.position.z);
        views[i].renderer.render( scene, camera ); 
    }
} 

/**
 * Takes a screenshot...
 * */
function snapshot(viewId) {
    render();
    var urlData = views[viewId].renderer.domElement.toDataURL();
    window.open(urlData, "_blank");
}



// Running
objectText = "5\n0.566046 0.297772 0.928499\n0.610989 0.358840 0.944009\n0.702651 0.392072 0.915918\n0.788991 0.373088 0.865537\n0.885824 0.423299 0.798283\n0.938226 0.431045 0.807664\n0.979563 0.436933 0.850140\n0.879564 0.392228 0.872330\n0.986126 0.514608 0.806436\n1.014283 0.272586 0.776961\n1.023788 0.293796 0.818363\n1.070421 0.368948 0.809370\n1.111069 0.396415 0.776139\n1.173737 0.444256 0.861438\n1.197271 0.408099 0.874555\n1.138319 0.335163 0.959901\n1.068201 0.324114 0.975166\n0.991536 0.322119 0.996538\n0.893452 0.358959 0.987836\n0.827682 0.372347 0.959612\n0.741301 0.335776 0.994867";

var structure1 = createDNAStructure(objectText, ""); 
reloadObject(view1, structure1, null);


