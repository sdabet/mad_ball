loadImages(function() {});

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
    ballPreview.src = ballUrl
};
ballUrlField.addEventListener("change", updateBallPreview);
ballUrlField.value = ballUrl;
updateBallPreview();
document.getElementById("ball_radio").addEventListener("change", radioChangeCallback);

/* Wall editor */
var wallPreview = document.getElementById("wall_preview");
var wallUrlField = document.getElementById("wall_url_field");
var updateWallPreview = function() {
    wallUrl = wallUrlField.value;
    wallPreview.src = wallUrl;
};
wallUrlField.addEventListener("change", updateWallPreview);
wallUrlField.value = wallUrl;
updateWallPreview();
document.getElementById("wall_radio").addEventListener("change", radioChangeCallback);

/* Gum editor */
var gumPreview = document.getElementById("gum_preview");
var gumUrlField = document.getElementById("gum_url_field");
var updateGumPreview = function() {
    gumUrl = gumUrlField.value;
    gumPreview.src = gumUrl;
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
    cursor.style.left = e.offsetX + "px";
    cursor.style.top = (e.offsetY - (e.offsetY % unitHeight)) + "px";
});
board.addEventListener("click", function(e) {
    var offsetY = e.offsetY - (e.offsetY % unitHeight);
    switch(selection) {
        case "wall":
            addWall({
				x: e.offsetX,
				y: offsetY,
				w: unitHeight,
				h: unitHeight
			});
            break;
        case "gum":
            addGum({
    			x: e.offsetX,
				y: offsetY,
				w: unitHeight,
				h: unitHeight
			});
            break;
    }
});
