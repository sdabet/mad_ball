Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

function getQueryVariable(query,variable) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return unescape(pair[1]);
        }
    }
}

var container = document.getElementById("container");

var itemTypes = [ "ball", "wall", "gum", "left_bouncer", "right_bouncer", "left_teleporter", "right_teleporter", "invincible", "wall_xmoving", "wall_ymoving", "ghost" ];

// Initialize images
var imgStore = {};
var root = "http://sdabet.github.com/mad_ball/";
var imgUrls = {
    "ball": root + "images/ball.png",
    "wall": root + "images/wall.png",
    "gum": root + "images/smiley.png",
    "left_bouncer": root + "images/left_bouncer.png",
    "right_bouncer": root + "images/right_bouncer.png",
    "left_teleporter": root + "images/left_teleporter.png",
    "right_teleporter": root + "images/right_teleporter.png",
    "invincible": "http://cdn1.iconfinder.com/data/icons/Toolbar_Icon_Set_by_shlyapnikova/32/star.png",
    "wall_xmoving": root + "images/wall_xmoving.png",
    "wall_ymoving": root + "images/wall_ymoving.png",
    "ghost": root + "images/ghost.png"
};
for(var i=0; i<itemTypes.length; i++) {
    var type = itemTypes[i];
    var img = new Image();
    img.style.position = "absolute";
    img.className = "item " + type;
    imgStore[itemTypes[i]] = img;
    
    imgStore[type].src = imgUrls[type];
}

