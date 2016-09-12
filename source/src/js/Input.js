/**
 * Input.js
 */

var Input = {
	// Properties
	// Mouse
	mouse: new Point(0,0),
	canvasMouse: new Point(0,0),
	mouseDown: false,

	// Keyboard
	up: false,
	down: false,
	left: false,
	right: false,

	// Methods
	init: function(){
		this.addKeyboardListeners();
		this.addMouseListeners();
	},
	// Mouse
	addMouseListeners: function(){
		document.addEventListener("mousemove", Input.updateMouseCoordinates);
		document.addEventListener("mousedown", Input.onMouseDown);
		document.addEventListener("mouseup", Input.onMouseUp);
		// Right click
		// document.addEventListener("contextmenu", Input.rightClick);
	},
	updateMouseCoordinates: function(event){
		Input.mouse.x = event.clientX;
		Input.mouse.y = event.clientY;

		Input.canvasMouse.x = ((event.clientX - (Game.canvasLeft * Game.scale) - Game.offsetLeft) / Game.scale);
		Input.canvasMouse.y = ((event.clientY - (Game.canvasTop * Game.scale)- Game.offsetTop) / Game.scale);
	},
	// rightClick: function(event){
	// 	// console.log ("TESTING");
	// 	event.preventDefault();
	// 	console.log ("Right click menu hidden");
	// },
	onMouseDown: function(event){
		event.preventDefault();
		// if (event.which === 1) {
			Input.mouseDown = true;
		// }
	},
	onMouseUp: function(event){
		// console.log ("Mouse up");
		// if (event.which === 1) {
			Input.mouseDown = false;
		// }
	},

	// Keyboard
	addKeyboardListeners: function(){
		document.addEventListener("keydown", Input.keyDown);
		document.addEventListener("keyup", Input.keyUp);
	},
	keyDown: function(event){
		// console.log ("Key code DOWN: " + event.which);
		// W
		if (event.which === 87) {
			// console.log ("move up");
			Input.up = true;
		}
		// A
		if (event.which === 65) {
			Input.left = true;
		}
		// S
		if (event.which === 83) {
			Input.down = true;
		}
		// D
		if (event.which === 68) {
			Input.right = true;
		}

		// Escape
		if (event.which === 27) {
			console.log ("Esc pressed");
			if (!Menu.open()) {
				// The game has started
				Menu.toggle("pause");
			} else if (Menu.menuHeading.innerHTML === "Paused") {
				Menu.toggle();
			} else if (Menu.menuHeading.innerHTML !== "Nexus overload") {
				Menu.toggle("main");
			}
		}
	},
	keyUp: function(event){
		// console.log (event.which);
		// W
		if (event.which === 87) {
			Input.up = false;
		}
		// A
		if (event.which === 65) {
			Input.left = false;
		}
		// S
		if (event.which === 83) {
			Input.down = false;
		}
		// D
		if (event.which === 68) {
			Input.right = false;
		}
	}
};