/* global createjs */

"use strict";

var GEO = {};


GEO.Viewport = function (width, height) {
  this.width = width;
  this.height = height;
  this.scale = 1.0;
  this.centerX = 0.0;
  this.centerY = 0.0;
  this._resetPortCenter();
  this.portCenterY = height / 2.0;
  this._transform = null;
  this._invertTransform = null;
  this._basicTransform = null;
  this.transformStack = new Array();
  this.portDamageFunction = null;
};

GEO.Viewport.prototype = {
  constructor: GEO.Viewport
};
//  deviceCenter = function () {
//    return new GEO.Point(this.width / 2.0, this.height / 2.0);
//  };

GEO.Viewport.prototype.wheelZoom = function (h, v, x, y, direction) {
  this.portCenterX = h;
  this.portCenterY = this.height - v;
  this.centerX = x;
  this.centerY = y;
  this.scale = this.scale * (1.0 + (0.125 * direction));
  this._damageTransform();
};

GEO.Viewport.prototype.zoomDouble = function () {
  this.setScale(this.scale * 2.0);
};

GEO.Viewport.prototype.zoomHalf = function () {
  this.setScale(this.scale * 0.5);
};

GEO.Viewport.prototype.setScale = function (scale) {
  this.scale = scale;
  this._damageTransform();
};

GEO.Viewport.prototype.setCenter = function (x, y) {
  this.centerX = x;
  this.centerY = y;
  this._damageTransform();
};

GEO.Viewport.prototype.setSize = function (width, height) {
  this.width = width;
  this.height = height;
  this._damageTransform();
};

GEO.Viewport.prototype.reset = function () {
  this.scale = 1.0;
  this.centerX = 0;
  this.centerY = 0;
  this._damageTransform();
};

GEO.Viewport.prototype.transform = function () {
  if (this._transform === null) {
    this._transform = this._lookupTransform();
  }
  return this._transform;
};

GEO.Viewport.prototype.invertTransform = function () {
  if (this._invertTransform === null) {
    this._invertTransform = this.transform().clone().invert();
  }
  return this._invertTransform;
};

GEO.Viewport.prototype.deviceToWorld = function (h, v) {
  var result = GEO.MakePoint();
  return this.invertTransform().transformPoint(h, v, result);
};

GEO.Viewport.prototype.worldToDevice = function (x, y) {
  var result = GEO.MakePoint();
  return this.transform().transformPoint(x, y);
};

GEO.Viewport.prototype.pushTransform = function (transform) {
  this.transformStack.push(transform);
  this._damageTransform();
};

GEO.Viewport.prototype.popTransform = function () {
  if (this.transformStack.length === 0) {
    return null;
  }
  var result = this.transformStack.pop();
  this._damageTransform();
  return result;
};

GEO.Viewport.prototype._lookupTransform = function () {
  var newTransform = new createjs.Matrix2D();
  newTransform.prependMatrix(this.basicTransform());
  this.transformStack.map(function (item) {
    newTransform.prependMatrix(item);
  });
  return newTransform;
};

GEO.Viewport.prototype.basicTransform = function () {
  if (this._basicTransform === null) {
    this._basicTransform = this._lookupBasicTransform();
  }
  return this._basicTransform;
};

GEO.Viewport.prototype._lookupBasicTransform = function () {
  var tx = new createjs.Matrix2D();
  tx.translate(this.portCenterX, this.height - this.portCenterY);
  tx.scale(this.scale, -this.scale);
  tx.translate(-this.centerX, -this.centerY);
  return tx;
};

GEO.Viewport.prototype._fittingRatio = function (width, height) {
  var margin = 20;
  var xRatio = (this.width - margin) / width;
  var yRatio = (this.height - margin) / height;
  return Math.min(xRatio, yRatio);
};

GEO.Viewport.prototype.setRectangle = function (r) {
  this._resetPortCenter();
  var center = r.center();
  this.setCenter(center.x, center.y);
  this.setScale(this._fittingRatio(r.width, r.height));
};

GEO.Viewport.prototype._resetPortCenter = function () {
  this.portCenterX = this.width / 2.0;
  this.portCenterY = this.height / 2.0;
};

GEO.Viewport.prototype._damageTransform = function () {
  this._basicTransform = null;
  this._transform = null;
  this._invertTransform = null;
  if (this.portDamageFunction !== null) {
    var self = this;
    this.portDamageFunction(self);
  }

};

GEO.calcExtentBounds = function (points) {
  var BIG_VALUE = Math.pow(2, 32);
  var minX = BIG_VALUE;
  var maxX = -minX;
  var minY = BIG_VALUE;
  var maxY = -minY;

  points.forEach(function (p) {
    minX = Math.min(p.x, minX);
    maxX = Math.max(p.x, maxX);
    minY = Math.min(p.y, minY);
    maxY = Math.max(p.y, maxY);
  });
  return GEO.MakeRect(
          minX, minY, Math.abs(maxX - minX), Math.abs(maxY - minY));
};


GEO.MakeRect = function (x, y, width, height) {
  return new createjs.Rectangle(x, y, width, height);

};

GEO.MakePoint = function (x, y) {
  return new createjs.Point(x, y);
};

createjs.Point.prototype.equals = function (other) {
  return this.x == other.x && this.y == other.y;
};


createjs.Point.prototype.minus = function (other) {
  return new createjs.Point(this.x - other.x, this.y - other.y);
};


createjs.Rectangle.prototype.center = function () {
  return new createjs.Point(
          this.x + this.width / 2.0,
          this.y + this.height / 2.0);
};

createjs.Rectangle.prototype.pointArray = function () {
  var points = [];
  points.push(new createjs.Point(this.x, this.y));
  points.push(new createjs.Point(this.x, this.y + this.height));
  points.push(new createjs.Point(this.x + this.width, this.y + this.height));
  points.push(new createjs.Point(this.x + this.width, this.y));
  return points;
};


function floatConvertSyncer(num, dig) {
  var p = Math.pow(10, dig);
  return Math.round(num * p) / p;
}

Number.prototype.roundDigits = function (dig) {
  return floatConvertSyncer(this, dig);
};
