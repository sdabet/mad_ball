/**
 * Util
 */

/*
 * Change the display css property for elements matching a class name
 */
var setDisplay = function(className, display) {
	var elts = document.getElementsByClassName(className);
	for(i = 0; i < elts.length; i++) {
		elts[i].style.display = display;
	}
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

/**
 */

//(function(){
	// The container dom element. It can have the following classes:
	//  - ready: game is initialized correctly, start message is displayed, waiting for spacebar pressed
	//  - crash: when collision with wall (red background)
	var board = document.getElementById("board");

    var gameLevel = new Level(board);
    gameLevel.lines = 19;
    
	var initSpeed = 500; // pixel per second
	var level = 1;
	var highScore = 99.99;

	/*
	 * Set level value and update the ball speed
	 */
	var setLevel = function(l) {
		level = l;
        gameLevel.setSpeed(initSpeed + l*50);
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
		gameLevel.animate(time-lastUpdateTime);
		gameLevel.checkCollisions(lose, win);
		lastUpdateTime = time;
	}

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

    var reset = function() {
    	container.className = "";
        var queryString = window.location.search.substring(1);
        if(queryString) {
            gameLevel.unserialize(queryString);
        }
        else {
            gameLevel.generate();
        }
        gameLevel.ready();
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
				gameLevel.ballUp();
				e.preventDefault();
				return false;
			}
			// Key down
			if (e.keyCode == 40) {
				gameLevel.ballDown();
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
