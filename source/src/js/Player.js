/**
 * Player.js
 */

var Player = {
	// Properties
	xpBarElem: document.querySelector("#xpInd"),
	hpBarElem: document.querySelector("#hpInd"),
	xpTextElem: document.querySelector("#xpTxt"),
	hpTextElem: document.querySelector("#hpTxt"),
	// alive: true,
	// deathTime: null,
	// armor: 0,
	// maxHp: 100,
	// hp: 100,
	// availableUG: 0,
	// hpRegen: 0,
	// hpTimer: Date.now(),
	// xp: 0,
	// prevLevelXP: 0,
	// nextLevelXP: 100,
	// level: 1,
	// speed: 5,
	x: 50,
	y: Game.canvasHeight / 2,
	width: 60,
	height: 40,
	// radius: 37, // root of ((30*30) + (20*20)) rounded up

	colour: ["#808080" ,"#3EDBFF", "#F00", "#0F0", "#0FF", "#FFF"],
	// colCount: 0,
	angle: 0,

	// bulletRate: 4, // Bullets per second
	// bulletTimer: null,
	// bulletSpray: 1, // 0 is most accurate
	// bulletsPerShot: 1,
	// bullestPassThrough: 0,
	bulletSpeed: 20,
	// damage: 20,
	// lifeSteal: 0,
	// crit: 0.01,
	// critDamage: 0.5,

	top: new Point(0, 0),
	bottomLeft: new Point(0, 0),
	bottomRight: new Point(0, 0),
	area: 0,

	hpTopLeft: new Point(0, 0),
	hpWidth: 50,

	distanceToMouse: 0,
	lvlAnim: 0, 

	// Methods
	init: function(){
		this.calcTriPoints();
		this.area = getAreaOfTriangle(this.top, this.bottomLeft, this.bottomRight);
		// console.log (this.area);

		this.reset();
	},
	reset: function(){
		console.log ("Reset player");
		this.alive = true;
		this.deathTime = null;
		this.armor = 0;
		this.maxHp = 100;
		this.hp = 100;
		this.hpRegen = 0;
		this.hpTimer = Date.now();
		this.availableUG = Math.floor(Network.highestLevel / 2); // At start give the player free abilities based on previous playthroughs
		if (Network.tutorial) {
			this.availableUG = 0;
		}
		this.xp = 0;
		this.prevLevelXP = 0;
		this.nextLevelXP = 40;
		this.level = 1;
		this.speed = 6;

		// this.colCount = 0;

		// this.colour = "#3EDBFF";

		this.bulletRate = 4; // Bullets per secon;
		this.bulletTimer = null;
		this.bulletSpray = 1.5; // 0 is most accurat;
		this.bulletsPerShot = 1;
		this.bullestPassThrough = 0;
		this.damage = 20;
		this.lifeSteal = 0;
		this.crit = 0.01;
		this.critDamage = 0.5;

		var xpToLevel = this.nextLevelXP - this.prevLevelXP;
		var xpToGo = this.xp - this.prevLevelXP;
		this.xpBarElem.style.width = Math.round(xpToGo / xpToLevel * 100) + "%";
		this.xpTextElem.innerHTML = xpToGo + " / " + xpToLevel + " bits";

		this.hpBarElem.style.width = "0%";

		this.moveToStart();
	},
	rotate: function(){
		// The player should always point to the mouse
		if (this.alive) {
			this.angle = angleBetween(new Point(this.x, this.y), Input.canvasMouse);
		}
	},
	move: function(){
		if (this.alive){
			if (Input.up && Input.down) {
				// do nothing
			} else if (Input.up){
				this.y -= this.speed;
			} else if (Input.down) {
				this.y += this.speed;
			}

			if (Input.left && Input.right) {
				// do nothing
			} else if (Input.left){
				this.x -= this.speed;
			} else if (Input.right) {
				this.x += this.speed;
			}
		}

		this.calcTriPoints();
		this.insideRoom();
	},
	moveToStart: function(){
		this.x = 50;
		this.y = Game.canvasHeight / 2;
	},
	insideRoom: function(){
		while (this.top.x < 0 || this.bottomLeft.x < 0 || this.bottomRight.x < 0) {
			this.x++;
			this.calcTriPoints();
		}

		while (this.top.x > Game.canvasWidth || this.bottomLeft.x > Game.canvasWidth || this.bottomRight.x > Game.canvasWidth) {
			this.x--;
			this.calcTriPoints();
		}

		while (this.top.y < 0 || this.bottomLeft.y < 0 || this.bottomRight.y < 0) {
			this.y++;
			this.calcTriPoints();
		}

		while (this.top.y > Game.canvasHeight || this.bottomLeft.y > Game.canvasHeight || this.bottomRight.y > Game.canvasHeight) {
			this.y--;
			this.calcTriPoints();
		}
	},
	calcTriPoints: function(){
		this.top.x = this.x + Math.cos(degToRad(this.angle)) * (this.width / 2);
		this.top.y = this.y + Math.sin(degToRad(this.angle)) * (this.width / 2);

		this.bottomLeft.x = this.x + Math.cos(degToRad((this.angle + 180) % 360)) * (this.width / 2);
		this.bottomLeft.y = this.y + Math.sin(degToRad((this.angle + 180) % 360)) * (this.width / 2);

		this.bottomRight.x = this.bottomLeft.x + Math.cos(degToRad((this.angle - 90) % 360)) * (this.height / 2);
		this.bottomRight.y = this.bottomLeft.y + Math.sin(degToRad((this.angle - 90) % 360)) * (this.height / 2);

		this.bottomLeft.x += Math.cos(degToRad((this.angle + 90) % 360)) * (this.height / 2);
		this.bottomLeft.y += Math.sin(degToRad((this.angle + 90) % 360)) * (this.height / 2);
	},
	shoot: function(){
		if (Input.mouseDown && this.alive) {
			if (this.bulletTimer === null) {
				this.bulletTimer = Date.now();

				Bullets.fireBullet(this.x, this.y, this.angle, this.damage, this.bulletSpeed);
				Sound.play("shoot");
			}
			
			// Updating timer if needed
			this.bulletTimer += Game.updateTimer();
			if (Date.now() - this.bulletTimer > 1000 / this.bulletRate) {
				this.bulletTimer = null;
			}
		} else if (this.bulletTimer !== null) {
			this.bulletTimer = null;
		}
	},
	takeDamage: function(damage){
		// build resistances etc in here
		if (this.alive) {
			var dmg = Math.floor(damage - (damage * this.armor));
			if ((dmg) >= this.hp) {
				this.hp = 0;
				this.alive = false;
				Game.screenShake(150,250);
				Sound.play("die");

				this.deathTime = Date.now();
			} else {
				this.hp -= dmg;
				Game.screenShake(Math.floor((dmg / this.maxHp) * 50) ,10);
				Sound.play("damage");
			}
		}
	},
	gainXP: function(xpPoints){
		this.xp += xpPoints;

		if (this.xp >= this.nextLevelXP) {
			this.prevLevelXP = this.nextLevelXP;
			this.nextLevelXP += this.nextLevelXP;
			this.availableUG++;
			Sound.play("level");
			// Game.stage.style.background = "#141E16";
			// setTimeout(function(){
			// 	if (Network.goToNextLevel) {
			// 		Game.stage.style.background = "#181111";
			// 	} else {
			// 		Game.stage.style.background = "#181818";
			// 	}
			// },300);

			// Full HP on level up
			// Show this visually
			// this.maxHp += Math.floor(this.maxHp * 0.1); // Gain 10% hp
			this.hp = this.maxHp; // Full health
			// this.damage += Math.floor(this.damage * 0.05); // Gain 5% damage
			this.lvlAnim = 30;
		}

		var xpToLevel = this.nextLevelXP - this.prevLevelXP;
		var xpToGo = this.xp - this.prevLevelXP;
		this.xpBarElem.style.width = Math.round(xpToGo / xpToLevel * 100) + "%";
		this.xpTextElem.innerHTML = xpToGo + " / " + xpToLevel + " bits";
	},
	regenHP: function(){
		// hpRegen
		// hpTimer
		if (this.alive) {
			this.hpTimer += Game.updateTimer();
			if (Date.now() >= this.hpTimer + 3000) { // 3 seconds
				// console.log ("Health regen");
				this.hpTimer = Date.now();
				// console.log ("HP REGEN TIME: " + Math.floor(this.hpRegen * this.maxHp));
				this.gainHP(Math.floor(this.hpRegen * this.maxHp));
			}
		}
	},
	update: function(){
		// Player movement
		this.move();
		this.rotate();

		// Player actions
		this.shoot();

		this.distanceToMouse = Math.sqrt(Math.pow(Player.x - Input.canvasMouse.x, 2) + Math.pow(Player.y - Input.canvasMouse.y, 2));

		// HP
		this.regenHP();

		if (!this.alive && this.deathTime !== null) {
			this.deathTime += Game.updateTimer();
			if (Date.now() >= this.deathTime + 1250) {
				Menu.toggle("end");
				this.deathTime = null;
			}
		}
	},
	collidingPoint: function(x, y){
		// Check square first?
		// If preformance is an issue I should do this.

		// is the given point in the player's triangle?
		// Check collision help: http://compsci.ca/v3/viewtopic.php?t=6034
		// if area of 3 tris are same as main tri, point inside
		// Area PAB + Area PBC + Area PAC === Area ABC

		var triangle1 = getAreaOfTriangle({x: x, y: y}, this.top, this.bottomLeft);
		if (triangle1 > this.area){
			return false;
		}

		var triangle2 = getAreaOfTriangle({x: x, y: y}, this.top, this.bottomRight);
		if (triangle1 + triangle2 > this.area){
			return false;
		}

		var triangle3 = getAreaOfTriangle({x: x, y: y}, this.bottomRight, this.bottomLeft);
		if (triangle1 + triangle2 + triangle3 === this.area) {
			return true;
		}

		return false;
	},
	upgrade: function(upgradeIndex){
		// This needs to be finished
		if (this.availableUG > 0 && Menu.open()) {
			this.level++;
			this.availableUG--;

			switch(upgradeIndex) {
			    case 0: {
					// 0  "Increased max health by 25%.",
			        this.maxHp += Math.floor(this.maxHp * 0.25);
			        this.hp += Math.floor(this.hp * 0.25);
			        break;
			    }
			    case 1: {
			        // 1  "Gain 4% health every 3 seconds. This effect stacks.",
			        this.hpRegen += 0.04;
			        break;
			    }
			    case 2: {
			    	// 2  "Gain 1% of damage done as health. This effect stacks.",
			    	this.lifeSteal += 0.025;
			    	break;
			    }case 3: {
			    	// 3  "Gain 12.5% max health and 2% health every 3 seconds..",
			    	this.maxHp += Math.floor(this.maxHp * 0.125);
			    	this.hp += Math.floor(this.hp * 0.125);
			    	this.hpRegen += 0.02;
			    	break;
			    }case 4: {
			    	// 4  "5% higher chance for pings to penetrate entities.",
			    	this.bullestPassThrough += 0.05;
			    	break;
			    }case 5: {
			    	// 5  "Chance to do critical damage increased by 5%.",
			    	this.crit += 0.05;
			    	break;
			    }case 6: {
			    	// 6  "Critical damage increased by 10%.",
			    	this.critDamage += 0.1;
			    	break;
			    }case 7: {
			    	// 7  "Each attack against you does 5% less damage.",
			    	this.armor += 0.05;
			    	if (this.armor > 0.9) {
			    		this.armor = 0.9;
			    	}
			    	break;
			    }case 8: {
			    	// 8  "Each ping does 20% more damage.",
			    	this.damage += Math.floor(this.damage * 0.2);
			    	break;
			    }case 9: {
			    	// 9  "Send out additional pings at the cost of accuracy.",
			    	this.bulletsPerShot++;
			    	if (this.bulletsPerShot > 20) {
			    		this.bulletsPerShot = 20;
			    	} else {
			    		this.damage -= Math.floor(this.damage * 0.3);
			    	}
			    	this.bulletSpray += 1.5;
			    	if (this.bulletSpray > 20) {
			    		this.bulletSpray = 20;
			    	}
			    	break;
			    }case 10: {
			    	// 10 "Rate of fire increased by 4 pings per second."
			    	this.bulletRate += 4;
			    	if (this.bulletRate > 50) {
			    		this.bulletRate = 50;
			    	} else {
			    		this.damage -= Math.floor(this.damage * 0.3);
			    	}

			    	this.bulletSpray++;
			    	if (this.bulletSpray > 20) {
			    		this.bulletSpray = 20;
			    	}
			    	break;
			    }case 11: {
			    	// 11 "Increased accuracy.",
			    	this.bulletSpray -= 2;
			    	if (this.bulletSpray < 0.5) {
			    		this.bulletSpray = 0.5;
			    	}
			    	break;
			    }
			}

			if (this.availableUG === 0) {
				Menu.toggle("map");
			} else {
				Menu.toggle("upgrade");
			}
		}
	},
	gainHP: function(hp){
		this.hp += hp;
		if (this.hp > this.maxHp) {
			this.hp = this.maxHp;
		}
	},
	drawHp: function(ctx){
		if (this.alive) {
			this.hpBarElem.style.width = Math.round(this.hp / this.maxHp * 100) + "%";
			this.hpTextElem.innerHTML = Math.round(this.hp) + " / " + this.maxHp + " MTU";
		} else {
			this.hpBarElem.style.width = "0%";
			this.hpTextElem.innerHTML = "0 / " + this.maxHp + " MTU";
		}
	},
	draw: function(ctx){
		this.drawHp(ctx);
		// this.colCount++;
		var gStr = 0;

		if (this.alive) {
			var colMax = 1;
			if (Input.mouseDown) {
				colMax = Math.min(Math.floor(this.bulletsPerShot +  this.bulletRate / 10), 5);
			}
			// if (this.colCount > 250) {
				// colMax = Math.min(Math.floor((this.level / 3) + 1), 5);
				// if (this.colCount > 300) {
					// this.colCount = randomInt(Math.min(Math.floor(this.level * 15), 250), 250);
				// }
			// }
			ctx.fillStyle = this.colour[randomInt(1, colMax)];

			gStr = Math.min((((this.armor / 10) + ((this.crit - 0.01) / 10) + ((this.critDamage - 0.5) / 20)) * 50) + Math.floor(this.level / 3), 7);

			if (this.lvlAnim > 0) {
				console.log ("Leveling anim");
				ctx.strokeStyle = "#999";
				ctx.lineWidth = this.lvlAnim / 5;
				for (var i = 0; i < 5; i++) {
					ctx.beginPath();
					ctx.arc(this.x, this.y, (30 - this.lvlAnim) * i, 0, Math.PI * 2);
					ctx.stroke();
					this.lvlAnim -= 0.2;
				}
			}
		} else {
			ctx.fillStyle = this.colour[0];
		}

		// Draw the triangle
		ctx.beginPath();
		ctx.moveTo(this.top.x + randomInt(-gStr, gStr), this.top.y + randomInt(-gStr, gStr));
		ctx.lineTo(this.bottomRight.x + randomInt(-gStr, gStr), this.bottomRight.y + randomInt(-gStr, gStr));
		ctx.lineTo(this.bottomLeft.x + randomInt(-gStr, gStr), this.bottomLeft.y + randomInt(-gStr, gStr));
		ctx.closePath();

		ctx.fill();
	},
	drawCursor: function (ctx) {
		ctx.strokeStyle = "#484848";
		ctx.fillStyle = "#EEE";
		ctx.lineWidth = 1;

		ctx.beginPath();
		// Need to get rid of this square root
		// With a bulletSpray of 1 at a distance of 1 the spray radius would be 0.0175
		ctx.arc(Input.canvasMouse.x, Input.canvasMouse.y, this.bulletSpray * 0.0175 * this.distanceToMouse, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(Input.canvasMouse.x, Input.canvasMouse.y, 2.5, 0, 2 * Math.PI);
		ctx.fill();
	},
};

