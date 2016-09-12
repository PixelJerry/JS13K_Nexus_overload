/**
 * Enemy.js
 */

// Start by defining the base enemy
function Enemy(x, y, definingObject){
	this.mod = definingObject;
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;

	this.distanceToPlayerSquared = 0;

	this.speed = 0;
	this.range = 0;

	this.xp = 0;

	this.maxHp = 10;
	this.hp = 10;

	this.radius = 14;

	this.colour = "#FF9D00";
	this.dCol = ["#282828","#333","#383838"];

	this.angle = 0;

	this.damage = 0;

	this.alive = true;

	this.attackSpeed = 1; // attacks per second
	this.attackTimer = Date.now();

	// SPECIAL FOR BOSS AND INTERMEDIA
	this.spawnTimer = Date.now() + randomInt(-1000, 1000);
	this.spawnTime = 5000; // Spawn minnions every 5 seconds
	this.stopTimer = null;
	this.spawned = 0;

	this.difAdj = 1;

	this.dc = 0; // Damage draw counter

	this.init();
}

Enemy.prototype = {
	init: function(){
		this.mod.init(this);

		this.xp = Math.round(Network.level * 10 * this.mod.type * this.difAdj);

		this.maxHp = Math.round((((Network.level * Network.level * this.difAdj * 2)) * this.mod.type) + (20 + (30 * this.difAdj)));
		this.hp = this.maxHp;
		// console.log (this.hp);

		this.damage = Math.round((((Network.level * Network.level * this.difAdj) * this.mod.type) + ((20 * this.difAdj))) * 0.25);
		console.log (this.damage);
	},
	calcVelocity: function(){
		this.mod.calcVelocity();
	},
	move: function(){
		this.x += this.vx;
		this.y += this.vy;

		while (this.x - this.radius < 0) {
			this.x++;
			this.followPlayer();
		}
		while (this.x + this.radius > Game.canvasWidth) {
			this.x--;
			this.followPlayer();
		}

		while (this.y - this.radius < 0) {
			this.y++;
			this.followPlayer();
		}
		while (this.y + this.radius > Game.canvasHeight) {
			this.y--;
			this.followPlayer();
		}
	},
	attack: function(){
		this.mod.attack();
	},
	takeDamage: function(damage){
		// type 1 has no resistance
		// type 2 is 25% resistant
		// type 3 is 50% resistant
		var dmg = Math.round(damage - (damage * ((this.mod.type - 1) * 0.25)));
		// console.log ("type: " + this.mod.type);
		// console.log ("inc damage: " + damage);
		// console.log ("damage redution: " + (damage - dmg));
		if (this.alive) {
			if (dmg >= this.hp) {
				this.hp = 0;
				this.alive = false;

				// Give the player xp
				Player.gainXP(this.xp);
				// FX.createParticles(this.x, this.y, 7, "#2DAA9B");

				Sound.play("enemyDie");
				if (this.mod.type === 3) {
					Game.screenShake(15,200);
					Sound.play("bossDie");
				}

				this.dc = 0;
			} else {
				this.hp -= dmg;
				this.dc = 3;
			}

			// Sound.play("damage");
		}
	},
	followPlayer: function(){
		this.angle = angleBetween(new Point(this.x, this.y), new Point(Player.x, Player.y));
	},
	update: function(){
		if (this.alive) {
			this.mod.update();
			this.special();
			this.calcVelocity();
			// Skitter
			if (this.vx !== 0 || this.vy !== 0) {
				this.angle += randomInt(-15,15);
			}
			
			this.move();

			this.attack();
		}
	},
	drawHp: function(ctx){
		ctx.strokeStyle = "#A0A0A0";
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(this.x - (this.radius), this.y - (this.radius * 2));
		ctx.lineTo(this.x + (this.radius), this.y - (this.radius * 2));
		ctx.stroke();

		ctx.strokeStyle = "#FF5A5A";
		ctx.beginPath();
		ctx.moveTo(this.x - this.radius, this.y - (this.radius * 2));
		ctx.lineTo((this.x - this.radius) + ((this.radius * 2) * Math.max(this.hp / this.maxHp, 0)), this.y - (this.radius * 2));
		ctx.stroke();
	},
	draw: function(ctx){
		ctx.fillStyle = this.colour;
		
		if (!this.alive) {
			// ctx.globalCompositeOperation = "destination-over";
			// ctx.fillStyle = "#383838";
			ctx.fillStyle = this.dCol[randomInt(0,2)];
		} else if (this.dc > 0) {
			this.dc--;
			ctx.fillStyle = "#DDD";
		}
		ctx.save();
		// get canvas ready for rotation
		ctx.translate(this.x, this.y);
		ctx.rotate((this.angle % 360) * Math.PI / 180);
		ctx.translate(-this.x, -this.y);

		ctx.beginPath();
		this.mod.draw(ctx);

		ctx.restore();

		if (this.alive) {
			this.drawHp(ctx);
		}
	},
	special: function(){
		if (Player.alive && this.alive && this.mod.type === 3) {

			this.spawnTimer += Game.updateTimer();

			if (Date.now() >= this.spawnTimer + this.spawnTime) {
				// Spawn about 6 crawlers around me
				this.speed = 0;
				this.colour = "#FFF";

				if (Date.now() >= this.spawnTimer + this.spawnTime + 250) { // plus 0.25% of a second
					if (Date.now() >= this.spawnTimer + this.spawnTime + 250 + (this.spawned * 500)) {
						// console.log ("Spawning wave");
						this.spawned++;
						Sound.play("bossSpawn");
						this.mod.spawnMinion();
					}

					if (this.spawned >= Network.level) {
						this.spawnTimer = Date.now();
						this.stopTimer = Date.now();
						this.spawned = 0;
					}
				}
			}

			if (this.stopTimer !== null) {
				this.stopTimer += Game.updateTimer();
				if (Date.now() >= this.stopTimer + 250) {
					this.stopTimer = null;
					this.speed = this.mod.speed;
					this.colour = this.mod.colour;
				}
			}
		}
	}
};

