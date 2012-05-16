if(location.hash) {
    // Redirect to use hash as query string
    location.href = "http://" + location.host + location.pathname + "?" + location.hash.substring(1);
}
else {

    var board = document.getElementById("board");
    var level = new Level(board);
    
    var grid = true;

    var openPlayUrl = function() {
        console.log("openPlayUrl()");
        var url = "index.html?" + level.serialize();
        window.open(url, "_blank");
    }
    
    var updateSerialization = function() {
        console.log("updateSerialization()");
        var serialization_with_images = level.serialize(true);
        var serialization_without_images = level.serialize(false);
        document.getElementById("serialization_with_images").innerHTML = serialization_with_images;
        document.getElementById("serialization_without_images").innerHTML = serialization_without_images;
        //document.getElementById("serialization_without_images_img").src = "http://qrcode.kaywa.com/img.php?s=4&d=" + serialization_without_images;
        location.hash = serialization_with_images;

    	parent.window.postMessage(serialization_without_images, "*");
    }
    
    level.unserialize(window.location.search.substring(1));
    updateSerialization();
    
    /* Item buttons */
    var onItemSelected = function() {
        console.log("select()");
        for(var i=0; i<selectables.length; i++) {
            selectables[i].classList.remove("down");
        }
        selection = this.getAttribute("type");
        this.classList.add("down");
        
        if(selection == "erase") {
            cursor.src = "images/editor_erase.png";
        }
        else if(selection == "move") {
            cursor.src = "images/editor_hand.png";
        }
        else {
            cursor.src = imgStore[selection].src;
        }
    }
    var selection;
    var selectables = document.getElementsByClassName("selectable");
    for(var i=0; i<selectables.length; i++) {
        selectables[i].addEventListener("click", onItemSelected);
    }
    
    /* Cursor management */
    var movingItem = null;
    var cursor = document.getElementById("cursor");
    cursor.width = level.unitHeight();
    cursor.height = level.unitHeight();
    board.onmousemove = function(e) {
        var unitHeight = level.unitHeight();
        var x = Math.max(0,Math.min(level.boardWidth()-unitHeight, parseInt(e.pageX - board.offsetLeft - container.offsetLeft - unitHeight/2)));
        var y = parseInt(e.pageY - board.offsetTop - container.offsetTop);
        y -= y % unitHeight;
        if(grid) x-= x % unitHeight;
        cursor.style.left = x + "px";
        cursor.style.top = y + "px";
        
        if(movingItem) {
            movingItem.x = x;
            movingItem.y = y;
            
            var itemEl = movingItem.dom;
            itemEl.style.left = movingItem.x + "px";
    		itemEl.style.top = movingItem.y + "px";
        }
    };

    onItemSelected.apply(document.getElementById("default_selectable"));

    board.onmouseup= function(e) {
        var unitHeight = level.unitHeight();
        var x = Math.max(0,Math.min(level.boardWidth()-unitHeight, parseInt(e.pageX - board.offsetLeft - container.offsetLeft - unitHeight/2)));
        var y = parseInt(e.pageY - board.offsetTop - container.offsetTop);
        y -= y % unitHeight;
        if(grid) x-= x % unitHeight;
        console.log("onmouseup: (" + x + "," + y + ")");
    
        if(selection.length > 0) {
            if(selection == "erase") {
                level.removeItemsAtPosition(x,y);
            }
            else if(selection =="move") {
                movingItem = null;
            }
            else {
                if(level.getItemAtPosition(x,y) == null) {
                    level.addItem(selection, x, y, 0);
                }
                else {
                    alert("Sorry, there is already an item on this position!");
                }
            }
        }
        updateSerialization();
    };
    
    board.onmousedown= function(e) {
        var unitHeight = level.unitHeight();
        var x = Math.max(0,Math.min(level.boardWidth()-unitHeight, parseInt(e.pageX - board.offsetLeft - container.offsetLeft - unitHeight/2)));
        var y = parseInt(e.pageY - board.offsetTop - container.offsetTop);
        y -= y % unitHeight;
        if(grid) x-= x % unitHeight;
        console.log("onmousedown: (" + x + "," + y + ")");
        
        if(selection == "move") {
            movingItem = level.getItemAtPosition(x,y); 
            e.preventDefault();
            e.stopPropagation();
        }
    };
    
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
    
    /* Images editors */
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
    
    /* Title editor */
    var titleField = document.getElementById("title_field");
    titleField.value = level.title;
    titleField.addEventListener("change", function() {
        level.title = titleField.value;
        updateSerialization();
    });
    
    /* Background editor */
    var backgroundField = document.getElementById("background_field");
    backgroundField.value = level.backgroundUrl();
    backgroundField.addEventListener("change", function() {
        board.style.backgroundImage = "url('" + backgroundField.value + "')";
        updateSerialization();
    });
    
    /* Grid */
    var gridField = document.getElementById("grid_field");
    gridField.checked = grid;
    gridField.addEventListener("click", function() {
        grid = gridField.checked;
    });
}