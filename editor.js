if(location.hash) {
    // Redirect to use hash as query string
    location.href = location.origin + location.pathname + "?" + location.hash.substring(1);
}

var board = document.getElementById("board");
var level = new Level(board);
level.unserialize(window.location.search.substring(1));
updateSerialization();

function absPath(url){
    var Loc = location.origin + location.pathname;	
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

var cursor = document.getElementById("cursor");
var selection;
var radioChangeCallback = function() {
    if(this.checked) {
        selection = this.value;
        switch(selection) {
            case "wall":
                cursor.src = wallUrl;
                break;
            case "gum":
                cursor.src = gumUrl;
                break;
        }
    }
};

/* Ball editor */
var ballPreview = document.getElementById("ball_preview");
var ballUrlField = document.getElementById("ball_url_field");
var updateBallPreview = function() {
    var url = ballUrlField.value;
    level.setBallUrl(url);
    ballPreview.src = url;
    updateSerialization();
};
ballUrlField.addEventListener("change", updateBallPreview);
ballUrlField.value = ballUrl;
updateBallPreview();
document.getElementById("ball_radio").addEventListener("change", radioChangeCallback);

/* Wall editor */
var wallPreview = document.getElementById("wall_preview");
var wallUrlField = document.getElementById("wall_url_field");
var updateWallPreview = function() {
    var url = wallUrlField.value;
    level.setWallUrl(url);
    wallPreview.src = url;
    updateSerialization();
};
wallUrlField.addEventListener("change", updateWallPreview);
wallUrlField.value = wallUrl;
updateWallPreview();
document.getElementById("wall_radio").addEventListener("change", radioChangeCallback);

/* Gum editor */
var gumPreview = document.getElementById("gum_preview");
var gumUrlField = document.getElementById("gum_url_field");
var updateGumPreview = function() {
    var url = gumUrlField.value;
    level.setGumUrl(url);
    gumPreview.src = url;
    updateSerialization();
};
gumUrlField.addEventListener("change", updateGumPreview);
gumUrlField.value = gumUrl;
updateGumPreview();
document.getElementById("gum_radio").addEventListener("change", radioChangeCallback);

/* Board */
board.addEventListener("mouseover", function(e){
    cursor.style.display = "block";
});
board.addEventListener("mouseout", function(e){
    cursor.style.display = "none";
});
board.addEventListener("mousemove", function(e){
    var x = e.offsetX + board.offsetLeft;
    var y = e.offsetY + board.offsetTop;
    y = y - (y % unitHeight);
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
});
board.addEventListener("click", function(e) {
    var x = e.offsetX;
    var y = e.offsetY - (e.offsetY % unitHeight);
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
