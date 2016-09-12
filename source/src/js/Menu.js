/**
 * Menu.js
 */

var Menu = {
	// Properties
	menu: document.querySelector("#menu"), 
	menuHeading: document.querySelector("#menuHead"),
	// Define the upgrades here
	btnNames: [ 
				// HP upgrades
				"Mutate MTU", // "Increased max health by 20%.",
				"ECC", // "Gain 3% health every 5 seconds. This effect stacks.",
				"Packet TAP", // "Gain 0.5% of damage done as health. This effect stacks.",
				"FEC", // "Gain 10% max health and 1.5% health every 5 seconds.",

				// 'Utility' upgrades
				"SSL inspection", // "You move a bit faster.",
				"Jumbo frame", // "Chance to do critical damage increased by 1%.",
				"Decode", // "Critical damage increased by 5%.",
				"Encapsulation", // "Each attack against you does 2% less damage.",

				// Damage upgrades
				"Bruteforce", // "Each ping does 20% more damage.",
				"Ping flood", // "Send out additional pings at the cost of accuracy.",
				"Overflow", // "Rate of fire increased by 4 pings per second."
				"Traceroute" // "Increased accuracy.",
			  ],
	btnDescripts: [ 
					// HP upgrades
					"Increases max health by 25%.",
					"Gain 4% health every 3 seconds. This effect stacks.",
					"Gain 2.5% of damage done back as health. This effect stacks.",
					"Gain 12.5% max health and 2% health every 3 seconds.",

					// 'Utility' upgrades
					"5% higher chance for pings to pierce entities.",
					"Chance to do critical damage increases by 5%.",
					"Critical damage increases by 10%.",
					"Gain 5% damage reduction for each attack.",

					// Damage upgrades
					"Each ping does 20% more damage.",
					"Shoot additional pings at the cost of accuracy.",
					"Rate of fire increases by 4 pings per second.",
					"Increased accuracy."
				  ],

	// Methods
	toggle: function(menuType){
		// Use menuType to show the pause, main, endLevel etc menu screens	
		// console.log ("Game.toggleMenu(" + (menuType || " ") + ") called");
		if (!this.open()) {
			// console.log ("Show the menu");
			// Set background to black
			// document.querySelector("#stage").style.background = "#181818";

			// Using className = ""; as IE does not like classList = "";
			document.querySelector("#mainMenu").className = "hidden";
			document.querySelector("#endScreen").className = "hidden";
			document.querySelector("#upgradeMenu").className = "hidden";
			document.querySelector("#mapMenu").className = "hidden";
			document.querySelector("#pauseMenu").className = "hidden";

			if (menuType === "main" || typeof menuType === "undefined") {
				this.menuHeading.innerHTML = "Nexus overload";
				if (!Network.tutorial && document.querySelector("#tutButton").classList.contains("hidden")) {
					document.querySelector("#tutButton").classList.toggle("hidden");
					document.querySelector("#record").classList.toggle("hidden");
				}
				document.querySelector("#record").innerHTML = "Record: " + Network.highestLevel + "<div class='menuButtonSubText txtGrey'>You will get " + Math.floor(Network.highestLevel / 2) + " free upgrade(s) when you try again.</div>";
				document.querySelector("#mainMenu").classList.toggle("hidden");
			} else if (menuType === "pause") {
				this.menuHeading.innerHTML = "Paused";
				document.querySelector("#endHead").innerHTML = "";
				document.querySelector("#endStats").innerHTML = "";
				document.querySelector("#resumeBtn").className = "menuButton btnGreen";
				document.querySelector("#pauseMenu").classList.toggle("hidden");
			} else if (menuType === "end") {
				this.menuHeading.innerHTML = "Game over";
				document.querySelector("#endHead").innerHTML = "Reached network layer " + Network.level;
				document.querySelector("#endStats").innerHTML = "You killed " + Enemies.totalKills + " enemies<br/>and sent " + Bullets.totalBullets + " ping requests!";
				document.querySelector("#resumeBtn").className = "menuButton btnGreen hidden";
				document.querySelector("#pauseMenu").classList.toggle("hidden");
			} else if (menuType === "upgrade") {
				this.menuHeading.innerHTML = "Packet glitch";
				document.querySelector("#upgradeMenu").classList.toggle("hidden");

				var menuStr = "<div class='ugHead txtWhite'>";
				if (Network.level === 1 && Network.currentCol === 0) {
					menuStr += "You have " + Player.availableUG + " source upgrade(s) remaining";
				} else {
					menuStr += "You have " + Player.availableUG + " upgrade(s) to choose";
				}
				menuStr += "</div><div class='menuButtons'>";

				var btns = ["btnGreen", "btnBlue", "btnOrange"];
				var txts = ["txtGreen", "txtBlue", "txtOrange"];
				var ugIndex = [randomInt(0, 3), randomInt(4, 7), randomInt(8, 11)];

				for (var i = 0; i < 3; i++) {
					console.log ("Upgrade indexs: " + ugIndex[i]);
					menuStr += "<div class='menuButton " + btns[i] + "' onclick='Player.upgrade(" + ugIndex[i] + ");''>" + this.btnNames[ugIndex[i]] + "<div class='menuButtonSubText " + txts[i] + "'>" + this.btnDescripts[ugIndex[i]] + "</div></div>";
				}
				
				menuStr += "</div>";

				document.querySelector("#upgradeMenu").innerHTML = menuStr;

			} else if (menuType === "map") {
				// this.menuHeading.innerHTML = "Map your route";
				this.menuHeading.innerHTML = "Network map";
				document.querySelector("#mapMenu").classList.toggle("hidden");
			}

			this.menu.classList.toggle("show");
			Game.pause();


		} else {
			if (Game.stage.classList.contains("hidden")) {
				Game.stage.classList.toggle("hidden"); // Make sure the game is shown
			}

			if (typeof menuType === "undefined") { // simply hide the menu
				// console.log ("Hide the menu");

				this.menu.classList.toggle("show");
				Game.unpause();

				if (Game.stage.classList.contains("hidden")) {
					Game.stage.classList.toggle("hidden");
				}
			} else {
				if (!Game.stage.classList.contains("hidden")) {
					Game.stage.classList.toggle("hidden"); // Make sure the stage is hidden
					this.menu.classList.toggle("show"); // Hide the menu
					// console.log ("Showing " + menuType + " menu");
					setTimeout(function(){Menu.toggle(menuType);},500);
				}

			}
			
			// Set game background based on level
			// if (Network.goToNextLevel) {
			// 	Game.stage.style.background = "#181111";
			// } else {
			// 	Game.stage.style.background = "#181818";
			// }
		}
	},
	open: function(){
		if (this.menu.classList.contains("show")) {
			return true;
		} else {
			return false;
		}
	}
};