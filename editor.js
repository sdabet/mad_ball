loadImages(function() {
    Level.unserialize(window.location.search.substring(1));
    updateSerialization();
});

function absPath(url){
    var Loc = location.href;	
	Loc = Loc.substring(0, Loc.lastIndexOf('/'));
	while (/^\.\./.test(url)){		 
		Loc = Loc.substring(0, Loc.lastIndexOf('/'));
		url= url.substring(3);
	}
	return Loc + '/' + url;
}

function updateSerialization() {
    document.getElementById("serialized").innerHTML = absPath("editor.html?" + Level.serialize());
}

function openPlayUrl() {
    var url = "index.html?" + Level.serialize();
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
    ballUrl = ballUrlField.value;
    ballImg.src = ballUrl;
    ballPreview.src = ballUrl
};
ballUrlField.addEventListener("change", updateBallPreview);
ballUrlField.value = absPath(ballUrl);
updateBallPreview();
document.getElementById("ball_radio").addEventListener("change", radioChangeCallback);

/* Wall editor */
var wallPreview = document.getElementById("wall_preview");
var wallUrlField = document.getElementById("wall_url_field");
var updateWallPreview = function() {
    wallUrl = wallUrlField.value;
    wallImg.src = wallUrl;
    wallPreview.src = wallUrl;
};
wallUrlField.addEventListener("change", updateWallPreview);
wallUrlField.value = absPath(wallUrl);
updateWallPreview();
document.getElementById("wall_radio").addEventListener("change", radioChangeCallback);

/* Gum editor */
var gumPreview = document.getElementById("gum_preview");
var gumUrlField = document.getElementById("gum_url_field");
var updateGumPreview = function() {
    gumUrl = gumUrlField.value;
    gumImg.src = gumUrl;
    gumPreview.src = gumUrl;
};
gumUrlField.addEventListener("change", updateGumPreview);
gumUrlField.value = absPath(gumUrl);
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
            Level.addWall({
				x: x,
				y: y,
				w: unitHeight,
				h: unitHeight
			}, 0);
            break;
        case "gum":
            Level.addGum({
    			x: x,
				y: y,
				w: unitHeight,
				h: unitHeight
			}, 0);
            break;
    }
    updateSerialization();
});
