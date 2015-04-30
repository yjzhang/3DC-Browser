// TODO: this should be a function for constructing a 3d curve using lines...
//
var LinearCurve = THREE.Curve.create(
    // constructor
    // points is an array of THREE.Vector3 objects
    function (points) {
        this.points = points;
    },
    // getPoint - linear interpolation between points
    function(t) {
        console.log(t);
        var len = this.points.length;
        var pointIndex = t*(len-1);
        console.log(pointIndex);
        var lowIndex = Math.floor(pointIndex);
        var highIndex = Math.ceil(pointIndex);
        var between = pointIndex - lowIndex;
        //console.log(between);
        if (highIndex >= len) {
            return this.points[lowIndex-1].clone();
        }

        var lowPoint = this.points[lowIndex].clone();
        var highPoint = this.points[highIndex].clone();
        if (lowPoint == undefined || highPoint == undefined) {
            //console.log(lowPoint);

            return lowPoint;
        }
        var newPoint = lowPoint.add(highPoint.sub(lowPoint).multiplyScalar(between));
        console.log(newPoint);
        return newPoint;
    }
);

// Okay, so this doesn't work... How about let's build a new geometry system?
// instead of having a bunch of points, how about let's just use an
// array of geometries? Have a whole ton of LineCurve3s, one for each line
// segment.
function constructGeometryArray(points, tubeRadius, tubeSegments) {
    var geometries = [];
    for (var i = 0; i<points.length-1; i++) {
        var p = points[i];
        var p2 = points[i+1];
        var c = new THREE.LineCurve3(p, p2);
        var g = new THREE.TubeGeometry(c, 1, tubeRadius, tubeSegments, false);
        geometries.push(g);
    }
    return geometries;
}

function setGeometryColors(geometries, colors, tubeSegments) {
    for (var i = 0; i<geometries.length; i++) {
        var g = geometries[i];
        for (var j = 0; j<tubeSegments*2; j++) {
            var face = g.faces[j];
            var ci = i;
            face.color = colors[ci];
            face.vertexColors[0] = colors[ci];
            face.vertexColors[1] = colors[ci];
            face.vertexColors[2] = colors[ci];
            face.vertexColors[3] = colors[ci];
        }
    }
}

/**
 * Returns an array of meshes
 * */
function addGeometriesToScene(geometries, material, scene) {
    var meshes = [];
    for (var i = 0; i<geometries.length; i++) {
        var m = new THREE.Mesh(geometries[i], material);
        meshes.push(m);
        scene.add(m);
    }
    return meshes;
}

/**
 *
 * */
function removeObjectsFromScene(objects, scene) {
    for (var i = 0; i<objects.length; i++) {
        scene.remove(objects[i]);
    }
}

