"use strict"

var WIDTH = 800;
var HEIGHT = 600;
var VERTEX_COUNT = 4;

var BASE_Z = 50;
var TOP_Z = 10;

var CENTER = 250;
var RADIUS = 150;

var DISTANCE = 50;
var SCALE = 400;
var OFFSET_X = 600;
var OFFSET_Y = 540;


var COORDS_MODE = true;

var VX = 250;
var VY = 250;
var VZ = 250;

var FI = 45;
var OMEGA = 45;
var RO = 700;

var prism;
var pointOfObservation;


function Point(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

function degToRad(angle) {
	return angle * Math.PI / 180;
}

function radToDeg(angle) {
	return angle * 180 / Math.PI;
}


function Prism(center, radius, vertexCount) {
	
	function setPoints(polygon, radius, vertexCount, z) {
		
		var startAngle = 0;
		
		z = z || 0;
		
		for (var i = 0; i < vertexCount; i++) {
			var angle = 360 / vertexCount * i;

			polygon[i] = new Point(); 
			polygon[i].x = center.x + Math.round((Math.cos(degToRad(angle + startAngle)) * radius));
			polygon[i].y = center.y - Math.round((Math.sin(degToRad(angle + startAngle)) * radius));
			polygon[i].z = z;
		}
	}
		
	this.center = center;
	this.radius = radius;
	this.basePolygon = new Array(vertexCount);
	this.topPolygon = new Array(vertexCount);
	
	setPoints(this.basePolygon, radius, vertexCount, BASE_Z);
	setPoints(this.topPolygon, radius, vertexCount, TOP_Z);
	
	this.draw = function () {
	
		ctx.beginPath();
		
		var nextPoint = getScreenPoint(this.topPolygon[0]);
		ctx.moveTo(nextPoint.x, nextPoint.y);
		for (var i = 1; i < vertexCount + 1; i++) {
			nextPoint = getScreenPoint(this.topPolygon[i % vertexCount]);
			ctx.lineTo(nextPoint.x, nextPoint.y);
			
		}
		
		nextPoint = getScreenPoint(this.basePolygon[0]);
		ctx.moveTo(nextPoint.x, nextPoint.y);

		for (var i = 1; i < vertexCount + 1; i++) {

			nextPoint = getScreenPoint(this.basePolygon[i % vertexCount]);
			ctx.lineTo(nextPoint.x, nextPoint.y);
		}
		
		var topPoint;
		for (var i = 0; i < vertexCount; i++) {
			nextPoint = getScreenPoint(this.basePolygon[i]);
			topPoint = getScreenPoint(this.topPolygon[i]);
			
			ctx.moveTo(nextPoint.x, nextPoint.y);
			ctx.lineTo(topPoint.x, topPoint.y);
		}
		
		ctx.closePath();
	}
}

function getViewportPoint(worldPoint) {
	
	var a;
	var b;
	var c;
	var d;
	var ro;
	
	if (COORDS_MODE) {
		
		var hyp = Math.sqrt(Math.pow(VX, 2) + Math.pow(VY, 2));
		a = VX / hyp;
		b = VY / hyp;
		ro = Math.sqrt(Math.pow(VZ, 2) + Math.pow(hyp, 2));
		c = VZ / ro;
		d = hyp / ro;
		
	} else {
		
		a = Math.cos(degToRad(FI));
		b = Math.sin(degToRad(FI));
		c = Math.cos(degToRad(OMEGA));
		d = Math.sin(degToRad(OMEGA));
		ro = RO;
	}
	
	//var fi = radToDeg(Math.asin(b));
	//var omega = radToDeg(Math.asin(d));

	
	var worldMatrix = [worldPoint.x, worldPoint.y, worldPoint.z, 1];
	var viewportMatrix = [[-d, -a*c, -b*d, 0], [c, -a*d, -b*d, 0], [0, b, -a, 0], [0, 0, ro, 1]];
	
	var resultMatrix = new Array(4);
	
	for (var i = 0; i < 4; i++) {
		resultMatrix[i] = 0;
		for (var j = 0; j < 4; j++) 
			resultMatrix[i] += worldMatrix[i] * viewportMatrix[j][i];
	}
	
	return new Point(resultMatrix[0], resultMatrix[1], resultMatrix[2]);
	
}

function getScreenPoint(worldPoint) {
	var vpPoint = getViewportPoint(worldPoint);
	
	//console.log((DISTANCE * vpPoint.x * SCALE / vpPoint.z) + " " + (DISTANCE * vpPoint.y * SCALE / vpPoint.z));
	
	return new Point(DISTANCE * vpPoint.x * SCALE / vpPoint.z + OFFSET_X, DISTANCE * vpPoint.y * SCALE / vpPoint.z + OFFSET_Y);
}



function init() {
	prism = new Prism(new Point(CENTER, CENTER), RADIUS, VERTEX_COUNT);
	pointOfObservation = new Point(VX, VY, VZ);
	
	draw();

	clearScreen();
}

function clearScreen() {
	ctx.fillStyle  = "white";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.stroke();
}


function draw() {
	clearScreen();
	prism.draw();
}


function update() {
	//FI = (FI+1) % (radToDeg(Math.PI * 2));
	//OMEGA = (OMEGA+1) % (radToDeg(Math.PI * 2));
 	VY--;
	VX--; 
}




var canvas = document.getElementById("canvas");
canvas.width = WIDTH;
canvas.height = HEIGHT;

var ctx = canvas.getContext("2d");

init();

 setInterval(function() {
	update();
	draw();
}, 40); 
