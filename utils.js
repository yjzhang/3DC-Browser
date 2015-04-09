/**
 * Generic utility functions for JS
 * */

/**
 *
 * */
function range(start, stop, step) {
    if (step === 0) {
        throw TypeError("Step cannot be zero.");
    }
    var range = [];
    var i = start;
    while (i < stop) {
        range.push(i);
        i += step;
    }
    return range;
}

function min(array) {
    return array.reduce(function (x, y) ((y < x) ? y : x));
}

function max(array) {
    return array.reduce(function (x, y) ((y > x) ? y : x));
}

function contains(array, value) {
    return array.reduce(function (x, y) (x | (y==value)), false); 
}
