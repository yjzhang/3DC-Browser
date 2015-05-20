var oldViewId = 0;

/**
 * General function for updating parameters of a structure
 *
 * */
function reloadStructureParams(newObjectText, newBedText, objectFileName,
        bedFileName, updateColors) {
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
    var minColor = Number(document.getElementById("min-color").value);
    var maxColor = Number(document.getElementById("max-color").value);
    var viewId = document.getElementById("view-id").value;
    var view = views[viewId];
    var oldStructure = view.structures[0];
    if (!oldStructure) {
        var newStructure = createDNAStructure(objectText, bedText, [],
                graphicsLevel, tubeRadius, colorMap, minColor, maxColor);
        newStructure.description = objectFileName || "";
        newStructure.colorDesc = "";
        reloadObject(view, newStructure, null);
    } else {
        var newValues = oldStructure.colorValues;
        objectText = objectText || oldStructure.objectText;
        bedText = bedText || oldStructure.bedText;
        newValues = readBedfile(bedText, res, chrom, 
                columnName, arm, excludedBins);
        var newStructure = createDNAStructure(objectText, bedText,
                newValues, graphicsLevel, tubeRadius, colorMap,
                minColor, maxColor);
        newStructure.description = objectFileName || 
                oldStructure.description || "";
        newStructure.colorDesc = oldStructure.colorDesc;
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
    var fileName = f.name;
    var r = new FileReader();
    r.onload = function(e) {
        var fileData = e.target.result;
        reloadStructureParams(fileData, "", fileName, ""); 
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
    var fileName = f.name;
    console.log(f);
    var r = new FileReader();
    r.onload = function(e) {
        // parse removed_bins, resolution
        var fileData = e.target.result;
        var viewId = document.getElementById("view-id").value;
        var view = views[viewId];
        var oldStructure = view.structures[0];
        oldStructure.bedText = fileData;
        oldStructure.colorDesc = fileName;
    };
    r.readAsText(f);
    //files is a FileList of File objects. List some properties.
    var output = [];
}

/**
 * Callback for the "update" button
 * */
function updateOptions(evt) {
    reloadStructureParams("", "", "", "");
    //resetCamera(document.getElementById('zoom-number').value);
}

function changeViewHandler(evt) {
    var newViewId = document.getElementById("view-id").value;
    updateViewDisplaySettings(newViewId);
}


/**
 * Updates the fields in the control panel to the correct view
 * */
function updateViewDisplaySettings(newViewId) {
    var nv = views[newViewId];
    var ov = views[oldViewId];
    if (oldViewId == newViewId) {
        return;
    }
    if (ov.controlPanelValues === null) {
        ov.controlPanelValues = new ControlPanelValues();
        var cpv = ov.controlPanelValues;
        cpv.structure = document.getElementById("files");
        cpv.bedfile = document.getElementById("bedfiles");
    }
    var cpv = ov.controlPanelValues;
    cpv.graphicsLevel = document.getElementById("graphics-level").value;
    cpv.radius = document.getElementById("radius").value;
    cpv.minValue = document.getElementById("min-color").value;
    cpv.maxValue = document.getElementById("max-color").value;
    cpv.excludedBins = document.getElementById("excluded").value;
    cpv.column = document.getElementById("value-name").value;

    if (nv.controlPanelValues === null) {
        nv.controlPanelValues = new ControlPanelValues();
        // TODO: create new input element
        var npv = nv.controlPanelValues;
        npv.structure = cpv.structure.cloneNode();
        npv.structure.addEventListener('change', handleFileSelect, false);
        npv.bedfile = cpv.bedfile.cloneNode();
        npv.bedfile.addEventListener('change', handleBedfileSelect, false);
    } 
    var npv = nv.controlPanelValues;
    // this is necessary because it's trapped in a paragraph...
    document.getElementById("structure-controls").replaceChild(
            npv.structure, cpv.structure);
    document.getElementById("bedfile-controls").replaceChild(
            npv.bedfile, cpv.bedfile);
    document.getElementById("radius").value = npv.radius;
    document.getElementById("min-color").value = npv.minValue;
    document.getElementById("max-color").value = npv.maxValue;
    document.getElementById("excluded").value = npv.excludedBins;
    document.getElementById("value-name").value = npv.column;
    
    oldViewId = newViewId;
}

// Event handlers

// TODO: this causes a bug in Chrome - when you want to upload one
// file to two views, the 'change' event is not called
document.getElementById('files').addEventListener('change', 
        handleFileSelect, false);

document.getElementById('bedfiles').addEventListener('change', 
        handleBedfileSelect, false);

document.getElementById("view-id").addEventListener('change',
        changeViewHandler, false);
