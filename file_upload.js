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
        // TODO: parse removed_bins, resolution
        var res = Number(document.getElementById("resolution").value);
        var chrom = document.getElementById("chrom").value;
        var fileData = e.target.result;
        var excludedBins = document.getElementById("excluded").value;
        excludedBins = excludedBins.split(",").map(function (x) Number(x));
        var newValues = readBedfile(fileData, res, chrom, "eigenvalue", null, excludedBins);
        splineObject = updateColors(newValues, splineObject);
        //splineObject = reloadObject(fileData, splineObject);
    };
    r.readAsText(f);
    //files is a FileList of File objects. List some properties.
    var output = [];
}

document.getElementById('files').addEventListener('change', 
        handleFileSelect, false);

document.getElementById('bedfiles').addEventListener('change', 
        handleBedfileSelect, false);

