"use strict"

var WIDTH = 800;
var HEIGHT = 600;
var VERTEX_COUNT = 6;

var CENTER = 100;
var RADIUS = 50;

var DISTANCE = 600;
var SCALE = 1;
var OFFSET_X = 300;
var OFFSET_Y = 300;


var COORDS_MODE = false;

var VX = 300;
var VY = 300;
var VZ = 300;

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
		
		var startAngle = 30;
		
		z = z || 0;
		
		for (var i = 0; i < vertexCount; i++) {
			var angle = 360 / vertexCount * i;

			polygon[i] = new Point(); 
			polygon[i].x = center.x + Math.round((Math.cos(degToRad(angle + startAngle)) * radius));
			polygon[i].y = center.y - Math.round((Math.sin(degToRad(angle + startAngle)) * radius));
			polygon[i].z = z;
		}
	}
	
	var BASE_Z = 200;
	var TOP_Z = 0;
	
	this.vertexCount = vertexCount;
	this.center = center;
	this.radius = radius;
	this.basePolygon = new Array(vertexCount);
	this.topPolygon = new Array(vertexCount);
	
	this.frontSideFacets = new Array(vertexCount);
	this.frontBaseFacets = new Array(2);
	
	setPoints(this.basePolygon, radius, vertexCount, BASE_Z);
	setPoints(this.topPolygon, radius, vertexCount, TOP_Z);
	
	
	this.update = function () {
		function getNormalVector(p1, p2, p3) {
			var a, b, c;
			var REDUCTION_RATE = 100;
			
			a = p1.y * (p2.z - p3.z) + p2.y * (p3.z - p1.z) + p3.y * (p1.z - p2.z);
			b = p1.z * (p2.x - p3.x) + p2.z * (p3.x - p1.x) + p3.z * (p1.x - p2.x);
			c = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y);  
			
			a /= REDUCTION_RATE;
			b /= REDUCTION_RATE;
			c /= REDUCTION_RATE;

			return new Point(a, b, c);
		}
		
		function getVector(startPoint, endPoint) {
			return new Point(endPoint.x - startPoint.x, endPoint.y - startPoint.y, 
				endPoint.z - startPoint.z);
		}
		
		function getScalarMultiplication(p1, p2) {
			return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
		}
		
		function getCenterPoint(p1, p2) {
			return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
		}
		
		
		var SM_RATE = 0;
		
		if (!COORDS_MODE)
			pointOfObservation = new Point(RO * Math.sin(degToRad(FI)) * Math.cos(degToRad(OMEGA)),
				RO * Math.sin(degToRad(FI)) * Math.sin(degToRad(OMEGA)),
				RO * Math.cos(degToRad(FI))); 
			else
			pointOfObservation = new Point(VX, VY, VZ);	
				
		
		
		for (var i = 0; i < vertexCount; i++) {
			var normalVector = getNormalVector(this.basePolygon[i],
				this.basePolygon[(i + 1) % this.vertexCount], this.topPolygon[i]);
				
				
			var facetCenter = getCenterPoint(this.basePolygon[(i + 1) % this.vertexCount], this.topPolygon[i]);
				
			var viewVector = getVector(pointOfObservation, facetCenter);
				
			if (getScalarMultiplication(normalVector, viewVector) < SM_RATE)
				this.frontSideFacets[i] = true;
			else
				this.frontSideFacets[i] = false;
		}
		
		normalVector = getNormalVector(this.basePolygon[0], this.basePolygon[1], this.basePolygon[2]);
		facetCenter = center;
		facetCenter.z = BASE_Z;
		viewVector = getVector(pointOfObservation, facetCenter);
		var viewVector = getVector(pointOfObservation, facetCenter);
		
		if (getScalarMultiplication(normalVector, viewVector) < SM_RATE)
				this.frontBaseFacets[0] = true;
			else
				this.frontBaseFacets[0] = false;
			
			
		normalVector = getNormalVector(this.topPolygon[0], this.topPolygon[1], this.topPolygon[2]);
		normalVector.z *= -1;
		
		facetCenter = center;
		facetCenter.z = TOP_Z;
		viewVector = getVector(pointOfObservation, facetCenter);
		var viewVector = getVector(pointOfObservation, facetCenter);
		
		
		if (getScalarMultiplication(normalVector, viewVector) < SM_RATE)
				this.frontBaseFacets[1] = true;
			else
				this.frontBaseFacets[1] = false;

	}
	
	
	this.draw = function () {
		
		var curPoint, nextPoint;
		
		for (var i = 0; i < vertexCount; i++) {
			
			curPoint = getScreenPoint(this.topPolygon[i]);
			nextPoint = getScreenPoint(this.topPolygon[(i + 1) % vertexCount]);
			
			if (!this.frontBaseFacets[0] && !this.frontSideFacets[i])
				drawDashedLine(curPoint, nextPoint);
			else
				drawLine(curPoint, nextPoint);
			
			curPoint = getScreenPoint(this.basePolygon[i]);
			nextPoint = getScreenPoint(this.basePolygon[(i + 1) % vertexCount]);
			
			if (!this.frontBaseFacets[1] && !this.frontSideFacets[i])
				drawDashedLine(curPoint, nextPoint);
			else
				drawLine(curPoint, nextPoint);
			
			nextPoint = getScreenPoint(this.topPolygon[i]);
			
			
			var j = (i == 0) ? vertexCount - 1 : i - 1;
			if (!this.frontSideFacets[i] && !this.frontSideFacets[j])
				drawDashedLine(curPoint, nextPoint);
			else
				drawLine(curPoint, nextPoint);
				
		}
		
		
	}
}