// ===============================================================================
// Now I need to define the enemy modifications
// These MUST have the following property that is set in init():
// parentObj
//
// And MUST have the following methods:
// init(parentObj)
// calcVelocity()
// attack()
// update() // Update is called before any other function in the update que
// draw(ctx)

// ===============================================================================


// Crawler type is the 'zombie' type
function Crawler(type){
	this.parentObj = null;
	// Type is number between 1 and 3, 1 is normal 3 is boss
	this.type = type;
}

Crawler.prototype = {
	init: function(parentObj){
		this.parentObj = parentObj;
		// Need to calculate the following based on network level:
		// Speed
		// Range
		// XP Granted
		// HP
		// Attack speed
		this.parentObj.difAdj = 0.7;

		this.parentObj.speed = 2 + (this.type / 2);
		this.parentObj.range = 50 + ((this.type - 1) * 30);

		this.parentObj.radius = 14 + ((this.type - 1) * 10);

		if (this.type === 1) {
			this.parentObj.colour = "#FF9D00";
		} else if (this.type === 2) {
			this.parentObj.colour = "#C63E02";
		} else {
			this.parentObj.colour = "#C41205";
		}

		this.parentObj.angle = 0;

		this.parentObj.alive = true;

		this.parentObj.attackSpeed = 3; // three attacks per second

		// SPECIAL FOR BOSS 
		this.speed = this.parentObj.speed;
		this.colour = "#C41205";
	},
	calcVelocity: function(){
		this.parentObj.distanceToPlayerSquared = Math.pow(Player.x - this.parentObj.x, 2) + Math.pow(Player.y - this.parentObj.y, 2);

		if (this.parentObj.distanceToPlayerSquared > Math.pow(this.parentObj.range, 2)){
			this.parentObj.vx = Math.cos(degToRad(this.parentObj.angle)) * this.parentObj.speed;
			this.parentObj.vy = Math.sin(degToRad(this.parentObj.angle)) * this.parentObj.speed;
		} else {
			this.parentObj.vx = 0;
			this.parentObj.vy = 0;
		}
	},
	attack: function(){
		if (this.parentObj.distanceToPlayerSquared <= Math.pow(this.parentObj.range, 2) && Player.alive){
			this.parentObj.attackTimer += Game.updateTimer();
			if (Date.now() - this.parentObj.attackTimer > 1000 / this.parentObj.attackSpeed) {
				this.parentObj.attackTimer = Date.now();
				// console.log ("Attack the player");
				Player.takeDamage(this.parentObj.damage);

				Sound.play("enemyAttack");
			}
		}
	},
	update: function(){
		this.parentObj.followPlayer();
	},
	draw: function(ctx){
		ctx.fillRect(this.parentObj.x - this.parentObj.radius, this.parentObj.y - this.parentObj.radius, this.parentObj.radius * 2, this.parentObj.radius * 2);
	},
	// Custom to the crawler
	spawnMinion: function(){
		if (Math.random() < 0.85) { // 85% chance of spawning a normal minion
			Enemies.spawnCrawler(this.parentObj.x, this.parentObj.y, 1);
		} else { // 15% chance of spawning an elite minnion
			Enemies.spawnCrawler(this.parentObj.x, this.parentObj.y, 2);
		}
	}
					
};


// Pulser type is a 'wanderer' type
function Pulser(type) {
	this.parentObj = null;
	// Type is number between 1 and 3, 1 is normal 3 is boss
	this.type = type;
}

