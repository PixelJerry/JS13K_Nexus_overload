/**
 * Room.js
 */

var Room = {
	// Properties
	clear: false,
	exitTime: null,

	story: 1,

	tutorialElem: document.querySelector("#tutorial"),
	storyElem: document.querySelector("#story"),

	// Methods
	start: function(nodeType){
		// console.log ("STARTING ROOM");
		Game.timerReset();
		this.nextStory();
		FX.clear();
		document.querySelector("#mainCanvas").className = "room btnGrey";

		// console.log ("INC NOED TYPE: " + nodeType);

		// FX.createEmitter(500,500);

		if (this.story <= 6 && Network.tutorial) {
			// Gen story levels
			if (this.story - 1 === 1 || this.story - 1 === 2) {
				// Enemies.spawnCrawlerDen(1, 1);
				for (var i = 0; i < 3; i++) {
					Enemies.spawnCrawler(1000, 375 + (i * 50), 1);
				}
			} else if (this.story - 1 === 3) {
				for (var j = 0; j < 3; j++) {
					var type = 1;
					if (j === 1) {
						type = 2;
					}
					Enemies.spawnCrawler(1000, 325 + (j * 50), type);
				}
			} else if (this.story - 1 === 4) {
				for (var k = 0; k < 5; k++) {
					Enemies.spawnCrawler(1000, 325 + (k * 50), 1);
				}
			} else if (this.story - 1 === 5) {
				document.querySelector("#mainCanvas").className = "room btnRed";
				for (var l = 0; l < 3; l++) {
					Enemies.spawnCrawler(1000, 325 + (l * 100), 1);
				}
				for (var m = 0; m < 2; m++) {
					Enemies.spawnCrawler(1000, 375 + (m * 100), 2);
				}
			}

			Enemies.setSpeed(0.5);
		} else { // Gen game levels
			if (nodeType === -1) {
				// LAST NODE (Router)
				document.querySelector("#mainCanvas").className = "room btnRed";
				this.spawnElite();
				this.spawnMob();
				this.spawnMob();
			} else if (nodeType === 5) {
				// Elite node (PROXY)
				document.querySelector("#mainCanvas").className = "room btnBlue";
				console.log ("NODE TYPE = 5");
				this.spawnElite();
			} else if (nodeType === 6) {
				document.querySelector("#mainCanvas").className = "room btnOrange";
				console.log ("NODE TYPE = 6");
				// Boss node (FIREWALL)
				this.spawnBoss();
				Player.availableUG++;
			} else {
				console.log ("NORMAL ROOM");
				// Normal room
				this.spawnMob();
				// var test = Math.random();
				
				// if (test < 0.9) {
				// 	// normal (90% chance)
				// 	this.spawnMob();
				// } else if (test < 0.99) {
				// 	// elite (9% chance)
				// 	this.spawnElite();
				// } else {
				// 	// boss (1% chance)
				// 	this.spawnBoss();
				// }
			}
		}
	},
	spawnMob: function() {
		// All spawns should take network layer (level) into account
		var numCrawl = randomInt(Network.level * 2, Network.level * 3);
		var numPuls = randomInt(Network.level, Network.level * 2);

		Enemies.spawnCrawlerDen(numCrawl, 1);
		Enemies.spawnPulserDen(numPuls, 1);
	},
	spawnElite: function(){
		//
		this.spawnMob();

		var numCrawl = randomInt(Math.ceil(Network.level * 0.5), Math.ceil(Network.level * 0.75));
		var numPuls = randomInt(Math.ceil(Network.level * 0.25), Math.ceil(Network.level * 0.5));

		Enemies.spawnCrawlerDen(numCrawl, 2);
		Enemies.spawnPulserDen(numPuls, 2);
	},
	spawnBoss: function() {
		//
		this.spawnElite();

		var numCrawl = randomInt(Math.ceil(Network.level * 0.25), Math.ceil(Network.level * 0.5));
		var numPuls = randomInt(Math.ceil(Network.level * 0.1), Math.ceil(Network.level * 0.25));

		Enemies.spawnCrawlerDen(numCrawl, 3);
		Enemies.spawnPulserDen(numPuls, 3);
	},
	reset: function(){
		// console.log ("Player xp: " + Player.xp);
		this.clear = false;
		this.exitTime = null;

		Bullets.clear();
		Enemies.clear();
		Player.moveToStart();
	},
	nextStory: function(){
		// Clear the current story and tutorial
		this.tutorialElem.innerHTML = "";
		this.storyElem.innerHTML = "";

		if (this.story <= 5 && Network.tutorial) {
			var tutString = "<div class='tHead txtWhite'>";
			var storyString = "<em>";

			if(this.story === 1) {
				// Tutorial is different for the first page
				tutString = "<div class='tHead txtWhite tLeft'>";
				tutString += "Movement";
				tutString += "</div><div class='tHead txtWhite tRight'>";
				tutString += "Attack";
				tutString += "</div><div class='tLeft'>";
				tutString += "<div class='tKey btnBlue txtBlue'>W</div>";
				tutString += "<div class='tKey btnBlue txtBlue'>A</div>";
				tutString += "<div class='tKey btnBlue txtBlue'>S</div>";
				tutString += "<div class='tKey btnBlue txtBlue'>D</div>";
				tutString += "</div><div class='tRight tTxt txtOrange'>";
				tutString += "Mouse to aim<br/>Left mouse to shoot";

				storyString += "There once was a little data-packet,<br/>trapped in a looped network.";
			} else if (this.story === 2) {
				tutString += "Data Gain";
				tutString += "</div><div class='tTxt txtOrange'>";
				tutString += "Overload crawlers and pulsars with<br/>ping requests to gain their data bits.";

				storyString += "He found a way to glitch the system,<br/>overloading the hostile entities and learning their secrets.";
			} else if (this.story === 3) {
				storyString += "The data gained through his experience helped<br/>him to understand how to bend the Nexus to his advantage.";
			} else if (this.story === 4) {
				storyString += "The little packet was convinced he would fulfil his destiny,<br/>unaware that the looping Nexus was just drawing him in deeper.";
			} else if (this.story === 5) {
				tutString += "Nexus source";
				tutString += "</div><div class='tTxt txtOrange'>";
				tutString += "For every two layers you complete, you gain<br/>one free upgrade on your future play-throughs.";

				storyString += "As the little packet moved deeper through the Nexus, his<br/>understanding of the source grew and he knew this would serve him well one day.";
			}

			tutString += "</div>";
			storyString += "</em>";

			// Finally set the story and tutorial
			this.tutorialElem.innerHTML = tutString;
			this.storyElem.innerHTML = storyString;

			this.story++;
		}

	},
	update: function(){
		//
		if (!this.clear && Enemies.enemiesKilled()) {
			this.clear = true;
			this.exitTime = Date.now() + 500;
		}

		if (this.exitTime !== null) {
			this.exitTime += Game.updateTimer();
		}

		if (this.exitTime !== null && Date.now() >= this.exitTime && Player.alive) {
			this.exitTime = null;

			Network.updateMap();
			if (Player.availableUG > 0) {
				Menu.toggle("upgrade");
			} else {
				Menu.toggle("map");
			}
		}
	}
};
