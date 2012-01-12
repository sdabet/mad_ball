if(location.hash) {
    // Redirect to use hash as query string
    location.href = "http://" + location.host + location.pathname + "?" + location.hash.substring(1);
    exit();
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
}

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

/* Background editor */
var backgroundField = document.getElementById("background_field");
backgroundField.value = level.backgroundUrl();
backgroundField.addEventListener("change", function() {
    board.style.backgroundImage = "url('" + backgroundField.value + "')";
    updateSerialization();
});

/* Board */
board.addEventListener("click", function(e) {
    var x = e.layerX;
    var y = e.layerY - (e.layerY % unitHeight);
    switch(selection) {
        case "wall":
            level.addWall({
				x: x,
				y: y,
				w: unitHeight,
				h: unitHeight
			}, 0);
            break;
        case "gum":
            level.addGum({
    			x: x,
				y: y,
				w: unitHeight,
				h: unitHeight
			}, 0);
            break;
    }
    updateSerialization();
});
