// Okay, so this doesn't work... How about let's build a new geometry system?
// instead of having a bunch of points, how about let's just use an
// array of geometries? Have a whole ton of LineCurve3s, one for each line
// segment.
function constructGeometryArray(points, tubeRadius, tubeSegments,
        sphereWidthSegments, sphereHeightSegments) {
    var geometries = [];
    var balls = []
    for (var i = 0; i<points.length-1; i++) {
        var p = points[i];
        var p2 = points[i+1];
        var c = new THREE.LineCurve3(p, p2);
        var g = new THREE.TubeGeometry(c, 1, tubeRadius, tubeSegments, false);
        geometries.push(g);
        var b = new THREE.SphereGeometry(tubeRadius, sphereWidthSegments, 
                sphereHeightSegments);
        balls.push(b);
    }
    var b = new THREE.SphereGeometry(tubeRadius);
    balls.push(b);
    return [geometries, balls];
}

/**
 * This function updates the colors of all the geometries.
 *
 * geometries - array of three.js geometry objects
 * colors - array of colors
 * tubeSegments - number of segments per tube
 * */
function setGeometryColors(geometries, colors, tubeSegments) {
    for (var i = 0; i<geometries[0].length; i++) {
        var g = geometries[0][i];
        for (var j = 0; j<tubeSegments*2; j++) {
            var face = g.faces[j];
            var ci = i;
            face.color = colors[ci];
            face.vertexColors[0] = colors[ci];
            face.vertexColors[1] = colors[ci];
            face.vertexColors[2] = colors[ci];
            face.vertexColors[3] = colors[ci];
        }
        var b = geometries[1][i];
        for (var j = 0; j<b.faces.length; j++) {
            b.faces[j].color = colors[i];
        }
    }
}

/**
 * Creates an array of meshes (tubes and balls) from geometries
 *
 * TODO: allow multiple materials (for invisibility and stuff)?
 *
 * */
function createMeshes(points, geometries, material) {
    var meshes = [];
    for (var i = 0; i<geometries[0].length; i++) {
        var m = new THREE.Mesh(geometries[0][i], material);
        var m2 = new THREE.Mesh(geometries[1][i], material);
        m2.position.x = points[i].x;
        m2.position.y = points[i].y;
        m2.position.z = points[i].z;
        meshes.push(m);
        meshes.push(m2);
    }
    return meshes;
}

function addMeshesToScene(meshes, scene) {
    for (var i = 0; i<meshes.length; i++) {
        scene.add(meshes[i]);
    }
}

/**
 * Returns an array of meshes
 * */
function addGeometriesToScene(points, geometries, material, scene) {
    var meshes = [];
    for (var i = 0; i<geometries[0].length; i++) {
        var m = new THREE.Mesh(geometries[0][i], material);
        var m2 = new THREE.Mesh(geometries[1][i], material);
        m2.position.x = points[i].x;
        m2.position.y = points[i].y;
        m2.position.z = points[i].z;
        meshes.push(m);
        meshes.push(m2);
        scene.add(m);
        scene.add(m2);
    }
    return meshes;
}

/**
 * Remove all objects from a scene.
 * */
function removeObjectsFromScene(objects, scene) {
    for (var i = 0; i<objects.length; i++) {
        scene.remove(objects[i]);
    }
}