function drawLine(p1, p2) {
	ctx.setLineDash([1, 0]);
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
}

function drawDashedLine(p1, p2) {
	ctx.setLineDash([5, 15]);
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
}



function getViewportPoint(worldPoint) {
	
	var a;
	var b;
	var c;
	var d;
	var ro;
	
	if (COORDS_MODE) {
		
		var hyp = Math.sqrt(Math.pow(VX, 2) + Math.pow(VY, 2));
		c = VX / hyp;
		d = VY / hyp;
		ro = Math.sqrt(Math.pow(VZ, 2) + Math.pow(hyp, 2));
		a = VZ / ro;
		b = hyp / ro;
		
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
	var viewportMatrix = [[-d, -a*c, -b*c, 0], [c, -a*d, -b*d, 0], [0, b, -a, 0], [0, 0, ro, 1]];
	
	var resultMatrix = new Array(4);
	
	for (var i = 0; i < 4; i++) {
		resultMatrix[i] = 0;
		for (var j = 0; j < 4; j++) 
			resultMatrix[i] += worldMatrix[j] * viewportMatrix[j][i];
	}
	
	return new Point(resultMatrix[0], resultMatrix[1], resultMatrix[2]);
	
}

function getScreenPoint(worldPoint) {
	var vpPoint = getViewportPoint(worldPoint);
	//return new Point(vpPoint.x * SCALE + OFFSET_X, vpPoint.y * SCALE + OFFSET_Y);
	
	return new Point(DISTANCE * vpPoint.x * SCALE / vpPoint.z + OFFSET_X, -DISTANCE * vpPoint.y * SCALE / vpPoint.z + OFFSET_Y);
}


function init() {
	prism = new Prism(new Point(CENTER, CENTER), RADIUS, VERTEX_COUNT);
	
	
	
	draw();
}

function clearScreen() {
	ctx.fillStyle  = "white";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
}


function draw() {
	clearScreen();
	prism.draw();
	
}

var up = true;
var step = 0;

function update() {
	prism.update();


	step = (step + 0.01) % (2 * Math.PI);
	var percent = Math.sin(step);
	OMEGA = percent * radToDeg(Math.PI / 2);

	
	/*
 	step = (step + 0.05) % (Math.PI);
	var percent = Math.sin(step);
	RO = percent * 300 + 400; */

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
