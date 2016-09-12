/**
 * Network.js
 */

var Network = {
	// Properties
	mapElem: document.querySelector("#map"),
	mapCtx: document.querySelector("#mapLines").getContext("2d"),
	mapHead: document.querySelector("#mapLayer"),

	width: 730,
	height: 400,

	level: 1,
	highestLevel: 1,

	layer: 0,
	colour: [],

	currentRow: 0,
	currentCol: 0,

	workingMap: [],

	goToNextLevel: false,
	tutorial: true,

		// 1 == current
		// 2 == clear
		// 3 == open
		// 4 == no access
		// 5 == elite
		// 6 == boss
	// Layer maps
	levelData: [// Tutorail level
				createLevel( [[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0],
							[1, 3, 3, 3, 3],
							[0, 0, 0, 0, 0],
							[0, 0, 0, 0, 0]],

							 [[[], [], [], [], []],
							  [[], [], [], [], []],
							  [[2], [2], [2], [2], [2]],
							  [[], [], [], [], []],
							  [[], [], [], [], []]]),
				// Layout 1
				// array 1 == [row][row][row][row][row]
				// each row == [[col][col][col][col][col]]
				createLevel( [[0, 0, 0, 0, 3],
							[0, 5, 3, 5, 5],
							[1, 0, 5, 6, 3],
							[0, 3, 0, 3, 0],
							[0, 0, 3, 6, 5]],

							 [[[], [], [], [], [0]],
							 [[], [1,2], [1,2], [0,1], [1]],
							 [[1,3], [], [2,3], [1,2], [2]],
							 [[], [2,4], [], [2,4], []],
							 [[], [], [3,4], [4], [4]]]),
				// Layout 2
				createLevel( [[0, 0, 3, 0, 3],
							[0, 5, 0, 5, 0],
							[1, 3, 3, 0, 6],
							[0, 0, 5, 5, 0],
							[0, 0, 0, 6, 3]],

					         [[[], [], [1], [], [0]],
					         [[], [0], [], [0,2], []],
					         [[1,2], [2,3], [1,3], [], [2]],
					         [[], [], [3,4], [2,4], []],
					         [[], [], [], [4], [4]]]),
				// Layout 3
				createLevel( [[0, 0, 0, 0, 5],
							[0, 0, 3, 6, 0],
							[1, 3, 3, 5, 3],
							[0, 5, 3, 0, 6],
							[0, 0, 0, 5, 3]],

					         [[[], [], [], [], [0]],
					         [[], [], [1,2], [0,2], []],
					         [[2,3], [1,2], [2], [2,3], [2]],
					         [[], [3], [2,4], [], [3]],
					         [[], [], [], [3,4], [4]]]),
				// Layout 4
				createLevel( [[0, 0, 3, 5, 0],
							[0, 3, 5, 6, 3],
							[1, 0, 3, 5, 5],
							[0, 5, 5, 0, 6],
							[0, 0, 3, 3, 3]],

							 [[[], [], [0,1], [1], []],
							 [[], [0,1,2], [1,2], [1], [1]],
							 [[1,3], [], [2], [1,2,3], [2]],
							 [[], [3,4], [2,4], [], [3]],
							 [[], [], [4], [3,4], [4]]]),
				// Layout 5
				createLevel( [[0, 0, 5, 5, 6],
							[0, 5, 3, 0, 3],
							[1, 3, 3, 3, 0],
							[0, 0, 5, 0, 6],
							[0, 0, 0, 5, 3]],

							 [[[], [], [0], [0,1], [0]],
							 [[], [0,1], [2], [], [1]],
							 [[1,2], [2,3], [2], [1,3], []],
							 [[], [], [2,4], [], [3]],
							 [[], [], [], [3,4], [4]]]),  ],

	// Methods
	init: function(){
		this.colour[0] = "rgba(0,0,0,0)";
		this.colour[1] = "#24FF96"; // Green
		this.colour[2] = "#FFF"; // White
		this.colour[3] = "#808080"; // Grey
		this.colour[4] = "#282828"; // Dark
		this.colour[5] = "#3EFFEC"; // Blue
		this.colour[6] = "#FF945F"; // Orange
	},
	start:function(){
		if (this.level > 1) {
			this.tutorial = false;
		}
		// Select a level
		if (this.tutorial) {
			this.layer = 0;
		} else {
			// console.log ("Choose a random level");
			this.layer = randomInt(1,5);
		}

		this.currentRow = 2;
		this.currentCol = 0;

		for (var i = 0; i < 5; i++) {
			this.workingMap[i] = [];
			for (var j = 0; j < 5; j++) {
				this.workingMap[i][j] = this.levelData[this.layer].map[i][j];
			}
		}

		this.showMap();
	},
	showMap: function(){
		// Make sure the DOM Element is clear
		this.mapElem.innerHTML = "";
		this.mapHead.innerHTML = "Network layer: " + this.level;
		var mapString = "";
		// Draw the first item
		// 1 == current
		// 2 == clear
		// 3 == open
		// 4 == no access
		// 5 == elite
		// 6 == boss
		var cName = [" btnGreen fillGreen", " btnWhite fillWhite", " btnGrey", " btnDarkGrey", " btnBlue", " btnOrange"];
		for (var i = 0; i < this.currentCol + 2 && i < 5; i++) { // COL
			mapString += "<div class='mapCol'>"; /// 1
			for (var j = 0; j < 5; j++) { // ROW
				if (this.workingMap[j][i] !== 0) {
					mapString += "<div onclick='Network.goToNode(this);' data-row='" + j + "' data-col='" + i + "' class='mapNode row" + (j + 1) + cName[this.workingMap[j][i] - 1];

					// Make sure I am in the correct col
					if (i === this.currentCol + 1) {
						// Is the current node connected to this test one?
						// for (var k = 0; k < this.map[this.currentRow][this.currentCol].rowConnectIndexs.length; k++) {
						for (var rowIndex in this.levelData[this.layer].connections[this.currentRow][this.currentCol]) {
							if (this.levelData[this.layer].connections[this.currentRow][this.currentCol][rowIndex] === j) {
								// console.log ("This node in row " + j + " is connected to the current node.");
								mapString += " next";
							}
						}
					}
					if (Network.tutorial && this.currentCol === 0 && i === 1) {
						mapString += " txtWhite clickHere'>click here</div>";
					} else {
						mapString += "'></div>";
					}
				}
			}
			// Close the first col
			mapString += "</div>";
		}

		mapString += "<div onclick='Network.goToLastNode();' class='mapCol'> <div class='lastMapNode btnRed";

		if (this.currentCol === 4) {
			// console.log ("ADDING NEXT TO LAST NODE");
			mapString += " next";
		}

		mapString += "'></div> </div>";

		this.mapElem.innerHTML = mapString;

		this.strokeConnections();
	},
	strokeConnections:function(){
		document.querySelector("#mapLines").width = this.width;
		document.querySelector("#mapLines").height = this.height;

		for (var i = 0; i < 5; i++) { // ROW
			for (var j = 0; j < this.currentCol + 1; j++) { // COL
				if (this.workingMap[i][j] !== 0) {
					this.mapCtx.strokeStyle = this.colour[this.workingMap[i][j]];
					this.mapCtx.lineWidth = 4;

					var connectionIndexs = this.levelData[this.layer].connections;

					for (var k = 0; k < connectionIndexs[i][j].length; k++) {
						// Make sure the no access lines are correct when node is cleared
						if (this.workingMap[i][j] === 2 && (this.workingMap[connectionIndexs[i][j][k]][j + 1] === 1 || this.workingMap[connectionIndexs[i][j][k]][j + 1] === 2)) {
							this.mapCtx.strokeStyle = this.colour[this.workingMap[i][j]];
						} else if (this.workingMap[i][j] === 2) {
							this.mapCtx.strokeStyle = this.colour[4];
						}
						this.mapCtx.beginPath();
						this.mapCtx.moveTo(72 + (j * 130), 40 + (i * 80));
						this.mapCtx.lineTo(138 + (j * 130), 40 + (connectionIndexs[i][j][k] * 80));
						this.mapCtx.stroke();
					}
				}
			}
		}
	},
	goToNode: function(nodeElem) {
		var rowIndex = parseInt(nodeElem.dataset.row);
		var colIndex = parseInt(nodeElem.dataset.col);

		if (Menu.open() && this.currentCol + 1 === colIndex && 
			nodeElem.classList.contains("next")) {

			// Update current map pos before chaning to new position
			this.workingMap[this.currentRow][this.currentCol] = 2;

			// Update current map position
			this.currentRow = rowIndex;
			this.currentCol = colIndex;

			// Make sure the node is updated for next render
			var nodeType = this.workingMap[rowIndex][colIndex];
			this.workingMap[rowIndex][colIndex] = 1;

			// Make sure the nodes have been updated
			this.updateNodes();

			// console.log ("Need to go to node at [" + rowIndex + "][" + colIndex + "]");
			Room.reset();
			Room.start(nodeType);

			Menu.toggle();
		}
	},
	goToLastNode: function(){
		var lastNode = document.querySelector(".lastMapNode");

		if (Menu.open() && lastNode.classList.contains("next")) {
			this.currentCol = 0;
			this.goToNextLevel = true;

			Player.availableUG++;

			Room.reset();
			Room.start(-1);

			Menu.toggle();
		}
	},
	updateNodes: function(){
		// Go through the nodes and set those that can not be accessed any more
		// Might be easiest to mark the spots that I have access to and clear all the rest
		var testMap = [
			[0,0,0,0,0],
			[0,0,0,0,0],
			[0,0,0,0,0],
			[0,0,0,0,0],
			[0,0,0,0,0]
			];

		testMap[this.currentRow][this.currentCol] = 1;

		// REMOVE THIS ONCE FINISHED
		var connectionIndexs = this.levelData[this.layer].connections;

		for (var i = this.currentCol; i < 5; i++) { // COL
			// Start at the top row and go down
			for (var j = 0; j < 5; j++) { // ROW
				if (testMap[j][i] !== 0) {
					// Found an accessable tile, mark it's destinations
					for (var row in connectionIndexs[j][i]) {
						testMap[connectionIndexs[j][i][row]][i + 1] = 1; // Set that tile as accessable
					}
				}
			}
		}

		// Now move through node map and compare
		for (var k = this.currentCol; k < 5; k++) { // COL
			// Start at the top row and go down
			for (var l = 0; l < 5; l++) { // ROW
				if (this.workingMap[l][k] !== 0 && (this.workingMap[l][k] !== 1 && this.workingMap[l][k] !== 2)) { // Found a valid node, need to change
					if (testMap[l][k] === 0) {
						this.workingMap[l][k] = 4;
					}
				}
			}
		}
	},
	updateMap: function(){
		if (this.goToNextLevel) {
			// console.log ("NEED TO GO TO THE NEXT LEVEL");

			this.nextLevel();
			this.goToNextLevel = false;

			// Update player stats on level change
			// (((Network.level - 1) * (Network.level - 1) * 0.75) + 100) + (Network.level * Network.level * 0.75)
			console.log ("==================================== NEW LEVEL ====================================");
			console.log ("Player hp up by " + Math.round((Network.level * Network.level * 0.75) - (((Network.level - 1) * (Network.level - 1) * 0.75))));
			Player.maxHp += Math.round((Network.level * Network.level * 0.75) - (((Network.level - 1) * (Network.level - 1) * 0.75)));
			Player.hp = Player.maxHp; // Full health
			Player.damage += Math.floor(((Network.level * Network.level) - ((Network.level - 1) * (Network.level - 1))) / Player.bulletsPerShot); // Gain damage on a slower curve
			console.log ("Player damage up by " + Math.floor(((Network.level * Network.level) - ((Network.level - 1) * (Network.level - 1))) / Player.bulletsPerShot));
		}

		this.showMap();
	},
	nextLevel: function(){
		this.level++;
		if (this.highestLevel < this.level) {
			this.highestLevel = this.level;
		}

		this.start();
	}
};

function createLevel(map, connections) {
	return {map: map, connections: connections};
}
