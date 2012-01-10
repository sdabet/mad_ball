function getQueryVariable(query,variable) {
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return unescape(pair[1]);
        }
    }
}

var ballUrl = "ball.png";
var wallUrl = "wall.png";
var gumUrl = "smiley.png";

/* Base height unit */
var unitHeight = 30;

var Level = function() {
    
    var item_sep = ";";
    var coord_sep = ",";
        
    var boardWidth = board.offsetWidth;
	var boardHeight = board.offsetHeight;

    var gums = [];
	var walls = [];

    var wallNumber = 10;
	var gumNumber = 10;
    
    var drawWall = function(i) {
        var wallEl = wallImg.cloneNode(true);
    	wallEl.style.left = walls[i].x + "px";
		wallEl.style.top = walls[i].y + "px";
        wallEl.style.width = walls[i].width + "px";
        wallEl.style.height = walls[i].height + "px";
		board.appendChild(wallEl);
		walls[i].dom = wallEl;
    };       

    var drawGum = function(i) {
        var gumEl = gumImg.cloneNode(true);
		gumEl.style.left = gums[i].x + "px";
		gumEl.style.top = gums[i].y + "px";
        gumEl.style.width = gums[i].width + "px";
        gumEl.style.height = gums[i].height + "px";
		board.appendChild(gumEl);
		gums[i].dom = gumEl;
    };
        
	var randomX = function() {
		return Math.floor(Math.random()*(boardWidth-unitHeight));
	}
	var randomY = function() {
		return Math.floor(Math.random()*((boardHeight-unitHeight)/unitHeight)) * unitHeight;
	}

    var initBall = function() {
        // Remove current ball
        var balls = board.getElementsByClassName("ball");
        if(balls.length > 0) {
            board.removeChild(balls[0]);
        }
        
    	/* Init ball position */
		boule.x = randomX();
		boule.y = 0; // on the first line
		boule.targetY = boule.y;
		boule.dom = ballImg.cloneNode(true);
		board.appendChild(boule.dom);
		boule.draw();
    }        

    
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
		ballImg.src = ballUrl;
		wallImg.src = wallUrl;
		gumImg.src = gumUrl;
	};
    
    /* 
	 * Ball implementation 
	 */
	var boule = {
		x: 0,
		y: 0,
		w: unitHeight,
		h: unitHeight,
		speed: 0, // pixels per second
		draw: function() {
			var style = this.dom.style;
			style.top = this.y + "px";
			style.left = this.x + "px";
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
			else if(this.x >= boardWidth-this.w) {
				this.speed = -this.speed;
				this.x = boardWidth-this.w;
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
			if(this.y <= boardHeight - 2*this.h) {
				this.y = this.y + this.h;
			}
		}
	};

	var ballImg = new Image();
	var wallImg = new Image();
	var gumImg = new Image();
	ballImg.style.position = "absolute";
	ballImg.className = "ball";
	gumImg.style.position = "absolute";
	gumImg.className = "gum";
	wallImg.style.position = "absolute";
	wallImg.className = "wall";

    loadImages(function() {});

    return {
        
        ready: function() {
    		container.className = "ready";
            initBall();
    	},
        
        clear: function() {
            board.innerHTML = "";
        	gums = [];
        	walls = [];
        },   
        
        setBallUrl: function(src) {
            ballImg.src = src;
        },
        
        setWallUrl: function(src) {
            wallImg.src = src;
        },
        
        setGumUrl: function(src) {
            gumImg.src = src;
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
    			var gum = gums[index];
    			gum.dom.style.width = "0";
    			gum.dom.style.marginLeft = "15px";
    			gum.dom.style.marginTop = "15px";
    			//gum.dom.parentNode.removeChild(gum.dom);
    			gums.remove(index, index);
    			if(gums.length == 0) {
    				onFinished();
    			}
    			boule.speed = -boule.speed;
    		}
    	},
    
       serialize: function() {
            var str = "";
            
            // Serialize ball position
            str += "ball=" + boule.x + coord_sep + boule.y;
            
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
            
            return str;
        },
        
        unserialize: function(query) {
            this.clear();
            
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
                    this.addWall({
                        x: parseInt(wallStrSplit[0]),
                        y: parseInt(wallStrSplit[1]),
                        w: unitHeight,
                        h: unitHeight
                    }, 100*i);
                }
            }
                    
            // Unserialize gums
            var gumsStr = getQueryVariable(query, "gums");
            if(gumsStr) {
                var gumStrings = gumsStr.split(item_sep);
                for(var i=0; i<gumStrings.length; i++) {
                    var gumStr = gumStrings[i];
                    var gumStrSplit = gumStr.split(coord_sep);
                    this.addGum({
                        x: parseInt(gumStrSplit[0]),
                        y: parseInt(gumStrSplit[1]),
                        w: unitHeight,
                        h: unitHeight
                    }, 100*i);
                }
            }
        },
    
        addWall: function(wall, timeout) {
            var i = walls.length;
            walls[i] = wall;
            
            setTimeout(function() {
                drawWall(i)
            }, timeout || 0);
        },
    
        addGum: function(gum, timeout) {
            var i = gums.length;
            gums[i] = gum;
            setTimeout(function() {
                drawGum(i)
            }, timeout || 0);
        },
    
        generate: function() {
            this.clear();
            
            var margin = 2 * unitHeight;
    
    		/* Init gums */
    		for(var i=0; i < gumNumber; i++) {
    			do {
    				gum = {
    					x: randomX(),
    					y: randomY(),
    					w: unitHeight,
    					h: unitHeight
    				};
    			} while(findCollision(gum.x - margin, gum.y - margin, gum.w + 2*margin, gum.h + 2*margin, gums) !== null);
    			this.addGum(gum, 100*i);
    		}
    
    		/* Init walls */
    		for(var i=0; i < wallNumber; i++) {
    			var wall;
    			do {
    				wall = {
    					x: randomX(),
    					y: randomY(),
    					w: unitHeight,
    					h: unitHeight
    				};
    			} while(
    				findCollision(wall.x - margin, wall.y - margin, wall.w + 2*margin, wall.h + 2*margin, gums) !== null
    				|| findCollision(wall.x - margin, wall.y - margin, wall.w + 2*margin, wall.h + 2*margin, walls) !== null
    				|| (wall.y <= boule.y+boule.h && wall.y+wall.h >= boule.y) // no wall on the initial ball row
    			);
                this.addWall(wall, 100*i);
    		}
        }
    };
};