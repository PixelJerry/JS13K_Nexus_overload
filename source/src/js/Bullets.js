/**
 * Bullets.js
 */

// Types of bullets?
function Bullet(x, y, angle, damage, notFriendly){
	this.x = x;
	this.y = y;
	this.angle = angle;
	this.damage = damage;
	this.colour = "";

	this.vx = 0;
	this.vy = 0;

	if (typeof notFriendly !== "undefined") {
		this.friendly = !notFriendly;
	} else {
		this.friendly = true;
	}

	this.passThrough = false;
	this.hitAccuracy = 2;

	this.kill = false;

	this.init();
	this.calcVelocity();
}

Bullet.prototype = {
	init: function(){
		if (this.friendly) {
			this.passThrough = Math.random() < Player.bullestPassThrough;

			if (this.passThrough) {
				this.colour = "#38FF00";
			} else {
				this.colour = "#9FF1FF";
			}

			if (Math.random() < Player.crit) {
				this.damage += Math.floor(this.damage * Player.critDamage);
				this.colour = "#FFE600";
				if (this.passThrough) {
					this.colour = "#FFF";
				}
			}
		} else {
			this.colour = "#FF5C87";
		}
	},
	calcVelocity: function(){
		// Need to calculate the x and y speed
		this.vx = Math.cos(degToRad(this.angle)) * Bullets.speed;
		this.vy = Math.sin(degToRad(this.angle)) * Bullets.speed;
		// console.log ("(x: " + this.vx + ", y: " + this.vy + ")");
	},
	move: function(){
		this.x += this.vx;
		this.y += this.vy;

		this.remove();
	},
	hit: function(){
		// Is this a friendly bullet?
		if (this.friendly) {
			for (var enemy in Enemies.enemies) {
				if (Enemies.enemies[enemy].alive && !this.kill) {
					var hit = false;
					for (var i = 0; i < this.hitAccuracy; i++) {
						if (this.x + (this.vx * (i / this.hitAccuracy)) <= Enemies.enemies[enemy].x + (Enemies.enemies[enemy].radius) &&
							this.x + (this.vx * (i / this.hitAccuracy)) >= Enemies.enemies[enemy].x - (Enemies.enemies[enemy].radius) &&
							this.y + (this.vy * (i / this.hitAccuracy)) <= Enemies.enemies[enemy].y + (Enemies.enemies[enemy].radius) &&
							this.y + (this.vy * (i / this.hitAccuracy)) >= Enemies.enemies[enemy].y - (Enemies.enemies[enemy].radius))
						{
							hit = true;
						}
					}
					if (hit) {
						if (!this.passThrough) {
							this.kill = true;
						}
						// console.log ("HIT");
						Enemies.enemies[enemy].takeDamage(this.damage);
						// Avoid sound bug where bulets go through all enemies and play hit sound many times over
						if (this.damage >= Player.damage) {
							Sound.play("damage");
						}
						Player.gainHP(Player.lifeSteal * this.damage);
						if (Player.lifeSteal > 0) {
							FX.createParticles(Enemies.enemies[enemy].x, Enemies.enemies[enemy].y, Math.min(Math.ceil(Player.lifeSteal * this.damage), 10), Enemies.enemies[enemy].colour);
						}

						this.damage = Math.round(0.5 * this.damage);
					}
				}
			}
		} else {
			// Hurt the player
			for (var j = 0; j < this.hitAccuracy; j++) {
				// if (this.x + (this.vx * (j / this.hitAccuracy)) <= Player.x + (Player.radius) &&
				// 	this.x + (this.vx * (j / this.hitAccuracy)) >= Player.x - (Player.radius) &&
				// 	this.y + (this.vy * (j / this.hitAccuracy)) <= Player.y + (Player.radius) &&
				// 	this.y + (this.vy * (j / this.hitAccuracy)) >= Player.y - (Player.radius))
				if (this.x + (this.vx * (j / this.hitAccuracy)) <= Player.x + (37) && // Player.raduis == 37
					this.x + (this.vx * (j / this.hitAccuracy)) >= Player.x - (37) &&
					this.y + (this.vy * (j / this.hitAccuracy)) <= Player.y + (37) &&
					this.y + (this.vy * (j / this.hitAccuracy)) >= Player.y - (37))
				{
					// Do the propper collision checking in here
					if (Player.collidingPoint(this.x + (this.vx * (j / this.hitAccuracy)), this.y + (this.vy * (j / this.hitAccuracy)))) {
						// Hit the player 
						Player.takeDamage(this.damage);
						this.kill = true;
						break;
					}
				}
			}
		}
	},
	remove: function(){
		// Remove this bullet when outside the room - Need to do some splash anim later
		if (this.x < 0 || this.x > Game.canvasWidth) { // Check the x-axis
			this.kill = true;
			// this.vx *= -1;
		} else if (this.y < 0 || this.y > Game.canvasHeight) { // Check the y-axis
			this.kill = true;
			// this.vy *= -1;
		}
	},
	draw: function(ctx){
		ctx.strokeStyle = this.colour;
		ctx.lineWidth = 2;

		ctx.beginPath();
		
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x + this.vx, this.y + this.vy);

		ctx.stroke();
	}
};

// Bullet manager
var Bullets = {
	// Properties
	bullets: [],
	totalBullets: 0,
	bulletSpray: 5,
	bulletsPerShot: 1,

	speed: 20,
	// Methods
	fireBullet: function(x, y, angle, damage, bulletSpeed, notFriendly){
		this.speed = bulletSpeed || 20;

		if (typeof notFriendly === "undefined" || !notFriendly) {
			for (var i = 0; i < Player.bulletsPerShot; i++) {
				this.bullets.push(new Bullet(x, y, angle + random(-Player.bulletSpray, Player.bulletSpray), damage, notFriendly));
				// Testing the bullet spray 
				// this.bullets.push(new Bullet(x, y, angle + Player.bulletSpray, damage, notFriendly));
				// this.bullets.push(new Bullet(x, y, angle - Player.bulletSpray, damage, notFriendly));
				this.totalBullets++;
			}
		} else {
			for (var j = 0; j < this.bulletsPerShot; j++) {
				this.bullets.push(new Bullet(x, y, angle + random(-this.bulletSpray, this.bulletSpray), damage, notFriendly));
			}
		}
	},
	update: function(){
		this.clean();

		for (var i = 0; i < this.bullets.length; i++) {
			this.bullets[i].move();
			this.bullets[i].hit();
		}
	},
	draw: function(ctx){
		for (var i = 0; i < this.bullets.length; i++) {
			this.bullets[i].draw(ctx);
		}
	},
	clean: function(){
		for (var i = this.bullets.length - 1; i >= 0; i--) {
			if (this.bullets[i].kill) {
				// Remove this bullet
				this.bullets.splice(i, 1);
			}
		}
	},
	clear: function(){
		this.bullets = [];
	}
};