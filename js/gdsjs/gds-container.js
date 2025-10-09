"use strict";

/* global GEO, GDS */


GDS.Structure = class {
  constructor() {
    this._elements = [];
  }

  addElement(e) {
    this._elements.push(e);
  };

  elements() {
    return this._elements;
  }

  dataExtent () {
    if (! this._dataExtent) {
      this._dataExtent = this._lookupDataExtent();
    }
    return this._dataExtent;
  }
  
  _lookupDataExtent() {
    if (this.elements().length === 0) {
      return GEO.MakeRect(0, 0, 0, 0);
    }
    let points = [];
    this.elements().forEach(function (e) {
      var r = e.dataExtent();
      r.pointArray().forEach(function (p) {
        points.push(p);
      });
    });
    return GEO.calcExtentBounds(points);
  }
};
