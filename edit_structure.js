/**
 * A collection of functions for editing 3d structures
 *
 * TODO: - structural alignment - given two structures, align them using
 * the Kabsch algorithm
 *
 * 
 * */

/**
 * Returns the mean of a array of 3D coordinates
 * */
function vecMean(coords) {
    var meanVec = [0,0,0];
    for (var i = 0; i<coords.length; i++) {
        meanVec[0] += coords[i][0];
        meanVec[1] += coords[i][1];
        meanVec[2] += coords[i][2];
    }
    meanVec[0] = meanVec[0]/coords.length;
    meanVec[1] = meanVec[0]/coords.length;
    meanVec[2] = meanVec[0]/coords.length;
    return meanVec;
}

/**
 * Unit-wise vector subtraction - subtract vec2 from every entry in vec1
 * */
function dotSubeq(vec1, vec2) {
    for (var i = 0; i<vec1.length; i++) {
        for (var j = 0; j<vec1[i].length; j++) {
            vec1[i][j] -= vec2[j];
        }
    }
}

/**
 * Given two arrays of Vector3D objects, this tries to align the two
 * structures with rotation, returning a copy of coords1 aligned to coords2
 *
 * Assumes that the two structures have equal size 
 *
 * Returns an array of Vector3d objects
 * */
function kabsch(coords1, coords2) {
    var c1_array = coords1.map(function(x){return x.toArray();});   
    var c2_array = coords2.map(function(x){return x.toArray();});   
    //console.log(c1_array)
    //console.log(c2_array)
    var c1_mean = vecMean(c1_array);
    var c2_mean = vecMean(c2_array);
    dotSubeq(c1_array, c1_mean);
    dotSubeq(c2_array, c2_mean);
    var A = numeric.dot(numeric.transpose(c1_array), c2_array);
    //console.log(A);
    var USV = numeric.svd(A);
    var R = numeric.dot(USV.V, numeric.transpose(USV.U));
    console.log(R);
    var c1_rotated = numeric.dot(c1_array, numeric.transpose(R));
    console.log(c1_rotated);
    return c1_rotated.map(function(x){
        return new THREE.Vector3(x[0], x[1], x[2]);
    });
}

/**
 * Given two view IDs, this tries to align the structure in view id1 to 
 * the structure in view id2.
 * */
function alignViews(id1, id2) {
    var view1 = views[id1];
    var view2 = views[id2];
    var struct1 = view1.structures[0].coords;
    var struct2 = view2.structures[0].coords;
    if (!struct1 || !struct2) {
        alert("Error: missing structure");
        return 0;
    }
    if (struct1.length != struct2.length) {
        alert("Error: structures have different lengths");
        return 0;
    }
    var new_struct1 = kabsch(struct1, struct2);
    var new_string1 = curveToString(new_struct1);
    var newStruct1 = copyDNAStructure(view1.structures[0], new_string1);
    reloadObject(view1, newStruct1, view1.structures[0]);
    return 1;
}
