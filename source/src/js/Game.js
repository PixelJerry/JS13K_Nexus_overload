/**
 * Game.js
 */

var Game = {
	// Properties
	// Drawing
	stage: document.querySelector("#stage"),
	// mainStage: document.querySelector("#mainStage"),
	playArea: document.querySelector("#playArea"),
	canvas: document.querySelector("#mainCanvas"),

	ctx: null,

	width: 1500,
	height: 1080,
	offsetTop: 0,
	offsetLeft: 0,
	canvasWidth: 1200,
	canvasHeight: 850,
	canvasTop: 115,
	canvasLeft: 150,
	aspectRatio: 1,
	clientAspectRatio: 1,
	scale: 1,

	// Logic
	paused: true,
	pausedFrom: null,
	timerAdjust: 0,

	// Effects
	shakeEnd: 0,
	shaking: false,
	shakeStr: 0,

	glitchCount: 0,
	glitching: false,

	// Methods
	init: function(){
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = this.canvasWidth;
		this.canvas.height = this.canvasHeight;
		// Get scale ready
		this.setScale();
		// Add setScale() to resize
		// Get the window to update scale on resize
		window.onresize = function() {
			Game.setScale();
		};

		window.onblur = function(){
			// console.log ("BLUR");
			if (!Menu.open()) {
				// The game has started
				Menu.toggle("pause");
			}
		};

		// Getting the network map ready
		Network.init();

		// Get Input ready
		Input.init();

		// Init player
		Player.init();

		Network.start();
		Menu.toggle("main");

		// Create the canvas
		// Add 2d context
		this.loop();

		/////////////////////////// TESTING ///////////////////////////
		// Menu.toggle("end");
		// Menu.toggle();
		// this.unpause();
		// Room.story = 1;
		// Room.start();
		///////////////////////// TESTING END /////////////////////////

	},
	start: function(){
		// console.log ("STARTING THE GAME");
		Player.reset();
		Room.reset();
		Room.story = 1;
		Enemies.clear();
		Bullets.totalBullets = 0;
		Enemies.totalKills = 0;

		this.timerReset();

		Network.level = 1;
		Network.goToNextLevel = false;
		Network.start();

		// Room.start();

		// Get free upgrades after first level?

		if (Player.availableUG > 0 && !Network.tutorial) {
			Menu.toggle("upgrade");
		} else {
			Menu.toggle("map");
		}

	},
	pause: function(){
		if (!this.paused) {
			this.paused = true;
			this.pausedFrom = Date.now();
		}
	},
	unpause: function(){
		if (this.paused) {
			this.paused = false;
			if (this.pausedFrom !== null) { // will be null on first run
				this.timerAdjust = Date.now() - this.pausedFrom;
				this.pausedFrom = null;
			}
		}
	},
	updateTimer: function(){
		// console.log ("Adjusting timer with " + this.timerAdjust + "ms.");
		return this.timerAdjust;
	},
	timerReset: function(){
		this.pausedFrom = null;
		this.timerAdjust = 0;
	},
	screenShake: function(severity, time){
		// This will overwrite the previous shake!

		// severity is distance in px
		// Time in ms
		this.shakeEnd = Date.now() + time;
		this.shaking = true;
		this.shakeStr = Math.round(severity / 2);
	},
	shakeScreen: function(){
		if (this.shaking) {
			// this.canvas.style.transform = "translate(" + randomInt(-this.shakeStr, this.shakeStr) + "px," + randomInt(-this.shakeStr, this.shakeStr) + "px)";
			this.playArea.style.transform = "translate(" + randomInt(-this.shakeStr, this.shakeStr) + "px," + randomInt(-this.shakeStr, this.shakeStr) + "px)";

			this.shakeEnd += this.updateTimer();
			if (Date.now() >= this.shakeEnd) {
				// console.log ("Stop shaking");
				if (this.shakeStr > 0.5) {
					this.shakeStr -= this.shakeStr * 0.1;
				} else {
					// console.log ("Reset screen");
					// this.canvas.style.transform = "translate(" + this.canvasLeft + "px," + this.canvasTop + "px)";
					this.playArea.style.transform = "translate(0px, 0px)";
					this.shaking = false;
					this.shakeStr = 0;
				}
			}
		}
	},
	calcScale: function(){
		// this.width = window.innerWidth;
		// this.height = window.innerHeight;

		this.aspectRatio = this.width / this.height;
		var userAspect = window.innerWidth / window.innerHeight;

		// console.log ("USER ASPECT: " + userAspect + ", GAME ASPECT: " + this.aspectRatio);
		if (userAspect >= this.aspectRatio) {
			// The window inner is wider than the game, use height as limiter
			// console.log ("HEIGHT LIMITER");
			this.scale = window.innerHeight / this.height;
			this.offsetTop = 0;
			this.offsetLeft = (window.innerWidth - (this.width * this.scale)) / 2;
		} else {
			// The window inner is shorter than the game, use width as limiter
			// console.log ("WIDTH LIMITER");
			this.scale = window.innerWidth / this.width;
			this.offsetTop = (window.innerHeight - (this.height * this.scale)) / 2;
			this.offsetLeft = 0;
		}

		if (this.scale > 1) {
			this.scale = 1;
		}
	},
	setScale: function(){
		// Actually need to calculate and set the scale here
		this.calcScale();

		var excessWidth = window.innerWidth - this.width;
		var excessHeight = window.innerHeight - this.height;

		this.stage.style.left = ((excessWidth / 2)) + "px";
		this.stage.style.top = ((excessHeight / 2)) + "px";

		this.stage.style.transform = "scale(" + this.scale + ")";
		this.stage.style.webkitTransform = "scale(" + this.scale + ")";
		this.stage.style.MozTransform = "scale(" + this.scale + ")";

		// console.log ("Finished setting scale");
		// console.log ("Scale: " + this.scale);
		// console.log ("offset top: " + this.offsetTop + ", offset left: " + this.offsetLeft);
		// console.log ("Canvas left: " + this.canvasLeft);
	},
	loop: function(){
		requestAnimation(Game.loop);

		Game.update();
		Game.render();
	},
	update: function(){
		if (this.paused) {
			//
		} else {
			this.shakeScreen();

			Player.update();
			Enemies.update();
			Bullets.update();

			Room.update();

			FX.update();

			// The adjustments would have taken place by now
			// Need to reset to avoid breaking all the timers
			if (this.timerAdjust !== 0) {
				// Reset the timer adjustment
				this.timerReset();
			}
		}

		/////////////////////////// TESTING ///////////////////////////
		// genMaps();
		///////////////////////// TESTING END /////////////////////////
	},
	clearCanvas: function(){
		if (!this.glitching) {
			this.canvas.width = this.canvasWidth;
		} else {
			this.glitchCount++;
			if (this.glitchCount >= 10) {
				this.glitchCount = 0;
				this.glitching = false;
			}
		}
	},
	render: function(){
		if (this.paused) {
			return; // End render loop for now
		} else {
			this.clearCanvas();

			if (!Network.tutorial) {
				for (var j = 0; j < 12; j++) {
					for (var k = 0; k < 10; k++) {
						this.ctx.strokeStyle = "#222";
						this.ctx.lineWidth = 2;
						// this.ctx.fillStyle = "#1F1F1F";

						var gH = randomInt((-Network.level + 1) * 2, (Network.level - 1) * 2);
						var gW = randomInt((-Network.level + 1) * 2, (Network.level - 1) * 2);
						this.ctx.strokeRect((j * 55.5) + 41 + (j * 41) + (gW / 2), (k * 40) + 41 + (k * 41) + (gH / 2), 55.5 + (gW / 2), 40 + (gH / 2));
						// this.ctx.fillRect(j * width + gap + j * gap + gW / 2, k * height + gap + k * gap + gH / 2, width + gW / 2, height + gH / 2);
					}
				}
			}

			Enemies.drawDeadEnemies(this.ctx);

			Bullets.draw(this.ctx);
			Player.draw(this.ctx);
			Enemies.draw(this.ctx);

			Player.drawCursor(this.ctx);

			FX.draw(this.ctx);
		}
	}
};