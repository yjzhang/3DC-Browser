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
function mean(coords) {
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
 * Assumes that the two structures are centered
 *
 * Returns an array of Vector3d objects
 * */
function kabsch(coords1, coords2) {
    var c1_array = coords1.map(function(x){return x.toArray();});   
    var c2_array = coords2.map(function(x){return x.toArray();});   
    var c1_mean = mean(c1_array);
    var c2_mean = mean(c2_array);
    dotSubeq(c1_array, c1_mean);
    dotSubeq(c2_array, c2_mean);
    var A = numeric.dot(numeric.transpose(c1_array), c2_array);
    var USV = numeric.svd(A);
    var R = numeric.dot(USV.V, numeric.transpose(usv.U));
    var c1_rotated = numeric.dot(c1_array, numeric.transpose(R));
    return c1_rotated.map(function(x){
        return new THREE.Vector3(x[0], x[1], x[2]);
    });
}
