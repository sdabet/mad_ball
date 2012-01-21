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

var ballImg = new Image();
var wallImg = new Image();
var gumImg = new Image();

var Level = function(board) {
    
    var item_sep = ";";
    var coord_sep = ",";
        
    var gums = [];
	var walls = [];
    
    var drawWall = function(i) {
        var wallEl = wallImg.cloneNode(true);
    	wallEl.style.left = walls[i].x + "px";
		wallEl.style.top = walls[i].y + "px";
        wallEl.style.width = walls[i].w + "px";
        wallEl.style.height = walls[i].h + "px";
		board.appendChild(wallEl);
		walls[i].dom = wallEl;
    };       

    var drawGum = function(i) {
        var gumEl = gumImg.cloneNode(true);
		gumEl.style.left = gums[i].x + "px";
		gumEl.style.top = gums[i].y + "px";
        gumEl.style.width = gums[i].w + "px";
        gumEl.style.height = gums[i].h + "px";
		board.appendChild(gumEl);
		gums[i].dom = gumEl;
    };
        
	/*
	 * Check if there is a collision between an area and a set of items
	 */
	var findCollision = function(x, y, w, h, items) {
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
	ballImg.className = "ball";
	gumImg.style.position = "absolute";
	gumImg.className = "gum";
	wallImg.style.position = "absolute";
	wallImg.className = "wall";

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
            return this.boardHeight() / this.lines;
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
            board.innerHTML = "";
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
            // Wall collision
            if(findCollision(boule.x, boule.y, boule.w, boule.h, walls) !== null) {
                onCrashed();
    			return;
    		}
    
    		// Gum collision
    		var index = findCollision(boule.x, boule.y, boule.w, boule.h, gums);
    		if(index !== null) {
                this.removeGum(index);
    			if(gums.length == 0) {
    				onFinished();
    			}
    			boule.speed = -boule.speed;
    		}
    	},
        
        removeGum: function(index) {
    		var gum = gums[index];
			gum.dom.style.width = "0";
			gum.dom.style.marginLeft = "15px";
			gum.dom.style.marginTop = "15px";
			gum.dom.parentNode.removeChild(gum.dom);
			gums.remove(index, index);
        },
        
        removeWall: function(index) {
        	var wall = walls[index];
			wall.dom.style.width = "0";
			wall.dom.style.marginLeft = "15px";
			wall.dom.style.marginTop = "15px";
			wall.dom.parentNode.removeChild(wall.dom);
			walls.remove(index, index);
        },

        removeItemsAtPosition: function(x,y) {
            var index = findCollision(x,y,10,10,gums);
            if(index !== null) {
                this.removeGum(index);
            }
            else {
                var index = findCollision(x,y,10,10,walls);
                if(index !== null) {
                    this.removeWall(index);
                }
            }
        },
        
        backgroundUrl: function() {
            var backgroundAttr = window.getComputedStyle(board)["background-image"];
            if(backgroundAttr && backgroundAttr !== "none") {
                return backgroundAttr.substring(4, backgroundAttr.length-1);
            }
            return null;
        },
    
        serialize: function() {
            var str = "";
            
            // Serialize board dimensions
            str += "boardWidth=" + board.clientWidth;
            str += "&boardHeight=" + board.clientHeight;
            str += "&lines=" + this.lines;
            
            // Serialize ball position
            str += "&ball=" + boule.x + coord_sep + boule.y;
            
            // Serialize walls position
            str += "&walls=";
            for(var i=0; i<walls.length; i++) {
                if(i != 0) { str += item_sep; }
                var wall = walls[i];
                str += wall.x + coord_sep + wall.y;
            }
            
            // Serialize gums position
            str += "&gums=";
            for(var i=0; i<gums.length; i++) {
                if(i != 0) { str += item_sep; }
                var gum = gums[i];
                str += gum.x + coord_sep + gum.y;
            }
            
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
                    this.addWall(parseInt(wallStrSplit[0]), parseInt(wallStrSplit[1]), 100*i);
                }
            }
                    
            // Unserialize gums
            var gumsStr = getQueryVariable(query, "gums");
            if(gumsStr) {
                var gumStrings = gumsStr.split(item_sep);
                for(var i=0; i<gumStrings.length; i++) {
                    var gumStr = gumStrings[i];
                    var gumStrSplit = gumStr.split(coord_sep);
                    this.addGum(parseInt(gumStrSplit[0]), parseInt(gumStrSplit[1]), 100*i);
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
    
        addWall: function(x, y, timeout) {
            var i = walls.length;
            walls[i] = {
                x: x,
                y: y,
                w: this.unitHeight(),
                h: this.unitHeight()
            };
            
            setTimeout(function() {
                drawWall(i)
            }, timeout || 0);
        },
    
        addGum: function(x, y, timeout) {
            var i = gums.length;
            gums[i] = {
                x: x,
                y: y,
                w: this.unitHeight(),
                h: this.unitHeight()
            };
            setTimeout(function() {
                drawGum(i)
            }, timeout || 0);
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
    			} while(tries > 0 && findCollision(gum.x - margin, gum.y - margin, gum.w + 2*margin, gum.h + 2*margin, gums) !== null);
    			this.addGum(gum.x, gum.y, 100*i);
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
    				findCollision(wall.x - margin, wall.y - margin, wall.w + 2*margin, wall.h + 2*margin, gums) !== null
    				|| findCollision(wall.x - margin, wall.y - margin, wall.w + 2*margin, wall.h + 2*margin, walls) !== null
    				|| (wall.y <= boule.y+boule.h && wall.y+wall.h >= boule.y) // no wall on the initial ball row
    			);
                this.addWall(wall.x, wall.y, 100*i);
    		}
        }
    };
};