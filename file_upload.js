//File upload handler
function handleFileSelect(evt) {
    var target = document.getElementById("files");
    var files = evt.target.files; // FileList object
    console.log(files);
    var f = target.files[0];
    console.log(f);
    var r = new FileReader();
    r.onload = function(e) {
        var fileData = e.target.result;
        objectText = fileData;
        splineObject = reloadObject(fileData, splineObject);
    };
    r.readAsText(f);
    //files is a FileList of File objects. List some properties.
    var output = [];
}

function handleBedfileSelect(evt) {
    var target = document.getElementById("bedfiles");
    var files = evt.target.files; // FileList object
    console.log(files);
    var f = target.files[0];
    console.log(f);
    var r = new FileReader();
    r.onload = function(e) {
        // parse removed_bins, resolution
        var res = Number(document.getElementById("resolution").value);
        var chrom = document.getElementById("chrom").value;
        var fileData = e.target.result;
        bedText = fileData;
        var excludedBins = document.getElementById("excluded").value;
        excludedBins = excludedBins.split(",").map(function (x) {return Number(x)});
        var newValues = readBedfile(fileData, res, chrom, "eigenvalue", null, excludedBins);
        updateColors(newValues);
        splineObject = reloadObject(objectText, splineObject);
    };
    r.readAsText(f);
    //files is a FileList of File objects. List some properties.
    var output = [];
}

/**
 * Callback for the "update" button
 * */
function updateOptions(evt) {
    var res = Number(document.getElementById("resolution").value);
    var chrom = document.getElementById("chrom").value;
    var excludedBins = document.getElementById("excluded").value;
    tubeRadius = document.getElementById("radius").value
    var newExcludedBins = excludedBins.split(",").map(function (x) Number(x));
    var newValues = readBedfile(bedText, res, chrom, "eigenvalue", null, newExcludedBins);
    updateColors(newValues);
    splineObject = reloadObject(objectText, splineObject);
}

document.getElementById('files').addEventListener('change', 
        handleFileSelect, false);

document.getElementById('bedfiles').addEventListener('change', 
        handleBedfileSelect, false);

