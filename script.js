Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

//(function(){
	var fps = 30; // frames per second
	var container = document.getElementById("container");
	var board = document.getElementById("board");
	var wallNumber = 15;
	var gumNumber = 15;
	var boardWidth = 800;
	var boardHeight = 580;
	var level = 1;
	var highScore = 99.99;
	
	/* Base height unit */
	var unitHeight = 30;
	
	var gums = [];
	var walls = [];
	var timer;

	var ballImg = new Image();
	var wallImg = new Image();
	var gumImg = new Image();
	ballImg.style.position = "absolute";
	ballImg.className = "ball";
	gumImg.style.position = "absolute";
	gumImg.className = "gum";
	wallImg.style.position = "absolute";
	wallImg.className = "wall";
	
	var setLevel = function(l) {
		level = l;
		boule.speed = 500 + l*50;
		document.getElementById("level").innerHTML = level+1;
	}

	var start = function() { 
		container.className = "";
		watch.start();
		if(!timer) {
			timer = setInterval(function() {
				boule.animate();
				checkCollisions();
			}, 1000/fps);
		}
	};

	var setDisplay = function(className, display) {
		var elts = document.getElementsByClassName(className);
		for(i = 0; i < elts.length; i++) {
			elts[i].style.display = display;
		}
	};
	
	var showDialog = function(dialog) {
		setDisplay("dialog", "none");
		setDisplay("modal", "block");
		document.getElementById(dialog).style.display = "inline-block";
	};
	
	var win = function() {
		stop();
		var score = Math.round(watch.elapsed / 10) / 100;
		highScore = Math.min(highScore, score);
		document.getElementById("score").innerHTML = score;
		document.getElementById("high_score").innerHTML = highScore;
		showDialog("win");
		setLevel(level+1);
	};
	
	var lose = function() {
		stop();
		container.className = "crash";
		setTimeout(function() { showDialog("lose"); }, 1500);
		setLevel(0);
	};
	
	var stop = function() {
		watch.stop();
		if(timer) {							
			clearInterval(timer);
			timer = null;
		}
	};
	
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
	
	/* Ball animation */
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
		animate: function() {
			this.x += parseInt(this.speed/fps);
			this.draw();
			if(this.x < 0 || this.x + this.w > boardWidth) {
				this.speed = -this.speed;
			}
		},
		up: function() {
			if(this.y >= this.h) {
				this.y = this.y - this.h;
			}
		},
		down: function() {
			if(this.y <= boardHeight - this.h) {
				this.y = this.y + this.h;
			}
		}
	};
	
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
	
	var ready = function() {
		container.className = "ready";
	};
	
	// Display walls incrementally
	var drawWall = function(i) {
		var wallEl = wallImg.cloneNode(true);
		wallEl.style.left = walls[i].x + "px";
		wallEl.style.top = walls[i].y + "px";
		board.appendChild(wallEl);
		walls[i].dom = wallEl;
		if(i < walls.length - 1) {
			setTimeout(function() { drawWall(i+1); }, 50);
		}
		else {
			setTimeout(function() { drawGum(0); }, 50);
		}
	}

	// Display gums incrementally
	var drawGum = function(i) {
		var gumEl = gumImg.cloneNode(true);
		gumEl.style.left = gums[i].x + "px";
		gumEl.style.top = gums[i].y + "px";
		board.appendChild(gumEl);
		gums[i].dom = gumEl;
		if(i < gums.length - 1) {
			setTimeout(function() { drawGum(i+1); }, 50);
		}
		else {
			ready();
		}
	}

	var startDrawing = function() {
		drawWall(0);
	};
	
	var randomX = function() {
		return Math.floor(Math.random()*(boardWidth-unitHeight));
	}
	var randomY = function() {
		return Math.floor(Math.random()*((boardHeight-unitHeight)/unitHeight)) * unitHeight;
	}
	
	var reset = function() {
		container.className = "";
		
		// Clear board
		board.innerHTML = "";

		var margin = 2 * unitHeight;
	
		/* Init ball position */
		boule.x = randomX();
		boule.y = 0; // on the first line
		boule.targetY = boule.y;
		boule.dom = ballImg.cloneNode(true);
		board.appendChild(boule.dom);
		boule.draw();

		/* Init gums */
		gums = [];
		for(var i=0; i < gumNumber; i++) {
			var gum;
			do {
				gum = {
					x: randomX(),
					y: randomY(),
					w: unitHeight,
					h: unitHeight
				};
			} while(findCollision(gum.x - margin, gum.y - margin, gum.w + 2*margin, gum.h + 2*margin, gums) !== null);
			gums[i] = gum;
		}
	
		/* Init walls */
		walls = [];
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
			walls[i] = wall;
		}

		setTimeout(startDrawing, 1000);
	};
	
	/**
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

	var init = function() {
		setLevel(0);

		/* Controls */
		document.addEventListener("keydown", function(e){
			// Key up
			if (e.keyCode == 38) {
				boule.up();
				return false;
			}
			// Key down
			if (e.keyCode == 40) {
				boule.down();
				return false;
			}
			// Spacebar down
			if (e.keyCode == 32 && container.className == "ready") {
				start();
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

		// Load images
		loadImages(reset);
	};

	init();
//})();
