"use strict";

/* global GEO, GDS */



GDS.Element = function (jsonMap) {
  this.hash = jsonMap;
};


GDS.Element.prototype.toString = function () {
  return "Element";
};


GDS.Element.prototype.dataExtent = function () {
  for (var coord of this.vertices()) {
    var minX = Math.min(coord[0], minX || Number.MAX_VALUE);
    var maxX = Math.max(coord[0], maxX || Number.MIN_VALUE);
    var minY = Math.min(coord[1], minY || Number.MAX_VALUE);
    var maxY = Math.max(coord[1], maxY || Number.MIN_VALUE);
  }
  return GEO.MakeRect(minX, minY,
          Math.abs(maxX - minX), Math.abs(maxY - minY));

};


GDS.Element.prototype._lookupVertices = function () {
  let values = this.hash.map.XY;
  let result = [];
  for (let i = 0; i < values.length / 2; i++) {
    let x = values[i * 2 + 0] * 0.001;
    let y = values[i * 2 + 1] * 0.001;
    result.push([x, y]);
  }
  return result;
};


GDS.Element.prototype.vertices = function () {
  if (! this._vertices) {
    this._vertices = this._lookupVertices();
  }
  return this._vertices;
};


GDS.Element.fromObject = function (hash) {
  if (hash.type === "point") {
    return new GDS.Point(hash);
  }
  if (hash.type === "path") {
    return new GDS.Segment(hash);
  }
  if (hash.type === "boxtext") {
    return new GDS.BoxText(hash);
  }
  if (hash.type === "boundary") {
    return new GDS.Boundary(hash);
  }
  return null;
};

GDS.Element.fromObject2 = function (hash) {
  if (hash.type === 9) { // PATH
    return new GDS.Path(hash);
  }
  if (hash.type === 12) { // TEXT
    return new GDS.Text(hash);
  }
  if (hash.type === 8) { // BOUNDARY
    return new GDS.Boundary(hash);
  }
  return null;
};


GDS.Point = function (hash) {
   GDS.Element.call(this, hash);
};

GDS.Point.prototype = Object.create(GDS.Element.prototype);
GDS.Point.prototype.constructor = GDS.Segment;



GDS.Point.prototype.toString = function () {
  return "Point(" + this.vertices()[0] + ")";
};


GDS.Point.prototype.dataExtent = function () {
  return GEO.MakeRect(this.vertices()[0][0], this.vertices()[0][1]);
};




GDS.Path = function (hash) {
  GDS.Element.call(this, hash);
};

GDS.Path.prototype = Object.create(GDS.Element.prototype);
GDS.Path.prototype.constructor = GDS.Path;


GDS.Path.prototype.toString = function () {
  return "Path(" + this.start + " - " + this.end + ")";
};


GDS.Path.prototype.dataExtent = function () {
  for (var coord of this.vertices()) {
    var minX = Math.min(coord[0], minX || Number.MAX_VALUE);
    var maxX = Math.max(coord[0], maxX || Number.MIN_VALUE);
    var minY = Math.min(coord[1], minY || Number.MAX_VALUE);
    var maxY = Math.max(coord[1], maxY || Number.MIN_VALUE);
  }
  return GEO.MakeRect(minX, minY,
          Math.abs(maxX - minX), Math.abs(maxY - minY));

};


GDS.Boundary = function (hash) {
  GDS.Element.call(this, hash); 
};


GDS.Boundary.prototype = Object.create(GDS.Element.prototype);
GDS.Boundary.prototype.constructor = GDS.Boundary;


GDS.Boundary.prototype.dataExtent = function () {
  for (var coord of this.vertices()) {
    var minX = Math.min(coord[0], minX || Number.MAX_VALUE);
    var maxX = Math.max(coord[0], maxX || Number.MIN_VALUE);
    var minY = Math.min(coord[1], minY || Number.MAX_VALUE);
    var maxY = Math.max(coord[1], maxY || Number.MIN_VALUE);
  }
  return GEO.MakeRect(minX, minY,
          Math.abs(maxX - minX), Math.abs(maxY - minY));

};



GDS.Text = function (hash) {
  GDS.Element.call(this, hash); 
};


GDS.Text.prototype = Object.create(GDS.Element.prototype);
GDS.Text.prototype.constructor = GDS.BoxText;

