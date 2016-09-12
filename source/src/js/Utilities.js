/**
 * Utilities.js
 */

var requestAnimation = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
var AudioContext = window.AudioContext || window.webkitAudioContext;
/**
 * Create a new Point
 * @class Point
 * @param {number} [pX = 0] - The point's x coordinate
 * @param {number} [pY = 0] - The point's y coordinate
 */

var Point = function(pX, pY)
{
    this.x = pX || null;
    this.y = pY || null;
};

Point.prototype = {
    distance: function(otherPoint) {
        return (Math.sqrt(Math.pow((this.x - otherPoint.x), 2) + Math.pow((this.y - otherPoint.y), 2)));
    }
};

function angleBetween(pointA, pointB) {
	return Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180 / Math.PI;
}

function degToRad(angle) {
	return angle / 180 * Math.PI;
}

function randomInt(min, max) {
    // Rounding does not give random results
    // Tested with testRandom function below (50 000 000) samples
	return Math.floor(random(min, max + 0.99999));
}

function random(min, max) {
	return min + ((max - min) * Math.random());
}

/*
URL to post: http://compsci.ca/v3/viewtopic.php?t=6034

If A=(x1,y1) B=(x2,y2), C=(x3,y3) 
Area= abs(x1*y2+x2*y3+x3*y1-x1*y3-x3*y2-x2*y1)/2 

You might want to be careful about floating point errors... instead of checking for strict inequality, check for abs(b-a)<eps, where eps can be a small value, such as 1e-12 (0.000000000001)

IE - This is not 100% accurate, but will work for the game
*/
function getAreaOfTriangle(pointA, pointB, pointC){
	// Calc area then multiply by 100 and thorwaway the cecimal places by rounding then devide by 100 to get an acuracy of 2 decimals
	return (Math.round((( Math.abs((pointA.x * pointB.y)+(pointB.x * pointC.y)+(pointC.x * pointA.y)-(pointA.x * pointC.y)-(pointC.x * pointB.y)-(pointB.x * pointA.y)) ) / 2) * 100)) / 100;
}

// function pointInRect(testPoint, rectLeft, rectTop, rectWidth, rectHeight) {
// 	if (testPoint.x <= rectLeft + rectWidth &&
// 		testPoint.x >= rectLeft - rectWidth &&
// 		testPoint.y <= rectTop + rectHeight &&
// 		testPoint.y >= rectTop - rectHeight) {
// 		return true;
// 	}
// 	return false;
// }

// function testRandom() {
//     var ERROR = 0;
//     var one = 0;
//     var two = 0;
//     var three = 0;

//     for (var i = 0; i < 50000000; i++) {
//         var test = randomInt(1,3);

//         if (test === 0) {
//             ERROR++;
//         } else if (test === 1) {
//             one++;
//         } else if (test === 2) {
//             two++;
//         } else if (test === 3) {
//             three++;
//         }
//     }

//     console.log ("ERRORS : " + ERROR);
//     console.log ("one : " + one);
//     console.log ("two : " + two);
//     console.log ("three : " + three);

// }