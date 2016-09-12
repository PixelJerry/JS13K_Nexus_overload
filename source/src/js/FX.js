/**
 * FX.js
 */

var FX = {
	// Properties
	particles: [],

	// Methods
	createParticles: function(x, y, count, colour) {
		for (var i = 0; i < count; i++) {
			this.particles.push(new Particle(x, y, colour));

			this.particles[this.particles.length - 1].speed += randomInt(-3, 3);
		}
	},
	update: function() {
		for (var i = this.particles.length; i >= 0; i--) {
			if (typeof this.particles[i] !== "undefined") {
				if (this.particles[i].kill) {
					this.particles.splice(i, 1);
				} else {
					this.particles[i].moveToPlayer();
				}
			}
		}
	},
	draw: function(ctx) {
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].draw(ctx);
		}
	},
	clear: function(){
		this.particles = [];
	}
};

function Particle(x, y, colour){
	this.x = x;
	this.y = y;
	this.kill = false;

	this.angle = 0;
	this.radius = randomInt(1,5);
	this.speed = 15;

	this.colour = colour;
}

Particle.prototype = {
	moveToPlayer: function(){
		if ((this.x > Player.x - 15 && this.x < Player.x + 15) &&
			(this.y > Player.y - 15 && this.y < Player.y + 15)){
			this.kill = true;
		} else {
			this.angle = angleBetween(new Point(this.x, this.y), new Point(Player.x, Player.y));

			this.x += Math.cos(degToRad(this.angle)) * this.speed;
			this.y += Math.sin(degToRad(this.angle)) * this.speed;
		}
	},
	draw: function(ctx) {
		ctx.fillStyle = this.colour;
		ctx.fillRect(this.x - (this.radius / 2), this.y - (this.radius / 2), this.radius, this.radius);
	}
};
