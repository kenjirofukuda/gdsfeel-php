"use strict";
/* global GDS, GEO */


GDS.strokeSlantCross = function (ctx, port, x, y) {
  const unit = 3;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineWidth = 1;
  const devicePoint = port.worldToDevice(x, y);
  devicePoint.x = Math.round(devicePoint.x) + 0.5;
  devicePoint.y = Math.round(devicePoint.y) + 0.5;
  ctx.beginPath();
  ctx.moveTo(devicePoint.x - unit, devicePoint.y - unit);
  ctx.lineTo(devicePoint.x + unit, devicePoint.y + unit);
  ctx.moveTo(devicePoint.x - unit, devicePoint.y + unit);
  ctx.lineTo(devicePoint.x + unit, devicePoint.y - unit);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

GDS.Element.prototype.drawOn = function (ctx, port) {

};


GDS.Text.prototype.drawOn = function (ctx, port) {
  ctx.font = "bold 16px Arial";
  ctx.strokeText(this.hash.map['STRING'], this.x, this.y);
};


GDS.Boundary.prototype.drawOn = function (ctx, port) {
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  for (var ce of this.vertices().slice(1)) {
    ctx.lineTo(ce[0], ce[1]);
  }
  ctx.closePath();
  ctx.stroke();
};


GDS.Path.prototype.drawOn = function (ctx, port) {
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  for (var ce of this.vertices().slice(1)) {
    ctx.lineTo(ce[0], ce[1]);
  }
  ctx.stroke();
};

GDS.Sref.prototype.drawOn = function (ctx, port) {
  ctx.strokeStyle = "blue";
  GDS.strokeSlantCross(ctx, port, this.x, this.y);
};

GDS.Aref.prototype.drawOn = function (ctx, port) {
  ctx.strokeStyle = "red";
  GDS.strokeSlantCross(ctx, port, this.x, this.y);
};

GDS.Point.prototype.drawOn = function (ctx, port) {
  var unit = 3;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineWidth = 1;
  var devicePoint = port.worldToDevice(this.vertices()[0][0], this.vertices()[0][1]);
  devicePoint.x = Math.round(devicePoint.x) + 0.5;
  devicePoint.y = Math.round(devicePoint.y) + 0.5;
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.moveTo(devicePoint.x - unit, devicePoint.y - unit);
  ctx.lineTo(devicePoint.x + unit, devicePoint.y + unit);
  ctx.moveTo(devicePoint.x - unit, devicePoint.y + unit);
  ctx.lineTo(devicePoint.x + unit, devicePoint.y - unit);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};


GDS.Tracking = function (view) {
  this.view = view;
  this.element = view.context().canvas;
  this.down = false;
  this.registerHandler();
  this.registerWheel();
};


GDS.Tracking.prototype.registerWheel = function () {
  var self = this;
  var mousewheelevent = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
  $(this.view.portId).on(mousewheelevent, function (e) {
    e.preventDefault();
    var delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
    console.log(e);
    var p = GEO.MakePoint(e.originalEvent.offsetX, e.originalEvent.offsetY);
    var dir = delta < 0 ? -1.0 : 1.0;
    var center = self.view.port.deviceToWorld(p.x, p.y);
    self.view.port.wheelZoom(p.x, p.y, center.x, center.y, dir);
  });
};


GDS.Tracking.prototype.registerHandler = function () {
  var self = this;
  this.element.addEventListener("mousedown", function (evt) {
    self.down = true;
    self.points = [];
    self.downPoint = GEO.MakePoint(evt.offsetX, evt.offsetY);
    console.log(["d", self.downPoint + ""]);
  });
  this.element.addEventListener("mousemove", function (evt) {
    if (!self.down) {
      return;
    }
    var p = GEO.MakePoint(evt.offsetX, evt.offsetY);
    if (self.downPoint.equals(p)) {
      return;
    }
    self.currPoint = p;
    self.points.push(p);
    console.log(self);
    if (self.points.length === 1) {
      $(self.view.portId).css("cursor", "all-scroll");
    }
    if (self.points.length > 2) {
      var p1 = self.points[self.points.length - 2];
      var p2 = self.points[self.points.length - 1];
      var wp1 = self.view.port.deviceToWorld(p1.x, p1.y);
      var wp2 = self.view.port.deviceToWorld(p2.x, p2.y);
      var moved = wp2.minus(wp1);
      self.view.port.setCenter(self.view.port.centerX - moved.x, self.view.port.centerY - moved.y);
    }
    console.log(["m", self.currPoint + ""]);
  });
  this.element.addEventListener("mouseup", function (evt) {
    self.down = false;
    self.upPoint = GEO.MakePoint(evt.offsetX, evt.offsetY);
    $(self.view.portId).css("cursor", "default");
    console.log(["u", self.upPoint + ""]);
  });
};


GDS.StructureView = function (portId, structure) {
  var self = this;
  this.portId = portId;
  this._structure = structure;
  this.ctx = this.context();
  this.port = new GEO.Viewport(this.ctx.canvas.width, this.ctx.canvas.height);
  this.tack = new GDS.Tracking(self);
  var self = this;
  this.port.portDamageFunction = function (port) {
    self.redraw(port);
  };
};


GDS.StructureView.prototype.context = function () {
  var canvas = document.getElementById(this.portId);
  var ctx = canvas.getContext("2d");
  return ctx;
};


GDS.StructureView.prototype.addMouseMoveListener = function (proc) {
  this.context().canvas.addEventListener("mousemove", proc);
};


GDS.StructureView.prototype.redraw = function (port) {
  var ctx = this.context();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "lightGray";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  var mat = port.transform();
  if (this._structure === null) {
    return;
  }
  ctx.setTransform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
  ctx.lineWidth = 1 / port.scale;
  this._structure.elements().forEach(function (e) {
    ctx.strokeStyle = "black";
    e.drawOn(ctx, port);
  });
};


GDS.StructureView.prototype.fit = function () {
  if (this._structure.elements().length === 0) {
    this.port.reset();
    return;
  }
  var ext = this._structure.dataExtent();
  if (ext.width === 0 && ext.height === 0) {
    this.port.setCenter(ext);
  } else {
    this.port.setRectangle(ext);
  }
};


GDS.StructureView.prototype.zoomDouble = function () {
  this.port.zoomDouble();
};


GDS.StructureView.prototype.zoomHalf = function () {
  this.port.zoomHalf();
};