var Level = function(board) {
    
    var item_sep = ";";
    var coord_sep = ",";
    
    var items = [];
    
    var drawItem = function(i) {
        var item = items[i];
        var itemEl = imgStore[item.type].cloneNode(true);
    	itemEl.style.left = item.x + "px";
		itemEl.style.top = item.y + "px";
        itemEl.style.width = item.w + "px";
        itemEl.style.height = item.h + "px";
		board.appendChild(itemEl);
		item.dom = itemEl;
    };       
        
	/*
	 * Check if there is a collision between an area and a set of items
	 */
	var findCollision = function(x, y, w, h) {
		for(var i = 0; i < items.length; i++) {
			var item = items[i];
			var collisionX = x + w > item.x && x < item.x + item.w;
			var collisionY = y + h > item.y && y < item.y + item.h;
			if(collisionX && collisionY) {
				return i;
			}
		}
		return null;
	};

    /* 
	 * Ball implementation 
	 */
	var boule = {
		x: 0,
		y: 0,
		speed: 0, // pixels per second
		draw: function() {
			var style = this.dom.style;
			style.top = this.y + "px";
			style.left = this.x + "px";
            style.width = this.w + "px";
            style.height = this.h + "px";
		},
		/*
		 * Update the position and direction of the ball based on its current speed and the delay since last update
		 */
		animate: function(delay) {
			var delta = parseInt(this.speed * delay / 1000, 10);
			this.x += delta;
			if(this.x <= 0) {
				this.speed = -this.speed;
				this.x = 0;
			}
			else if(this.x >= board.offsetWidth-this.w) {
				this.speed = -this.speed;
				this.x = board.offsetWidth-this.w;
			}
			this.draw();
		},
		/*
		 * Ball goes up
		 */
		up: function() {
			if(this.y >= this.h) {
				this.y = this.y - this.h;
			}
		},
		/*
		 * Ball goes down
		 */
		down: function() {
			if(this.y <= board.offsetHeight - 2*this.h) {
				this.y = this.y + this.h;
			}
		}
	};
    
    var setClassUrl = function(className, url) {
        var elements = document.getElementsByClassName(className);
        for(var i=0; i<elements.length; i++) {
            elements[i].src = url;
        }
    };

    return {
        
        title: "",
        
        randomX: function() {
    		return Math.floor(Math.random()*(this.boardWidth()-this.unitHeight()));
    	},
    	randomY: function() {
    		return Math.floor(Math.random()*((this.boardHeight()-this.unitHeight())/this.unitHeight())) * this.unitHeight();
    	},
        
        initBall: function() {
            var unitHeight = this.unitHeight();
            // Remove current ball
            var balls = board.getElementsByClassName("ball");
            if(balls.length > 0) {
                board.removeChild(balls[0]);
            }
            
            /* Init ball position */
    		boule.x = this.randomX();
    		boule.y = 0; // on the first line
            boule.w = unitHeight;
            boule.h = unitHeight;
    		boule.targetY = boule.y;
    		boule.dom = imgStore["ball"].cloneNode(true);
    		board.appendChild(boule.dom);
    		boule.draw();
        },

        lines: 10,
        
        unitHeight: function() {
            return parseInt(this.boardHeight() / this.lines);
        },
        
        boardWidth: function() {
            return board.clientWidth;
        },
        
        boardHeight: function() {
            return board.clientHeight;
        },
        
        ready: function() {
    		container.className = "ready";
            this.initBall();
    	},
        
        clear: function() {
            [].forEach.call( board.querySelectorAll(".item"), function(el) {
                board.removeChild(el);
            });
            items = [];
        },   
        
        setTypeUrl: function(type,src) {
            imgStore[type].src = src;
            setClassUrl(type, src);
        },
        
        setSpeed: function(speed) {
            boule.speed = speed;
        },
        
        animate: function(elapsed) {
    	    boule.animate(elapsed);
        },
        
        ballUp: function() {
            boule.up();
        },
        
        ballDown: function() {
            boule.down();
        },
    
        /*
        * Check if there is any collision between the ball and anything (wall or gum)
        */
        checkCollisions: function(onCrashed, onFinished) {
        	var index = findCollision(boule.x, boule.y, boule.w, boule.h);
            if(index !== null) {
                var item = items[index];
                if(item.type == "wall") {
                    onCrashed();
        			return;
    	    	}
                else if(item.type == "gum") {
            		// Gum collision
                    this.removeItem(index);
                    
                    // Check if there are still gums
                    var isFinished = true;
                    for(var key in items) {
                        if(items[key].type == "gum") {
                            isFinished = false;
                        }
                    }
        			if(isFinished) {
        				onFinished();
        			}
                    
                    // Bounce
        			boule.speed = -boule.speed;
                }
    		}
    	},
        
        addItem: function(type, x, y, timeout) {
            console.log("addItem(" + type + ", " + x + ", " + y + ", " + timeout + ")");
            var i = items.length;
            items[i] = {
                type: type,
                x: x,
                y: y,
                w: this.unitHeight(),
                h: this.unitHeight()
            };
            
            setTimeout(function() {
                drawItem(i)
            }, timeout || 0);
        },
        
        removeItem: function(index) {
            console.log("removeItem(" + index + ")");
    		var item = items[index];
			item.dom.style.width = "0";
			item.dom.style.marginLeft = "15px";
			item.dom.style.marginTop = "15px";
			item.dom.parentNode.removeChild(item.dom);
			items.remove(index, index);
        },

        removeItemsAtPosition: function(x,y) {
            console.log("removeItemsAtPosition(" + x + ", " + y + ")");
            var index = findCollision(x,y,10,10);
            if(index !== null) {
                this.removeItem(index);
            }
        },
        
        getItemAtPosition: function(x,y) {
            var index = findCollision(x,y,10,10);
            if(index !== null) {
                return items[index];
            }
            else {
                return null;
            }
        },       
        
        backgroundUrl: function() {
            var backgroundAttr = window.getComputedStyle(board)["background-image"];
            if(backgroundAttr && backgroundAttr !== "none") {
                return backgroundAttr.substring(4, backgroundAttr.length-1);
            }
            return null;
        },
    
        serialize: function(serialize_urls) {
            var str = "";
            
            // Serialize board dimensions
            str += "boardWidth=" + board.clientWidth;
            str += "&boardHeight=" + board.clientHeight;
            str += "&lines=" + this.lines;
            
            // Serialize ball position
            str += "&ball=" + boule.x + coord_sep + boule.y;

            // Serialize items
            var itemSerialization = {};
            var firstItem = {};
            for(var i=1; i<itemTypes.length; i++) { // Start at 1 : 'ball' is already serialized
                var type = itemTypes[i];
                itemSerialization[type] = "&" + type + "s=";
                firstItem[type] = true;
            }
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                itemSerialization[item.type] += (firstItem[item.type] ? "" : item_sep) + item.x + coord_sep + item.y;
                firstItem[item.type] = false;
            }
            
            for(var i=1; i<itemTypes.length; i++) { // Start at 1 : 'ball' is already serialized
                var type = itemTypes[i];
                if(!firstItem[type]) {
                    str += itemSerialization[type];
                }
            }
            
            // Serialize title
            if(this.title) {
                str += "&title=" + this.title;
            }
            
            if(serialize_urls) {
                for(var i=0; i<itemTypes.length; i++) {
                    var type = itemTypes[i];
                    str += "&" + type + "Url" + encodeURIComponent(imgStore[type].src);
                }
                
                // Serialize background image (remove the url('...'))
                var url = this.backgroundUrl();
                if(url) {
                    str += "&backgroundImage=" + url;
                }
            }
            
            return str;
        },
        
        unserialize: function(query) {
            this.clear();
            
            // Unserialize board dimensions
            var w = getQueryVariable(query, "boardWidth");
            if(w) {
                board.style.width = w + "px";
            }
            var h = getQueryVariable(query, "boardHeight");
            if(h) {
                board.style.height = h + "px";
            }
            var lines = getQueryVariable(query, "lines");
            if(lines) {
                this.lines = lines;
            }
            
            // Unserialize ball position
            var ballStr = getQueryVariable(query, "ball");
            if(ballStr) {
                var ballStrSplit = ballStr.split(coord_sep);
                boule.x = parseInt(ballStrSplit[0]);
                boule.y = parseInt(ballStrSplit[1]);        
            }
            
            // Title
            var title = getQueryVariable(query, "title");
            if(title) {
                this.title = title;
            }            
            
            // Unserialize items
            for(var i=0; i<itemTypes.length; i++) {
                var type = itemTypes[i];
                var itemsStr = getQueryVariable(query, type + "s");
                if(itemsStr) {
                    var itemStrings = itemsStr.split(item_sep);
                    for(var j=0; j<itemStrings.length; j++) {
                        var itemStr = itemStrings[j];
                        var itemStrSplit = itemStr.split(coord_sep);
                        this.addItem(type, parseInt(itemStrSplit[0]), parseInt(itemStrSplit[1]), 100*j);
                    }
                }
            }

            // Unserialize ball url
            var ballUrlString = getQueryVariable(query, "ballUrl");
            if(ballUrlString) {
                this.setTypeUrl("ball", ballUrlString);
            }
            
            // Unserialize image urls
            for(var i=0; i<itemTypes.length; i++) {
                var type = itemTypes[i];
                var itemUrlString = getQueryVariable(query, type + "Url");
                if(itemUrlString) {
                    this.setTypeUrl(type, itemUrlString);
                }
            }
            
            // Unserialize background image
            var backgroundImage = getQueryVariable(query, "backgroundImage");
            if(backgroundImage) {
                board.style.backgroundImage = "url('" + backgroundImage + "')";
            }            
        },
    
        generate: function() {
            var unitHeight = this.unitHeight();
            var gumNumber = parseInt(this.boardHeight() / (2*unitHeight));
            var wallNumber = parseInt(gumNumber);
            console.log("generate: " + gumNumber + " gums & " + wallNumber + " walls");
            this.clear();
            this.initBall();
            
            var margin = 2 * unitHeight;
    
    		/* Init gums */
            var tries = 10;
    		for(var i=0; i < gumNumber; i++) {
    			do {
                    tries--;
    				gum = {
    					x: this.randomX(),
    					y: this.randomY(),
    					w: unitHeight,
    					h: unitHeight
    				};
    			} while(tries > 0 && findCollision(gum.x - margin, gum.y - margin, gum.w + 2*margin, gum.h + 2*margin) !== null);
    			this.addItem("gum", gum.x, gum.y, 100*i);
    		}
    
    		/* Init walls */
            var tries = 10;
    		for(var i=0; i < wallNumber; i++) {
    			var wall;
    			do {
                    tries--;
    				wall = {
    					x: this.randomX(),
    					y: this.randomY(),
    					w: unitHeight,
    					h: unitHeight
    				};
    			} while(
                    tries > 0 &&
    				findCollision(wall.x - margin, wall.y - margin, wall.w + 2*margin, wall.h + 2*margin) !== null
    				|| (wall.y <= boule.y+boule.h && wall.y+wall.h >= boule.y) // no wall on the initial ball row
    			);
                this.addItem("wall", wall.x, wall.y, 100*i);
    		}
        }
    };
};