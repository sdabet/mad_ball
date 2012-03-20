Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

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

var ballImg = new Image();
var wallImg = new Image();
var gumImg = new Image();
var neutralImg = new Image();

var imgStore = {
    "ball": ballImg,
    "wall": wallImg,
    "gum": gumImg,
    "neutral": neutralImg
};

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
     * Start loading all the images and execute the provided callback function when they're all loaded
	 */
	var loadImages = function(callback) {
		var nbLoaded = 0;
		var loadCallback = function() {
			nbLoaded++;
			if(nbLoaded == 3) {
				callback();
			}
		};
		ballImg.addEventListener("load", loadCallback, false);
		wallImg.addEventListener("load", loadCallback, false);
		gumImg.addEventListener("load", loadCallback, false);
		ballImg.src = "ball.png";
		wallImg.src = "wall.png";
		gumImg.src = "smiley.png";
        neutralImg.src = "http://cdn1.iconfinder.com/data/icons/developperss/PNG/Green%20Ball.png";
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

	ballImg.style.position = "absolute";
	ballImg.className = "item ball";
	gumImg.style.position = "absolute";
	gumImg.className = "item gum";
	wallImg.style.position = "absolute";
	wallImg.className = "item wall";
    neutralImg.style.position = "absolute";
	neutralImg.className = "item neutral";

    loadImages(function() {});

    return {
        
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
    		boule.dom = ballImg.cloneNode(true);
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
        	gums = [];
        	walls = [];
        },   
        
        setBallUrl: function(src) {
            ballImg.src = src;
            setClassUrl("ball", src);
        },
        
        setWallUrl: function(src) {
            wallImg.src = src;
            setClassUrl("wall", src);
        },
        
        setGumUrl: function(src) {
            gumImg.src = src;
            setClassUrl("gum", src);
        },
        
        setNeutralUrl: function(src) {
            neutralImg.src = src;
            setClassUrl("neutral", src);
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
            var itemSerialization = {
                "gum": "&gums=",
                "wall": "&walls=",
                "neutral": "&neutrals="
            };
            var firstItem = {
                "gum": true,
                "wall": true,
                "neutral": true
            };                
            
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                itemSerialization[item.type] += (firstItem[item.type] ? "" : item_sep) + item.x + coord_sep + item.y;
                firstItem[item.type] = false;
            }
            
            for(var key in itemSerialization) {
                str += itemSerialization[key];
            }
            
            if(serialize_urls) {
                // Serialize ball url
                str += "&ballUrl=" + encodeURIComponent(ballImg.src);
                
                // Serialize wall url
                str += "&wallUrl=" + encodeURIComponent(wallImg.src);
                
                // Serialize ball url
                str += "&gumUrl=" + encodeURIComponent(gumImg.src);
                
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
            
            // Unserialize walls
            var wallsStr = getQueryVariable(query, "walls");
            if(wallsStr) {
                var wallStrings = wallsStr.split(item_sep);
                for(var i=0; i<wallStrings.length; i++) {
                    var wallStr = wallStrings[i];
                    var wallStrSplit = wallStr.split(coord_sep);
                    this.addItem("wall", parseInt(wallStrSplit[0]), parseInt(wallStrSplit[1]), 100*i);
                }
            }
                    
            // Unserialize gums
            var gumsStr = getQueryVariable(query, "gums");
            if(gumsStr) {
                var gumStrings = gumsStr.split(item_sep);
                for(var i=0; i<gumStrings.length; i++) {
                    var gumStr = gumStrings[i];
                    var gumStrSplit = gumStr.split(coord_sep);
                    this.addItem("gum", parseInt(gumStrSplit[0]), parseInt(gumStrSplit[1]), 100*i);
                }
            }

            // Unserialize neutrals
            var neutralsStr = getQueryVariable(query, "neutrals");
            if(neutralsStr) {
                var neutralStrings = neutralsStr.split(item_sep);
                for(var i=0; i<neutralStrings.length; i++) {
                    var neutralStr = neutralStrings[i];
                    var neutralStrSplit = neutralStr.split(coord_sep);
                    this.addItem("neutral", parseInt(neutralStrSplit[0]), parseInt(neutralStrSplit[1]), 100*i);
                }
            }

            // Unserialize ball url
            var ballUrlString = getQueryVariable(query, "ballUrl");
            if(ballUrlString) {
                this.setBallUrl(ballUrlString);
            }

            // Unserialize wall url
            var wallUrlString = getQueryVariable(query, "wallUrl");
            if(wallUrlString) {
                this.setWallUrl(wallUrlString);
            }
            
            // Unserialize gum url
            var gumUrlString = getQueryVariable(query, "gumUrl");
            if(gumUrlString) {
                this.setGumUrl(gumUrlString);
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