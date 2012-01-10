Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 25);
            };
  })();


//(function(){
	// The container dom element. It can have the following classes:
	//  - ready: game is initialized correctly, start message is displayed, waiting for spacebar pressed
	//  - crash: when collision with wall (red background)
    var ballUrl = "ball.png";
    var wallUrl = "wall.png";
    var gumUrl = "smiley.png";
    
	var container = document.getElementById("container");

	var board = document.getElementById("board");

	var initSpeed = 500; // pixel per second
	var wallNumber = 10;
	var gumNumber = 10;
	var boardWidth = board.offsetWidth;
	var boardHeight = board.offsetHeight;
	var level = 1;
	var highScore = 99.99;

	/* Base height unit */
	var unitHeight = 30;

	var gums = [];
	var walls = [];
	var timer; // game animation timer

	/*
	 * The 3 images used in the game (they could also be loaded as dom elements). Walls and gums are cloned at game initialization.
	 */
	var ballImg = new Image();
	var wallImg = new Image();
	var gumImg = new Image();
	ballImg.style.position = "absolute";
	ballImg.className = "ball";
	gumImg.style.position = "absolute";
	gumImg.className = "gum";
	wallImg.style.position = "absolute";
	wallImg.className = "wall";

	/*
	 * Set level value and update the ball speed
	 */
	var setLevel = function(l) {
		level = l;
		boule.speed = initSpeed + l*50;
		document.getElementById("level").innerHTML = level+1;
	}

	var stopAnimation = false; // flag to stop animation
	
	var lastUpdateTime;
	
	/*
	 * Start game
	 */
	var start = function() { 
        if(container.className == "ready") {
    		container.className = "";
    
    		// Start stopwatch
    		watch.start();
    		
    		lastUpdateTime = new Date().getTime();
    		stopAnimation = false;
    		loop(lastUpdateTime);
        }
	};
	
	var loop = function(time) {
		time = time || new Date().getTime();
		if(!stopAnimation) {
			requestAnimFrame(loop);
		}
		boule.animate(time-lastUpdateTime);
		checkCollisions();
		lastUpdateTime = time;
	}

	/*
	 * Change the display css property for elements matching a class name
	 */
	var setDisplay = function(className, display) {
		var elts = document.getElementsByClassName(className);
		for(i = 0; i < elts.length; i++) {
			elts[i].style.display = display;
		}
	};

	/*
	 * Show the dialog box with the given ID
	 */
	var showDialog = function(dialog) {
		setDisplay("dialog", "none");
		setDisplay("modal", "block");
		document.getElementById(dialog).style.display = "inline-block";
	};

	/*
	 * Player wins
	 */
	var win = function() {
		// Stop game
		stop();
		// Truncate elapsed time (2 digits)
		var score = Math.round(watch.elapsed / 10) / 100;
		// Update high score
		highScore = Math.min(highScore, score);
		// Update scores displayed in dom
		document.getElementById("score").innerHTML = score;
		document.getElementById("high_score").innerHTML = highScore;
		// Show victory dialog
		showDialog("win");
		// Increment level
		setLevel(level+1);
	};

	/*
	 * Player loses
	 */
	var lose = function() {
		// Stop game
		stop();
		// Crash animation
		container.className = "crash";
		// Display 'game over' dialog after a while
		setTimeout(function() { showDialog("lose"); }, 1500);
		// Reset level
		setLevel(0);
	};

	/*
	 * Stop the game
	 */
	var stop = function() {
		// Stop the watch
		watch.stop();
		// Stop animation timer
		stopAnimation = true;
	};

	/*
	 * Stop watch implementation
	 */
	var watch = {
		start_time: 0,
		elapsed: 0,

		start: function() {
			this.start_time = new Date().getTime();
		},
		stop: function() {
			this.elapsed = new Date().getTime() - this.start_time;
		}
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
			var delta = parseInt(this.speed * delay / 1000);
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

	/*
	 * Check if there is any collision between the ball and anything (wall or gum)
	 */
	var checkCollisions = function() {
		// Wall collision
		if(findCollision(boule.x, boule.y, boule.w, boule.h, walls) !== null) {
			lose();
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
				win();
			}
			boule.speed = -boule.speed;
		}
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
	 * Called when game is ready to start
	 */
	var ready = function() {
		container.className = "ready";
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
	 * Called before starting a new game
	 */
	var reset = function() {
    	container.className = "";
        var queryString = window.location.search.substring(1);
        if(queryString) {
            Level.unserialize(queryString);
        }
        else {
            Level.generate();
        }
        initBall();
        ready();
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
	 * Called once to initialize key/dom listeners and load images
	 */
	var init = function() {
		setLevel(0);

		/* Controls */
		document.addEventListener("keydown", function(e){
			// Key up
			if (e.keyCode == 38) {
				boule.up();
				e.preventDefault();
				return false;
			}
			// Key down
			if (e.keyCode == 40) {
				boule.down();
				e.preventDefault();
				return false;
			}
			// Spacebar down
			if (e.keyCode == 32 && container.className == "ready") {
				start();
				e.preventDefault();
				return false;
			}
		}, false);

		var tryAgainButtons = document.getElementsByClassName("try_again");
		for(i = 0; i < tryAgainButtons.length; i++) {
			tryAgainButtons[i].addEventListener("click", function() {
				setDisplay("modal", "none");
				reset();
				return false;
			}, false);
		}
	};
    
    init();
//})();
