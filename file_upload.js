
/**
 * General function for updating parameters of a structure
 *
 * */
function reloadStructureParams(newObjectText, newBedText) {
    var tubeRadius = document.getElementById("radius").value;
    var res = Number(document.getElementById("resolution").value);
    var chrom = document.getElementById("chrom").value;
    var bedText = newBedText || "";
    var objectText = newObjectText || "";
    var excludedBins = document.getElementById("excluded").value;
    var columnName = document.getElementById("value-name").value;
    var arm = Number(document.getElementById("arm-select").value);
    excludedBins = excludedBins.split(",").map(function (x) {return Number(x)});
    var graphicsLevel = document.getElementById("graphics-level").value;
    var selectedColorScheme = document.getElementById("color-scheme").value;
    var colorMap = colorSchemes[selectedColorScheme];
    var viewId = document.getElementById("view-id").value;
    var view = views[viewId];
    var oldStructure = view.structures[0];
    if (!oldStructure) {
        var newStructure = createDNAStructure(objectText, bedText, [],
                graphicsLevel, tubeRadius, colorMap);
        reloadObject(view, newStructure, null);
    } else {
        var newValues = oldStructure.colorValues;
        objectText = objectText || oldStructure.objectText;
        bedText = bedText || oldStructure.bedText;
        newValues = readBedfile(bedText, res, chrom, 
                columnName, arm, excludedBins);
        var newStructure = createDNAStructure(objectText, bedText,
                    newValues, graphicsLevel, tubeRadius, colorMap);
        reloadObject(view, newStructure, oldStructure);
    }

}

/**
 * File upload handler
 * */
function handleFileSelect(evt) {
    var target = document.getElementById("files");
    var files = evt.target.files; // FileList object
    console.log(files);
    var f = target.files[0];
    var r = new FileReader();
    r.onload = function(e) {
        var fileData = e.target.result;
        reloadStructureParams(fileData, ""); 
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
        var fileData = e.target.result;
        reloadStructureParams("", fileData);
    };
    r.readAsText(f);
    //files is a FileList of File objects. List some properties.
    var output = [];
}

/**
 * Callback for the "update" button
 * */
function updateOptions(evt) {
    reloadStructureParams("", "");
    //resetCamera(document.getElementById('zoom-number').value);
}

document.getElementById('files').addEventListener('change', 
        handleFileSelect, false);

document.getElementById('bedfiles').addEventListener('change', 
        handleBedfileSelect, false);

