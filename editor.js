if(location.hash) {
    // Redirect to use hash as query string
    location.href = "http://" + location.host + location.pathname + "?" + location.hash.substring(1);
    return;
}

// Util

function hasClass(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
function addClass(ele,cls) {
	if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}
function removeClass(ele,cls) {
	if (hasClass(ele,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
}
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

var board = document.getElementById("board");
var level = new Level(board);
level.unserialize(window.location.search.substring(1));
updateSerialization();

function absPath(url){
    var Loc = "http://" + location.host + location.pathname;	
	Loc = Loc.substring(0, Loc.lastIndexOf('/'));
	while (/^\.\./.test(url)){		 
		Loc = Loc.substring(0, Loc.lastIndexOf('/'));
		url= url.substring(3);
	}
	return Loc + '/' + url;
}

function updateSerialization() {
    var serialization = level.serialize();
    document.getElementById("serialized").innerHTML = absPath("editor.html?" + serialization);
    location.hash = level.serialize();
}

function openPlayUrl() {
    var url = "index.html?" + level.serialize();
    window.open(url, "_blank");
}

var selection;
var selectables = document.getElementsByClassName("selectable");
for(var i=0; i<selectables.length; i++) {
    selectables[i].addEventListener("click", select);
}
function select() {
    for(var i=0; i<selectables.length; i++) {
        removeClass(selectables[i], "down");
    }
    selection = this.getAttribute("type");
    addClass(this, "down");
    
    switch(selection) {
        case "wall":
            cursor.src = wallImg.src;
            break;
        case "gum":
            cursor.src = gumImg.src;
            break;
        case "erase":
            cursor.src = "editor_erase.png";
            break;
    }
}

/* Dimension editor */
var widthField = document.querySelector("#board_width_field");
widthField.value = level.boardWidth();
var heightField = document.querySelector("#board_height_field");
heightField.value = level.boardHeight();
var linesField = document.querySelector("#lines_field");
linesField.value = level.lines;

/* Ball editor */
var ballUrlField = document.getElementById("ball_url_field");
var updateBallPreview = function() {
    var url = ballUrlField.value;
    level.setBallUrl(url);
    updateSerialization();
};
ballUrlField.addEventListener("change", updateBallPreview);
ballUrlField.value = ballImg.src;
updateBallPreview();
document.getElementById("ball_file_field").addEventListener('change', function(e) {
    handleFileSelect(e, function(data) {
        ballUrlField.value = data;
        level.setBallUrl(data);
        updateSerialization();
    })
}, false);

/* Wall editor */
var wallUrlField = document.getElementById("wall_url_field");
var updateWallPreview = function() {
    var url = wallUrlField.value;
    level.setWallUrl(url);
    updateSerialization();
};
wallUrlField.addEventListener("change", updateWallPreview);
wallUrlField.value = wallImg.src;
updateWallPreview();
document.getElementById("wall_file_field").addEventListener('change', function(e) {
    handleFileSelect(e, function(data) {
        wallUrlField.value = data;
        level.setWallUrl(data);
        updateSerialization();
    })
}, false);

/* Gum editor */
var gumUrlField = document.getElementById("gum_url_field");
var updateGumPreview = function() {
    var url = gumUrlField.value;
    level.setGumUrl(url);
    updateSerialization();
};
gumUrlField.addEventListener("change", updateGumPreview);
gumUrlField.value = gumImg.src;
updateGumPreview();
document.getElementById("gum_file_field").addEventListener('change', function(e) {
    handleFileSelect(e, function(data) {
        gumUrlField.value = data;
        level.setGumUrl(data);
        updateSerialization();
    })
}, false);

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
    switch(selection) {
        case "wall":
            level.addWall(x, y, 0);
            break;
        case "gum":
            level.addGum(x, y, 0);
            break;
        case "erase":
            level.removeItemsAtPosition(x,y);
            break;
    }
    updateSerialization();
};
