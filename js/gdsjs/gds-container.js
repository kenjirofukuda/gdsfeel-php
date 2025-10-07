"use strict";

/* global GEO, GDS */


GDS.Structure = function () {
  this._elements = [];
};

GDS.Structure.prototype = {
  constructor: GDS.Structure
};

GDS.Structure.prototype.addElement = function (e) {
  this._elements.push(e);
};

GDS.Structure.prototype.elements = function () {
  return this._elements;
};

GDS.Structure.prototype.dataExtent = function () {
  if (this.elements().length === 0) {
    return GEO.MakeRect(0, 0, 0, 0);
  }
  var points = [];
  this.elements().forEach(function (e) {
    var r = e.dataExtent();
    r.pointArray().forEach(function (p) {
      points.push(p);
    });
  });
  var ext = GEO.calcExtentBounds(points);
  return ext;
};
