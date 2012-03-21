if(location.hash) {
    // Redirect to use hash as query string
    location.href = "http://" + location.host + location.pathname + "?" + location.hash.substring(1);
}
else {

// Util
function handleFileSelect(evt, callback) {
    var files = evt.target.files; // FileList object
    
    if(files.length > 0) {
        var f = files[0];
    
        // Only process image files.
        if (!f.type.match('image.*')) {
            alert("This file is not an image");
            return;
        }
        
        var reader = new FileReader();
        
        // Closure to capture the file information.
        reader.onload = 
            function(e) {
                Resample(e.target.result, level.unitHeight(), level.unitHeight(), function(data) {
                    callback(data);
                });
            };
        
        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}

//

function updateSerialization() {
    var serialization_with_images = level.serialize(true);
    var serialization_without_images = level.serialize(false);
    document.getElementById("serialization_with_images").innerHTML = serialization_with_images;
    document.getElementById("serialization_without_images").innerHTML = serialization_without_images;
    location.hash = serialization_with_images;
}

function absPath(url){
    var Loc = "http://" + location.host + location.pathname;    
	Loc = Loc.substring(0, Loc.lastIndexOf('/'));
	while (/^\.\./.test(url)){		 
		Loc = Loc.substring(0, Loc.lastIndexOf('/'));
		url= url.substring(3);
	}
	return Loc + '/' + url;
}

function select() {
    for(var i=0; i<selectables.length; i++) {
        selectables[i].classList.remove("down");
    }
    selection = this.getAttribute("type");
    this.classList.add("down");
    
    if(selection == "erase") {
        cursor.src = "editor_erase.png";
    }
    else {
        cursor.src = imgStore[selection].src;
    }
}

var board = document.getElementById("board");
var level = new Level(board);
level.unserialize(window.location.search.substring(1));
updateSerialization();

function openPlayUrl() {
    var url = "index.html?" + level.serialize();
    window.open(url, "_blank");
}

var selection;
var selectables = document.getElementsByClassName("selectable");
for(var i=0; i<selectables.length; i++) {
    selectables[i].addEventListener("click", select);
}

/* Dimension editor */
var widthField = document.querySelector("#board_width_field");
widthField.value = level.boardWidth();
var heightField = document.querySelector("#board_height_field");
heightField.value = level.boardHeight();
var linesField = document.querySelector("#lines_field");
linesField.value = level.lines;

linesField.addEventListener('change', function() {
    heightField.value = 32 * linesField.value;
});

/* Editors */
for(var i=0; i<itemTypes.length; i++) {
    var type = itemTypes[i];
    var itemUrlField = document.getElementById(type + "_url_field");
    var updateItemPreview = function() {
        var url = itemUrlField.value;
        level.setTypeUrl(type, url);
        updateSerialization();
    };
    itemUrlField.addEventListener("change", updateItemPreview);
    itemUrlField.value = imgStore[type].src;
    updateItemPreview();
    document.getElementById(type + "_file_field").addEventListener('change', function(e) {
        handleFileSelect(e, function(data) {
            itemUrlField.value = data;
            level.setTypeUrl(type, data);
            updateSerialization();
        })
    }, false);
}

/* Background editor */
var backgroundField = document.getElementById("background_field");
backgroundField.value = level.backgroundUrl();
backgroundField.addEventListener("change", function() {
    board.style.backgroundImage = "url('" + backgroundField.value + "')";
    updateSerialization();
});

/* Board */
var cursor = document.getElementById("cursor");
cursor.width = level.unitHeight();
cursor.height = level.unitHeight();
board.onmousemove = function(e) {
    var unitHeight = level.unitHeight();
    var x = Math.max(0,Math.min(level.boardWidth()-unitHeight, parseInt(e.pageX - board.offsetLeft - container.offsetLeft - unitHeight/2)));
    var y = parseInt(e.pageY - board.offsetTop - container.offsetTop);
    y -= y % unitHeight;
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
};
board.onclick= function(e) {
    var unitHeight = level.unitHeight();
    var x = Math.max(0,Math.min(level.boardWidth()-unitHeight, parseInt(e.pageX - board.offsetLeft - container.offsetLeft - unitHeight/2)));
    var y = parseInt(e.pageY - board.offsetTop - container.offsetTop);
    y -= y % unitHeight;
    console.log("Clic: (" + x + "," + y + ")");

    if(selection.length > 0) {
        if(selection == "erase") {
            level.removeItemsAtPosition(x,y);
        }
        else {
            level.addItem(selection, x, y, 0);
        }
    }
    updateSerialization();
};

}