Pulser.prototype = {
	init: function(parentObj){
		this.parentObj = parentObj;
		// Need to calculate the following based on network level:
		// Speed
		// Range
		// XP Granted
		// HP
		// Attack speed
		this.parentObj.difAdj = 1;

		this.parentObj.speed = 2;
		this.parentObj.range = 500;

		this.parentObj.radius = 20 + ((this.type - 1) * 10);

		if (this.type === 1) {
			this.parentObj.colour = "#E461FF";
		} else if (this.type === 2) {
			this.parentObj.colour = "#B71D93";
		} else {
			this.parentObj.colour = "#D10554";
		}

		this.parentObj.angle = randomInt(0,359);

		this.parentObj.alive = true;

		this.parentObj.attackSpeed = 0.5; // One attack every 2 seconds

		this.bulletSpeed = 10;

		this.parentObj.attackTimer += randomInt(-1000, 1000);

		// SPECIAL FOR BOSS AND INTERMEDIA
		this.speed = this.parentObj.speed;
		this.colour = "#D10554";
	},
	calcVelocity: function(){
		// RANDOM FOR TESTING
		this.parentObj.angle += randomInt(-10, 10);
		// this.parentObj.angle = this.parentObj.angle % 360;

		this.parentObj.vx = Math.cos(degToRad(this.parentObj.angle)) * this.parentObj.speed;
		this.parentObj.vy = Math.sin(degToRad(this.parentObj.angle)) * this.parentObj.speed;
	},
	attack: function(){
		if (Player.alive){
			this.parentObj.attackTimer += Game.updateTimer();
			if (Date.now() - this.parentObj.attackTimer > 1000 / this.parentObj.attackSpeed) {
				this.parentObj.attackTimer = Date.now();
				// console.log ("Attack the player");
				// Player.takeDamage(this.parentObj.damage);

				// Fire bullets
				for (var i = 0; i < 360; i += Math.floor(360 / 20)) {
					Bullets.fireBullet(this.parentObj.x, this.parentObj.y, i, this.parentObj.damage, this.bulletSpeed, true);
				}

				Sound.play("enemyAttack");
			}
		}
	},
	update: function(){
		// DO nothing extra
	},
	draw: function(ctx){
		var rAd = 0;
		if (this.parentObj.alive) {
			rAd = randomInt(-this.type * 2, this.type * 2);
		}
		ctx.arc(this.parentObj.x, this.parentObj.y, this.parentObj.radius + rAd, 0, Math.PI * 2);
		ctx.fill();
	},
	spawnMinion: function(){
		if (Math.random() < 0.85) { // 85% chance of spawning a normal minion
			Enemies.spawnPulser(this.parentObj.x, this.parentObj.y, 1);
		} else { // 15% chance of spawning an elite minnion
			Enemies.spawnPulser(this.parentObj.x, this.parentObj.y, 2);
		}
	}
};

// Enemy manager
var Enemies = {
	// Properties
	// totalEnemiesSpawned: 0,
	totalKills: 0,
	enemies: [],
	deadEnemies: [],

	// Mehtods
	spawn: function(x, y, modObject) {
		this.enemies[this.enemies.length] = new Enemy(x, y, modObject);
		// this.totalEnemiesSpawned++;
	},
	clean: function(){
		for (var i = this.enemies.length - 1; i >= 0; i--) {
			if (!this.enemies[i].alive) {
				// Add enemy to dead enemies and remove from live ones
				this.deadEnemies.push(this.enemies[i]);
				this.enemies.splice(i, 1);
				this.totalKills++;
			}
		}
	},
	update: function(){
		this.clean();

		for (var e in this.enemies) {
			this.enemies[e].update();
		}
	},
	draw: function(ctx){
		for (var i = this.enemies.length - 1; i >= 0; i--) {
			this.enemies[i].draw(ctx);
		}
		// for (var e in this.enemies) {
		// 	this.enemies[e].draw(ctx);
		// }
	},
	drawDeadEnemies: function(ctx){
		for (var de in this.deadEnemies) {
			this.deadEnemies[de].draw(ctx);
		}
	},
	spawnCrawlerDen: function(numCrawlers, type){
		for (var i = 0; i < numCrawlers; i++) {
			var newX = randomInt(300, Game.canvasWidth - 300);
			var newY = randomInt(200, Game.canvasHeight - 200);
			this.spawnCrawler(newX, newY, type);
		}
	},
	spawnCrawler: function(x, y, type){
		Enemies.spawn(x, y, new Crawler(type));
	},
	spawnPulser: function(x, y, type){
		this.spawn(x, y, new Pulser(type));
	},
	spawnPulserDen: function(numPulsers, type){
		for (var i = 0; i < numPulsers; i++) {
			var newX = randomInt(500, Game.canvasWidth - 500);
			var newY = randomInt(400, Game.canvasHeight - 400);
			this.spawnPulser(newX, newY, type);
		}
	},
	enemiesKilled: function(){
		return this.enemies.length === 0;
	},
	clear: function(){
		// this.totalEnemiesSpawned = 0;
		this.enemies = [];
		this.deadEnemies = [];
	},
	setSpeed: function(speed) {
		for (var en in this.enemies) {
			this.enemies[en].speed = speed;
		}
	}
};