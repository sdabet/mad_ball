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
        //document.getElementById("serialization_without_images_img").src = "http://qrcode.kaywa.com/img.php?s=4&d=" + encodeURIComponent(serialization_without_images);
        location.hash = serialization_with_images;

    	parent.window.postMessage(serialization_without_images, "*");
    }
    
    document.getElementById("dim_editor").addEventListener("submit", function(e) {
        e.preventDefault();
        level.lines = document.getElementById("lines_field").value;
        board.style.height = document.getElementById("board_height_field").value + "px";
        location.href = "editor.html?" + level.serialize(false);
        return false;
    });
    
    var selectedAnimation = function() {
        return document.getElementById("animation_field").value;
    };
    var onAnimationChanged = function() {
        var animation = selectedAnimation();
        if(selection != "erase" && selection != "move") {
            if(animation == "h") cursor.src = imgUrls["horizontal"];
            else if(animation == "v") cursor.src = imgUrls["vertical"];
            else cursor.src = imgStore[selection].src;
        }
    };
    document.getElementById("animation_field").addEventListener("change", onAnimationChanged);
    
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
            cursor.style.backgroundImage = "url('images/editor_erase.png')";
        }
        else if(selection == "move") {
            cursor.src = "images/editor_hand.png";
            cursor.style.backgroundImage = "url('images/editor_hand.png')";
        }
        else {
            cursor.src = imgStore[selection].src;
            cursor.style.backgroundImage = "url('" + imgStore[selection].src + "')";
            onAnimationChanged();
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
    board.onmouseover = function() {
        cursor.style.visibility = "visible";
    }
    board.onmouseout = function() {
        cursor.style.visibility = "hidden";
    }
    board.onmousemove = function(e) {
        var unitHeight = level.unitHeight();
        var x = Math.max(0,Math.min(level.boardWidth()-unitHeight, parseInt(e.pageX - board.offsetLeft - container.offsetLeft - unitHeight/2)));
        var y = parseInt(e.pageY - board.offsetTop - container.offsetTop);
        y -= y % unitHeight;
        if(grid) x-= x % unitHeight;
        
        if(y < level.lines * unitHeight) {
            cursor.style.left = x + "px";
            cursor.style.top = y + "px";
            
            if(movingItem) {
                movingItem.x = x;
                movingItem.y = y;
                
                var itemEl = movingItem.dom;
                itemEl.style.left = movingItem.x + "px";
        		itemEl.style.top = movingItem.y + "px";
            }
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
                level.removeItemsAtPosition(x,y);
                level.addItem(selection, x, y, selectedAnimation(), 0);
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
    var templateEditor = document.getElementById("item_editor");
    var editors = document.getElementById("item_editors");
    for(var i=0; i<itemTypes.length; i++) {
        var type = itemTypes[i];
        var editor = templateEditor.cloneNode(true);
        editor.id = type + "_editor";
        editor.type = type;
        editor.querySelector(".preview").classList.add(type);
        editor.querySelector(".url_label").innerHTML = type;
        editors.appendChild(editor);
        var itemUrlField = editor.querySelector(".url_field");
        var updateItemPreview = function() {
            var url = this.value;
            level.setTypeUrl(this.parentNode.type, url);
            updateSerialization();
        };
        itemUrlField.addEventListener("change", updateItemPreview);
        itemUrlField.value = imgStore[type].src;
        updateItemPreview.apply(itemUrlField);
        editor.querySelector(".file_field").addEventListener('change', function(e) {
            var parent = this.parentNode;
            handleFileSelect(e, function(data) {
                parent.querySelector(".url_field").value = data;
                level.setTypeUrl(parent.type, data);
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
    
    /* Time editors */
    var time1Field = document.getElementById("time1_field");
    time1Field.value = level.time1;
    time1Field.addEventListener("change", function() {
        level.time1 = time1Field.value;
        updateSerialization();
    });
    var time2Field = document.getElementById("time2_field");
    time2Field.value = level.time2;
    time2Field.addEventListener("change", function() {
        level.time2 = time2Field.value;
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