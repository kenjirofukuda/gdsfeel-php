"use strict";

/* global GEO, GDS */


GDS.Element = class {
  constructor(jsonMap) {
    this.hash = jsonMap;
  }

  get x() {
    return this.vertices()[0][0];
  }

  get y() {
    return this.vertices()[0][1];
  }

  vertices() {
    if (!this._vertices) {
      this._vertices = this._lookupVertices();
    }
    return this._vertices;
  }
  
  dataExtent() {
    if (!this._dataExtent) {
      this._dataExtent = this._lookupDataExtent();
    }
    return this._dataExtent;
  }

  toString() {
    return 'Element';
  }

  _lookupDataExtent() {
    return GEO.calcExtentBounds(this.vertices());
  }

  _lookupVertices() {
    let values = this.hash.map.XY;
    let result = [];
    for (let i = 0; i < values.length / 2; i++) {
      let x = values[i * 2 + 0] * 0.001;
      let y = values[i * 2 + 1] * 0.001;
      result.push([x, y]);
    }
    return result;
  }

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
  if (hash.type === 10) { // SREF
    return new GDS.Sref(hash);
  }
  if (hash.type === 11) { // AREF
    return new GDS.Aref(hash);
  }
  return null;
};


GDS.Sref = class extends GDS.Element {
  constructor(hash) {
    super(hash);
  }
};

GDS.Aref = class extends GDS.Sref {
  constructor(hash) {
    super(hash);
  }
};


GDS.Path = class extends GDS.Element {
};


GDS.Boundary = class extends GDS.Element {
};


GDS.Text = class extends GDS.Element {
};


GDS.Point = class extends GDS.Element {

  constructor(hash) {
    super(hash);
  }

  toString () {
    return "Point(" + this.vertices()[0] + ")";
  }
  
  _lookupDataExtent() {
    return GEO.MakeRect(this.x, this.y);
  }
};

