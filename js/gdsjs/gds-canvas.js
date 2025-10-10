"use strict";
/**
 * Browser only
 */
/* global GDS, GEO */

GDS.strokeSlantCross = function (ctx, port, x, y) {
  const unit = 3;
  const devicePoint = port.worldToDevice(x, y);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineWidth = 1.0;
  devicePoint.x = Math.round(devicePoint.x) /* + 0.5 */;
  devicePoint.y = Math.round(devicePoint.y) /* + 0.5 */;
  ctx.beginPath();
  ctx.moveTo(devicePoint.x - unit, devicePoint.y - unit);
  ctx.lineTo(devicePoint.x + unit, devicePoint.y + unit);
  ctx.moveTo(devicePoint.x - unit, devicePoint.y + unit);
  ctx.lineTo(devicePoint.x + unit, devicePoint.y - unit);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
};

GDS.strokePoints = function (ctx, port, points, closing = false) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let ce of points.slice(1)) {
    ctx.lineTo(ce[0], ce[1]);
  }
  if (closing) {
    ctx.closePath();
  }
  ctx.stroke();
}

GDS.Element.prototype.drawOn = function (ctx, port) {
  // subclass must be override
};

GDS.Text.prototype.drawOn = function (ctx, port) {
  ctx.font = "bold 16px Arial";
  ctx.strokeText(this.hash.map['STRING'], this.x, this.y);
};

GDS.Boundary.prototype.drawOn = function (ctx, port) {
  GDS.strokePoints(ctx, port, this.vertices(), true);
};

GDS.Path.prototype.strokeCenterline = function (ctx, port) {
  GDS.strokePoints(ctx, port, this.vertices());
};

GDS.Path.prototype.strokeOutline = function (ctx, port) {
  GDS.strokePoints(ctx, port, this.outlineCoords());
};

GDS.Path.prototype.drawOn = function (ctx, port) {
//  ctx.strokeStyle = "yellow";
  this.strokeCenterline(ctx, port);
  this.strokeOutline(ctx, port);
};

GDS.Sref.prototype.drawOn = function (ctx, port) {
  ctx.save();
  const mat = this.transform();
  ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);

  ctx.strokeStyle = "blue";
  GDS.strokeSlantCross(ctx, port, this.x, this.y);
  ctx.strokeStyle = "brown";
  ctx._structureView.drawStructure(ctx, port, this.refStructure);

  ctx.restore();
};

GDS.Aref.prototype.drawOn = function (ctx, port) {
  for (let mat of this.repeatedTransforms()) {
    ctx.save();
    ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
    ctx.strokeStyle = "red";
    GDS.strokeSlantCross(ctx, port, this.x, this.y);
    ctx.strokeStyle = "brown";
    ctx._structureView.drawStructure(ctx, port, this.refStructure);

    ctx.restore();
  }
};

GDS.Point.prototype.drawOn = function (ctx, port) {
  const unit = 3;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineWidth = 1;
  const devicePoint = port.worldToDevice(this.vertices()[0][0], this.vertices()[0][1]);
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


GDS.Tracking = class {
  constructor(view) {
    this.view = view;
    this.element = view.context().canvas;
    this.down = false;
    this.registerHandler();
    this.registerWheel();
  }

  registerWheel() {
    const self = this;
    const mousewheelevent = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
    $(this.view.portId).on(mousewheelevent, function (e) {
      e.preventDefault();
      const delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
      console.log(e);
      const p = GEO.MakePoint(e.originalEvent.offsetX, e.originalEvent.offsetY);
      const dir = delta < 0 ? -1.0 : 1.0;
      const center = self.view.port.deviceToWorld(p.x, p.y);
      self.view.port.wheelZoom(p.x, p.y, center.x, center.y, dir);
    });
  }

  registerHandler() {
    const self = this;
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
      const p = GEO.MakePoint(evt.offsetX, evt.offsetY);
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
        const p1 = self.points[self.points.length - 2];
        const p2 = self.points[self.points.length - 1];
        const wp1 = self.view.port.deviceToWorld(p1.x, p1.y);
        const wp2 = self.view.port.deviceToWorld(p2.x, p2.y);
        const moved = wp2.minus(wp1);
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
  }
};


GDS.StructureView = class {
  constructor(portId, structure) {
    const self = this;
    this.portId = portId;
    this._structure = structure;
    this.ctx = this.context();
    this.port = new GEO.Viewport(this.ctx.canvas.width, this.ctx.canvas.height);
    this.track = new GDS.Tracking(self);
    this.port.portDamageFunction = function (port) {
      self.redraw(port);
    };
    this.transfomFunction = function () {
      return self.ctx.getTransform();
    };
  }
  
  context() {
    const canvas = document.getElementById(this.portId);
    const ctx = canvas.getContext("2d");
    ctx._structureView = this;
    return ctx;
  }
  
  addMouseMoveListener(proc) {
    this.context().canvas.addEventListener("mousemove", proc);
  }

  redraw(port) {
    const ctx = this.context();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "lightGray";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const mat = port.transform();
    if (this._structure === null) {
      return;
    }
    ctx.setTransform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
    ctx.lineWidth = 1 / port.scale;
    this.drawStructure(ctx, port, this._structure);
  }

  drawStructure(ctx, port, structure) {
    this.drawElements(ctx, port, structure.elements());
  }

  drawElements(ctx, port, elements) {
    elements.forEach(function (e) {
      ctx.strokeStyle = "black";
      e.drawOn(ctx, port);
    });
  }

  fit() {
    if (this._structure.elements().length === 0) {
      this.port.reset();
      return;
    }
    const ext = this._structure.dataExtent();
    if (ext.width === 0 && ext.height === 0) {
      this.port.setCenter(ext);
    } else {
      this.port.setRectangle(ext);
    }
  }

  zoomDouble() {
    this.port.zoomDouble();
  }

  zoomHalf() {
    this.port.zoomHalf();
  }

};
