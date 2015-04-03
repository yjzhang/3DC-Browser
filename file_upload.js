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
    }
    r.readAsText(f);
    //files is a FileList of File objects. List some properties.
    var output = [];
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

document.getElementById('files').addEventListener('change', 
        handleFileSelect, false);

