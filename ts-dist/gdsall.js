var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GEO;
(function (GEO) {
    GEO.EPS = 1e-8;
    GEO.PI_HALF = 0.5 * Math.PI;
    GEO.PI_DOUBLE = 2.0 * Math.PI;
    function sameValue(v1, v2, eps) {
        if (eps === void 0) { eps = GEO.EPS; }
        return Math.abs(v1 - v2) < eps;
    }
    GEO.sameValue = sameValue;
    function MakeMatrix() {
        return new createjs.Matrix2D();
    }
    GEO.MakeMatrix = MakeMatrix;
    var Point = /** @class */ (function (_super) {
        __extends(Point, _super);
        function Point(x, y) {
            return _super.call(this, x, y) || this;
        }
        Point.prototype.equals = function (other) {
            return this.x === other.x && this.y === other.y;
        };
        Point.prototype.minus = function (other) {
            return new Point(this.x - other.x, this.y - other.y);
        };
        return Point;
    }(createjs.Point));
    GEO.Point = Point;
    var Rectangle = /** @class */ (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Rectangle.prototype.center = function () {
            return new Point(this.x + this.width / 2.0, this.y + this.height / 2.0);
        };
        ;
        Rectangle.prototype.pointArray = function () {
            var points = [];
            points.push(new Point(this.x, this.y));
            points.push(new Point(this.x, this.y + this.height));
            points.push(new Point(this.x + this.width, this.y + this.height));
            points.push(new Point(this.x + this.width, this.y));
            return points;
        };
        ;
        return Rectangle;
    }(createjs.Rectangle));
    GEO.Rectangle = Rectangle;
    var Viewport = /** @class */ (function () {
        function Viewport(width, height) {
            this.width = width;
            this.height = height;
            this._scale = 1.0;
            this.centerX = 0.0;
            this.centerY = 0.0;
            this._resetPortCenter();
            this.portCenterX = width / 2.0;
            this.portCenterY = height / 2.0;
            this._transform = null;
            this._invertTransform = null;
            this._basicTransform = null;
            this.transformStack = [];
            this.portDamageFunction = null;
            this.transformFunction = null;
        }
        Object.defineProperty(Viewport.prototype, "scale", {
            get: function () { return this._scale; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Viewport.prototype, "transformDepth", {
            get: function () {
                return this.transformStack.length;
            },
            enumerable: false,
            configurable: true
        });
        Viewport.prototype.wheelZoom = function (h, v, x, y, direction) {
            this.portCenterX = h;
            this.portCenterY = this.height - v;
            this.centerX = x;
            this.centerY = y;
            this._scale = this._scale * (1.0 + (0.125 * direction));
            this._damageTransform();
        };
        Viewport.prototype.zoomDouble = function () {
            this.setScale(this.scale * 2.0);
        };
        Viewport.prototype.zoomHalf = function () {
            this.setScale(this.scale * 0.5);
        };
        Viewport.prototype.setScale = function (scale) {
            this._scale = scale;
            this._damageTransform();
        };
        Viewport.prototype.setCenter = function (x, y) {
            this.centerX = x;
            this.centerY = y;
            this._damageTransform();
        };
        Viewport.prototype.moveCenter = function (deltaX, deltaY) {
            this.centerX += deltaX;
            this.centerY += deltaY;
            this._damageTransform();
        };
        Viewport.prototype.setSize = function (width, height) {
            this.width = width;
            this.height = height;
            this._damageTransform();
        };
        Viewport.prototype.reset = function () {
            this._scale = 1.0;
            this.centerX = 0;
            this.centerY = 0;
            this._damageTransform();
        };
        Viewport.prototype.transform = function () {
            if (typeof (this.transformFunction) === 'function') {
                return this.transformFunction();
            }
            if (this._transform === null) {
                this._transform = this._lookupTransform();
            }
            return this._transform;
        };
        Viewport.prototype.invertTransform = function () {
            if (this._invertTransform === null) {
                this._invertTransform = this.transform().clone().invert();
            }
            return this._invertTransform;
        };
        Viewport.prototype.deviceToWorld = function (h, v) {
            var result = MakePoint(0, 0);
            return this.invertTransform().transformPoint(h, v, result);
        };
        Viewport.prototype.worldToDevice = function (x, y) {
            var result = MakePoint(0, 0);
            return this.transform().transformPoint(x, y, result);
        };
        Viewport.prototype.pushTransform = function (transform) {
            this.transformStack.push(transform);
            this._damageTransform();
        };
        Viewport.prototype.popTransform = function () {
            if (this.transformStack.length === 0) {
                return new createjs.Matrix2D();
            }
            var result = this.transformStack.pop();
            this._damageTransform();
            return result;
        };
        Viewport.prototype._lookupTransform = function () {
            var newTransform = new createjs.Matrix2D();
            newTransform.prependMatrix(this.basicTransform());
            this.transformStack.map(function (item) {
                newTransform.prependMatrix(item);
            });
            return newTransform;
        };
        Viewport.prototype.basicTransform = function () {
            if (this._basicTransform === null) {
                this._basicTransform = this._lookupBasicTransform();
            }
            return this._basicTransform;
        };
        Viewport.prototype._lookupBasicTransform = function () {
            var tx = new createjs.Matrix2D();
            tx.translate(this.portCenterX, this.height - this.portCenterY);
            tx.scale(this.scale, -this.scale);
            tx.translate(-this.centerX, -this.centerY);
            return tx;
        };
        Viewport.prototype._fittingRatio = function (width, height) {
            var margin = 20;
            var xRatio = (this.width - margin) / width;
            var yRatio = (this.height - margin) / height;
            return Math.min(xRatio, yRatio);
        };
        Viewport.prototype.setRectangle = function (r) {
            this._resetPortCenter();
            var center = r.center();
            this.setCenter(center.x, center.y);
            this.setScale(this._fittingRatio(r.width, r.height));
        };
        Viewport.prototype._resetPortCenter = function () {
            this.portCenterX = this.width / 2.0;
            this.portCenterY = this.height / 2.0;
        };
        Viewport.prototype._damageTransform = function () {
            this._basicTransform = null;
            this._transform = null;
            this._invertTransform = null;
            if (this.portDamageFunction !== null) {
                var self_1 = this;
                this.portDamageFunction(self_1);
            }
        };
        return Viewport;
    }()); // Viewport
    GEO.Viewport = Viewport;
    function point_x(obj) {
        if ('x' in obj) {
            return obj['x'];
        }
        else {
            return obj[0];
        }
    }
    GEO.point_x = point_x;
    ;
    function point_y(obj) {
        if ('y' in obj) {
            return obj['y'];
        }
        else {
            return obj[1];
        }
    }
    GEO.point_y = point_y;
    ;
    function calcExtentBounds(points) {
        var minX = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var minY = Number.MAX_VALUE;
        var maxY = Number.MIN_VALUE;
        points.forEach(function (p) {
            minX = Math.min(point_x(p), minX);
            maxX = Math.max(point_x(p), maxX);
            minY = Math.min(point_y(p), minY);
            maxY = Math.max(point_y(p), maxY);
        });
        return MakeRect(minX, minY, Math.abs(maxX - minX), Math.abs(maxY - minY));
    }
    GEO.calcExtentBounds = calcExtentBounds;
    ;
    function MakeRect(x, y, width, height) {
        return new Rectangle(x, y, width, height);
    }
    GEO.MakeRect = MakeRect;
    function MakePoint(x, y) {
        return new Point(x, y);
    }
    GEO.MakePoint = MakePoint;
})(GEO || (GEO = {})); // namespace GEO
var GDS;
(function (GDS) {
    GDS.BUTT_END = 0;
    GDS.ROUND_END = 1;
    GDS.EXTENDED_END = 2;
    GDS.CUSTOMPLUS_END = 4;
    var GObject = /** @class */ (function () {
        function GObject() {
            this.parent = null;
        }
        GObject.prototype.root = function () {
            var obj = this;
            while (true) {
                if (obj.parent === null) {
                    break;
                }
                else {
                    obj = obj.parent;
                }
            }
            return obj;
        };
        return GObject;
    }());
    GDS.GObject = GObject;
})(GDS || (GDS = {}));
/// <reference path="../geometry/geo.ts" />
/// <reference path="gds.ts" />
/// <reference path="container.ts" />
var GDS;
(function (GDS) {
    var Element = /** @class */ (function (_super) {
        __extends(Element, _super);
        function Element(jsonMap) {
            var _this = _super.call(this) || this;
            _this._vertices = null;
            _this._dataExtent = null;
            _this.hash = jsonMap;
            return _this;
        }
        Object.defineProperty(Element.prototype, "x", {
            get: function () {
                return this.vertices()[0][0];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "y", {
            get: function () {
                return this.vertices()[0][1];
            },
            enumerable: false,
            configurable: true
        });
        Element.prototype.vertices = function () {
            if (!this._vertices) {
                this._vertices = this._lookupVertices();
            }
            return this._vertices;
        };
        Element.prototype.dataExtent = function () {
            if (!this._dataExtent) {
                this._dataExtent = this._lookupDataExtent();
            }
            return this._dataExtent;
        };
        Element.prototype.toString = function () {
            return 'Element';
        };
        Element.prototype._lookupDataExtent = function () {
            return GEO.calcExtentBounds(this.vertices());
        };
        Element.prototype._lookupVertices = function () {
            var values = this.hash.map.XY;
            var result = [];
            for (var i = 0; i < values.length / 2; i++) {
                var x = values[i * 2 + 0] * 0.001;
                var y = values[i * 2 + 1] * 0.001;
                result.push([x, y]);
            }
            return result;
        };
        Object.defineProperty(Element.prototype, "datatype", {
            get: function () {
                return this.hash.map['DATATYPE'] || 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Element.prototype, "layer", {
            get: function () {
                return this.hash.map['LAYER'] || 0;
            },
            enumerable: false,
            configurable: true
        });
        Element.prototype.attrOn = function (stream) {
            stream['vertices'] = this.vertices();
            stream['elkey'] = this.hash.elkey;
            stream['datatype'] = this.datatype;
            stream['layer'] = this.layer;
            stream['dataExtent'] = this.dataExtent();
        };
        Element.fromObject2 = function (hash) {
            if (hash.type === 9) { // PATH
                return new Path(hash);
            }
            if (hash.type === 12) { // TEXT
                return new Text(hash);
            }
            if (hash.type === 8) { // BOUNDARY
                return new Boundary(hash);
            }
            if (hash.type === 10) { // SREF
                return new Sref(hash);
            }
            if (hash.type === 11) { // AREF
                return new Aref(hash);
            }
            return null;
        };
        return Element;
    }(GDS.GObject));
    GDS.Element = Element;
    var Sref = /** @class */ (function (_super) {
        __extends(Sref, _super);
        function Sref(hash) {
            var _this = _super.call(this, hash) || this;
            _this._refStructure = null;
            _this._transform = null;
            return _this;
        }
        Object.defineProperty(Sref.prototype, "refName", {
            get: function () {
                return this.hash.map['SNAME'];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sref.prototype, "reflected", {
            get: function () {
                return (this.hash.map['STRANS'] & 0x8000) != 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sref.prototype, "angleAbsolute", {
            get: function () {
                return (this.hash.map['STRANS'] & 0x8001) != 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sref.prototype, "magAbsolute", {
            get: function () {
                return (this.hash.map['STRANS'] & 0x8002) != 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sref.prototype, "angleDegress", {
            get: function () {
                return this.hash.map['ANGLE'] || 0.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sref.prototype, "magnify", {
            get: function () {
                return this.hash.map['MAG'] || 1.0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sref.prototype, "refStructure", {
            get: function () {
                if (this._refStructure === null) {
                    this._refStructure = this.root().structureNamed(this.refName);
                }
                return this._refStructure;
            },
            enumerable: false,
            configurable: true
        });
        Sref.prototype.attrOn = function (stream) {
            _super.prototype.attrOn.call(this, stream);
            stream['refName'] = this.refName;
            stream['reflected'] = this.reflected;
            stream['angleAbsolute'] = this.angleAbsolute;
            stream['magAbsolute'] = this.magAbsolute;
            stream['angleDegress'] = this.angleDegress;
            stream['magnify'] = this.magnify;
            stream['transform'] = this.transform();
        };
        Sref.prototype.transform = function () {
            if (!this._transform) {
                this._transform = this._lookupTransform2();
            }
            return this._transform;
        };
        Sref.prototype._lookupTransform = function () {
            var tx = GEO.MakeMatrix();
            tx.translate(this.x, this.y);
            tx.scale(this.magnify, this.magnify);
            tx.rotate(this.angleDegress);
            if (this.reflected) {
                tx.scale(1, -1);
            }
            return tx;
        };
        Sref.prototype._lookupTransform2 = function () {
            var rtx = new createjs.Matrix2D();
            var rad = this.angleDegress * Math.PI / 180;
            var radCos = Math.cos(rad);
            var radSin = Math.sin(rad);
            rtx.a = this.magnify * radCos; // a11
            rtx.c = this.magnify * -radSin; // a12
            rtx.tx = this.x; // a13;
            rtx.b = this.magnify * radSin; // a21
            rtx.d = this.magnify * radCos; // a22
            rtx.ty = this.y; // a23;
            if (this.reflected) {
                rtx.c = -rtx.c; // a12;
                rtx.d = -rtx.d; // a22;
            }
            return rtx;
        };
        return Sref;
    }(Element));
    GDS.Sref = Sref;
    var Aref = /** @class */ (function (_super) {
        __extends(Aref, _super);
        function Aref(hash) {
            var _this = _super.call(this, hash) || this;
            _this._rowStep = null;
            _this._colStep = null;
            _this._repeatedTransforms = null;
            return _this;
        }
        Aref.prototype.attrOn = function (stream) {
            _super.prototype.attrOn.call(this, stream);
            stream['cols'] = this.cols;
            stream['rows'] = this.rows;
            stream['colStep'] = this.colStep;
            stream['rowStep'] = this.rowStep;
            stream['repeatedTransforms'] = this.repeatedTransforms();
        };
        Object.defineProperty(Aref.prototype, "cols", {
            get: function () {
                return (this.hash.map['COLROW'])[0];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Aref.prototype, "rows", {
            get: function () {
                return (this.hash.map['COLROW'])[1];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Aref.prototype, "colStep", {
            get: function () {
                if (!this._colStep) {
                    this._colStep = 0.0;
                    var invertTx = this.transform().clone().invert();
                    var p = this.vertices()[1];
                    var colPoint = invertTx.transformPoint(p[0], p[1]);
                    if (GEO.point_x(colPoint) < 0.0) {
                        throw new Error("Error in AREF! Found a y-axis mirrored array. This is impossible so I\'m exiting.");
                    }
                    this._colStep = GEO.point_x(colPoint) / this.cols;
                }
                return this._colStep;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Aref.prototype, "rowStep", {
            get: function () {
                if (!this._rowStep) {
                    this._rowStep = 0.0;
                    var invertTx = this.transform().clone().invert();
                    var p = this.vertices()[2];
                    var rowPoint = invertTx.transformPoint(p[0], p[1]);
                    this._rowStep = GEO.point_y(rowPoint) / this.rows;
                }
                return this._rowStep;
            },
            enumerable: false,
            configurable: true
        });
        Aref.prototype.repeatedTransforms = function () {
            if (!this._repeatedTransforms) {
                this._repeatedTransforms = this._lookupRepeatedTransforms();
            }
            return this._repeatedTransforms;
        };
        Aref.prototype._lookupRepeatedTransforms = function () {
            var result = [];
            for (var ix = 0; ix < this.cols; ix++) {
                for (var iy = 0; iy < this.rows; iy++) {
                    var otx = new createjs.Matrix2D();
                    otx.translate(ix * this.colStep, iy * this.rowStep);
                    otx.prependMatrix(this.transform());
                    result.push(otx);
                }
            }
            return result;
        };
        return Aref;
    }(Sref));
    GDS.Aref = Aref;
    var Path = /** @class */ (function (_super) {
        __extends(Path, _super);
        function Path(jsonMap) {
            var _this = _super.call(this, jsonMap) || this;
            _this._outlineCoords = null;
            return _this;
        }
        Object.defineProperty(Path.prototype, "pathtype", {
            get: function () {
                return this.hash.map['PATHTYPE'];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Path.prototype, "width", {
            get: function () {
                return this.hash.map['WIDTH'] * 0.001;
            },
            enumerable: false,
            configurable: true
        });
        Path.prototype.attrOn = function (stream) {
            _super.prototype.attrOn.call(this, stream);
            stream['pathtype'] = this.pathtype;
            stream['width'] = this.width;
            stream['outloineCoords'] = this.outlineCoords();
        };
        Path.prototype.outlineCoords = function () {
            if (!this._outlineCoords) {
                this._outlineCoords =
                    pathOutlineCoords(this.vertices(), this.pathtype, this.width);
            }
            return this._outlineCoords;
        };
        return Path;
    }(GDS.Element));
    GDS.Path = Path;
    ;
    var Boundary = /** @class */ (function (_super) {
        __extends(Boundary, _super);
        function Boundary() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Boundary;
    }(GDS.Element));
    GDS.Boundary = Boundary;
    var Text = /** @class */ (function (_super) {
        __extends(Text, _super);
        function Text() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(Text.prototype, "string", {
            get: function () {
                return this.hash.map['STRING'];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "texttype", {
            get: function () {
                return this.hash.map['TEXTTYPE'] || 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "presentation", {
            get: function () {
                return this.hash.map['PRESENTATION'] || 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Text.prototype, "magnify", {
            get: function () {
                return this.hash.map['MAG'] || 0;
            },
            enumerable: false,
            configurable: true
        });
        Text.prototype.attrOn = function (stream) {
            _super.prototype.attrOn.call(this, stream);
            stream['string'] = this.string;
            stream['texttype'] = this.texttype;
            stream['presentation'] = this.presentation;
            stream['magnify'] = this.magnify;
        };
        return Text;
    }(GDS.Element));
    GDS.Text = Text;
    var Point = /** @class */ (function (_super) {
        __extends(Point, _super);
        function Point(hash) {
            return _super.call(this, hash) || this;
        }
        Point.prototype.toString = function () {
            return "Point(" + this.vertices()[0] + ")";
        };
        Point.prototype._lookupDataExtent = function () {
            return GEO.MakeRect(this.x, this.y, 0, 0);
        };
        return Point;
    }(GDS.Element));
    GDS.Point = Point;
    ;
    function getAngle(x1, y1, x2, y2) {
        var angle = 0.0;
        if (x1 == x2) {
            angle = GEO.PI_HALF * ((y2 > y1) ? 1 : -1);
        }
        else {
            angle = Math.atan(Math.abs(y2 - y1) / Math.abs(x2 - x1));
            if (y2 >= y1) {
                if (x2 >= x1) {
                    angle += 0;
                }
                else {
                    angle = Math.PI - angle;
                }
            }
            else {
                if (x2 >= x1) {
                    angle = 2 * Math.PI - angle;
                }
                else {
                    angle += Math.PI;
                }
            }
        }
        return angle;
    }
    ;
    function getDeltaXY(hw, p1, p2, p3) {
        var result = [0, 0];
        var alpha = getAngle(p1[0], p1[1], p2[0], p2[1]);
        var beta = getAngle(p2[0], p2[1], p3[0], p3[1]);
        var theta = (alpha + beta + Math.PI) / 2.0;
        if (Math.abs(Math.cos((alpha - beta) / 2.0)) < GEO.EPS) {
            throw new Error('Internal algorithm error: cos((alpha - beta)/2) = 0');
        }
        var r = hw / Math.cos((alpha - beta) / 2.0);
        result[0] = r * Math.cos(theta);
        result[1] = r * Math.sin(theta);
        return result;
    }
    ;
    function getEndDeltaXY(hw, p1, p2) {
        var result = [0, 0];
        var alpha = getAngle(p1[0], p1[1], p2[0], p2[1]);
        var theta = alpha;
        var r = hw;
        result[0] = -r * Math.sin(theta);
        result[1] = r * Math.cos(theta);
        return result;
    }
    ;
    function pathOutlineCoords(coords, pathType, width) {
        var points = [];
        var hw = width / 2.0;
        var numPoints = coords.length;
        if (numPoints < 2) {
            console.log("pathOutlineCoords: don't know to handle wires < 2 pts yet");
            return [];
        }
        var numAlloc = 2 * numPoints + 1;
        for (var i = 0; i < numAlloc; i++) {
            points.push([0, 0]);
        }
        var deltaxy = getEndDeltaXY(hw, coords[0], coords[1]);
        if (pathType === GDS.BUTT_END) {
            points[0][0] = coords[0][0] + deltaxy[0];
            points[0][1] = coords[0][1] + deltaxy[1];
            points[2 * numPoints][0] = coords[0][0] + deltaxy[0];
            points[2 * numPoints][1] = coords[0][1] + deltaxy[1];
            points[2 * numPoints - 1][0] = coords[0][0] - deltaxy[0];
            points[2 * numPoints - 1][1] = coords[0][1] - deltaxy[1];
        }
        else {
            points[0][0] = coords[0][0] + deltaxy[0] - deltaxy[1];
            points[0][1] = coords[0][1] + deltaxy[1] - deltaxy[0];
            points[2 * numPoints][0] = coords[0][0] + deltaxy[0] - deltaxy[1];
            points[2 * numPoints][1] = coords[0][1] + deltaxy[1] - deltaxy[0];
            points[2 * numPoints - 1][0] = coords[0][0] - deltaxy[0] - deltaxy[1];
            points[2 * numPoints - 1][1] = coords[0][1] - deltaxy[1] - deltaxy[0];
        }
        for (var i = 1; i < numPoints - 1; i++) {
            deltaxy = getDeltaXY(hw, coords[i - 1], coords[i], coords[i + 1]);
            points[i][0] = coords[i][0] + deltaxy[0];
            points[i][1] = coords[i][1] + deltaxy[1];
            points[2 * numPoints - i - 1][0] = coords[i][0] - deltaxy[0];
            points[2 * numPoints - i - 1][1] = coords[i][1] - deltaxy[1];
        }
        deltaxy = getEndDeltaXY(hw, coords[numPoints - 2], coords[numPoints - 1]);
        if (pathType === GDS.BUTT_END) {
            points[numPoints - 1][0] = coords[numPoints - 1][0] + deltaxy[0];
            points[numPoints - 1][1] = coords[numPoints - 1][1] + deltaxy[1];
            points[numPoints][0] = coords[numPoints - 1][0] - deltaxy[0];
            points[numPoints][1] = coords[numPoints - 1][1] - deltaxy[1];
        }
        else {
            points[numPoints - 1][0] = coords[numPoints - 1][0] + deltaxy[0] + deltaxy[1];
            points[numPoints - 1][1] = coords[numPoints - 1][1] + deltaxy[1] + deltaxy[0];
            points[numPoints][0] = coords[numPoints - 1][0] - deltaxy[0] + deltaxy[1];
            points[numPoints][1] = coords[numPoints - 1][1] - deltaxy[1] + deltaxy[0];
        }
        return points;
    }
    ;
})(GDS || (GDS = {}));
/// <reference path="../geometry/geo.ts" />
/// <reference path="./gds.ts" />
/// <reference path="./elements.ts" />
var GDS;
(function (GDS) {
    var Structure = /** @class */ (function (_super) {
        __extends(Structure, _super);
        function Structure() {
            var _this = _super.call(this) || this;
            _this._elements = [];
            _this._dataExtent = null;
            return _this;
        }
        Object.defineProperty(Structure.prototype, "name", {
            get: function () {
                return this.hash.name;
            },
            enumerable: false,
            configurable: true
        });
        Structure.prototype.addElement = function (e) {
            this._elements.push(e);
            e.parent = this;
        };
        ;
        Structure.prototype.elements = function () {
            return this._elements;
        };
        Structure.prototype.dataExtent = function () {
            if (!this._dataExtent) {
                this._dataExtent = this._lookupDataExtent();
            }
            return this._dataExtent;
        };
        Structure.prototype._lookupDataExtent = function () {
            if (this.elements().length === 0) {
                return GEO.MakeRect(0, 0, 0, 0);
            }
            var points = [];
            this.elements().forEach(function (e) {
                var r = e.dataExtent();
                r.pointArray().forEach(function (p) {
                    points.push([p.x, p.y]);
                });
            });
            return GEO.calcExtentBounds(points);
        };
        Structure.prototype.loadFromJson = function (jsonMap) {
            this.hash = jsonMap;
            var self = this;
            jsonMap.elements.forEach(function (oElement) {
                var element = GDS.Element.fromObject2(oElement);
                if (element) {
                    self.addElement(element);
                }
            });
        };
        return Structure;
    }(GDS.GObject));
    GDS.Structure = Structure;
    ;
    var Library = /** @class */ (function (_super) {
        __extends(Library, _super);
        function Library() {
            var _this = _super.call(this) || this;
            _this._structures = [];
            _this._structureMap = new Map;
            return _this;
        }
        Library.prototype.addStructure = function (struct) {
            this._structures.push(struct);
            this._structureMap.set(struct.name, struct);
            struct.parent = this;
        };
        Library.prototype.structureNamed = function (strucName) {
            return this._structureMap.get(strucName);
        };
        Library.prototype.structures = function () {
            return this._structures;
        };
        Library.prototype.loadFromJson = function (jsonMap) {
            this.hash = jsonMap;
            var self = this;
            Object.keys(jsonMap.structures).forEach(function (strucName) {
                var struct = new GDS.Structure();
                struct.loadFromJson(jsonMap.structures[strucName]);
                self.addStructure(struct);
            });
        };
        return Library;
    }(GDS.GObject));
    GDS.Library = Library;
})(GDS || (GDS = {}));
/// <reference path="../../geometry/geo.ts" />
/// <reference path="../gds.ts" />
/// <reference path="../elements.ts" />
/// <reference path="../container.ts" />
var GDS;
(function (GDS) {
    function strokeSlantCrossV1(ctx, port, x, y) {
        var unit = 3;
        var devicePoint = port.worldToDevice(x, y);
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
        ctx.stroke();
        ctx.restore();
    }
    ;
    function strokeSlantCrossV2(ctx, port, x, y) {
        var unit = 3 / port.scale;
        var devicePoint = GEO.MakePoint(x, y);
        ctx.beginPath();
        ctx.moveTo(devicePoint.x - unit, devicePoint.y - unit);
        ctx.lineTo(devicePoint.x + unit, devicePoint.y + unit);
        ctx.moveTo(devicePoint.x - unit, devicePoint.y + unit);
        ctx.lineTo(devicePoint.x + unit, devicePoint.y - unit);
        ctx.stroke();
    }
    ;
    var strokeSlantCross = strokeSlantCrossV2;
    function strokePoints(ctx, port, points, closing) {
        if (closing === void 0) { closing = false; }
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (var _i = 0, _a = points.slice(1); _i < _a.length; _i++) {
            var ce = _a[_i];
            ctx.lineTo(ce[0], ce[1]);
        }
        if (closing) {
            ctx.closePath();
        }
        ctx.stroke();
    }
    // @virtual
    GDS.Element.prototype.drawOn = function (ctx, port) {
        // subclass must be override
    };
    // @override
    GDS.Text.prototype.drawOn = function (ctx, port) {
        ctx.font = "bold 16px Arial";
        ctx.strokeStyle = "purple";
        ctx.strokeText(this.hash.map['STRING'], this.x, this.y);
    };
    GDS.Boundary.prototype.drawOn = function (ctx, port) {
        strokePoints(ctx, port, this.vertices(), true);
    };
    GDS.Path.prototype.strokeCenterline = function (ctx, port) {
        strokePoints(ctx, port, this.vertices());
    };
    GDS.Path.prototype.strokeOutline = function (ctx, port) {
        strokePoints(ctx, port, this.outlineCoords());
    };
    // @override
    GDS.Path.prototype.drawOn = function (ctx, port) {
        ctx.strokeStyle = "black";
        this.strokeCenterline(ctx, port);
        this.strokeOutline(ctx, port);
    };
    // @override
    GDS.Sref.prototype.drawOn = function (ctx, port) {
        if (!this.refStructure) {
            return;
        }
        var mat = this.transform();
        ctx.save();
        port.pushTransform(mat);
        ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
        ctx.strokeStyle = "black";
        ctx._structureView.drawStructure(ctx, port, this.refStructure);
        ctx.restore();
        port.popTransform();
        ctx.strokeStyle = "blue";
        strokeSlantCross(ctx, port, this.x, this.y);
    };
    // @override
    GDS.Aref.prototype.drawOn = function (ctx, port) {
        if (!this.refStructure) {
            return;
        }
        if (this.refName === 'PC' && this.hash.elkey === 5) {
            var debug = true;
        }
        for (var _i = 0, _a = this.repeatedTransforms(); _i < _a.length; _i++) {
            var mat = _a[_i];
            ctx.save();
            port.pushTransform(mat);
            ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
            ctx.strokeStyle = "brown";
            ctx._structureView.drawStructure(ctx, port, this.refStructure);
            port.popTransform();
            ctx.restore();
            ctx.strokeStyle = "orange";
            strokeSlantCross(ctx, port, mat.tx, mat.ty);
        }
        ctx.strokeStyle = "red";
        strokeSlantCross(ctx, port, this.x, this.y);
    };
    // @override
    GDS.Point.prototype.drawOn = function (ctx, port) {
        strokeSlantCross(ctx, port, this.x, this.y);
    };
    var Tracking = /** @class */ (function () {
        function Tracking(view) {
            this.view = view;
            this.element = view.context().canvas;
            this.points = [];
            this.down = false;
            this.downPoint = GEO.MakePoint(0, 0);
            this.currPoint = GEO.MakePoint(0, 0);
            this.upPoint = GEO.MakePoint(0, 0);
            this.registerHandler();
            this.registerWheel();
        }
        Tracking.prototype.registerWheel = function () {
            var self = this;
            var mousewheelevent = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
            $(this.view.portId).on(mousewheelevent, function (e) {
                e.preventDefault();
                if (e.originalEvent) {
                    var evt = e.originalEvent;
                    var delta = evt.deltaY ? -(evt.deltaY) : evt.wheelDelta ? evt.wheelDelta : -(evt.detail);
                    // console.log(e);
                    var p = GEO.MakePoint(evt.offsetX, evt.offsetY);
                    var dir = delta < 0 ? -1.0 : 1.0;
                    var center = self.view.port.deviceToWorld(p.x, p.y);
                    self.view.port.wheelZoom(p.x, p.y, center.x, center.y, dir);
                }
            });
        };
        Tracking.prototype.registerHandler = function () {
            var self = this;
            this.element.addEventListener("mousedown", function (evt) {
                self.down = true;
                self.points = [];
                self.downPoint = GEO.MakePoint(evt.offsetX, evt.offsetY);
                // console.log(["d", self.downPoint + ""]);
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
                // console.log(self);
                if (self.points.length === 1) {
                    $(self.view.portId).css("cursor", "all-scroll");
                }
                if (self.points.length > 2) {
                    var p1 = self.points[self.points.length - 2];
                    var p2 = self.points[self.points.length - 1];
                    var wp1 = self.view.port.deviceToWorld(p1.x, p1.y);
                    var wp2 = self.view.port.deviceToWorld(p2.x, p2.y);
                    var moved = wp2.minus(wp1);
                    self.view.port.moveCenter(-moved.x, -moved.y);
                }
                // console.log(["m", self.currPoint + ""]);
            });
            this.element.addEventListener("mouseup", function (evt) {
                self.down = false;
                self.upPoint = GEO.MakePoint(evt.offsetX, evt.offsetY);
                $(self.view.portId).css("cursor", "default");
                // console.log(["u", self.upPoint + ""]);
            });
        };
        return Tracking;
    }());
    GDS.Tracking = Tracking;
    ;
    var StructureView = /** @class */ (function () {
        function StructureView(portId, structure) {
            var self = this;
            this.portId = portId;
            this._structure = structure;
            this.ctx = this.context();
            this.port = new GEO.Viewport(this.ctx.canvas.width, this.ctx.canvas.height);
            this.track = new Tracking(self);
            this.needsRedraw = true;
            this.port.portDamageFunction = function (port) {
                if (port.transformDepth === 0) {
                    self.needsRedraw = true;
                }
            };
            if (false) {
                this.port.transformFunction = function () {
                    var domMat = self.ctx.getTransform();
                    var createjsMat = new createjs.Matrix2D();
                    createjsMat.a = domMat.a;
                    createjsMat.b = domMat.b;
                    createjsMat.c = domMat.c;
                    createjsMat.d = domMat.d;
                    createjsMat.tx = domMat.e;
                    createjsMat.ty = domMat.f;
                    return createjsMat;
                };
            }
        }
        StructureView.prototype.context = function () {
            var canvas = document.getElementById(this.portId);
            var ctx = canvas.getContext("2d");
            ctx._structureView = this;
            return ctx;
        };
        StructureView.prototype.addMouseMoveListener = function (proc) {
            this.context().canvas.addEventListener("mousemove", proc);
        };
        StructureView.prototype.redraw = function () {
            if (this.needsRedraw) {
                this.fullDraw();
                this.needsRedraw = false;
            }
        };
        StructureView.prototype.fullDraw = function () {
            var ctx = this.context();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = "lightGray";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            var mat = this.port.transform();
            if (this._structure === null) {
                return;
            }
            // this.port._basicTransform = mat;
            ctx.setTransform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
            ctx.lineWidth = 1 / this.port.scale;
            ctx.strokeStyle = 'black';
            this.drawStructure(ctx, this.port, this._structure);
        };
        StructureView.prototype.drawStructure = function (ctx, port, structure) {
            this.drawElements(ctx, port, structure.elements());
        };
        StructureView.prototype.drawElements = function (ctx, port, elements) {
            elements.forEach(function (e) {
                e.drawOn(ctx, port);
            });
        };
        StructureView.prototype.fit = function () {
            if (this._structure.elements().length === 0) {
                this.port.reset();
                return;
            }
            var ext = this._structure.dataExtent();
            if (ext.width === 0 && ext.height === 0) {
                this.port.setCenter(0, 0);
            }
            else {
                this.port.setRectangle(ext);
            }
        };
        StructureView.prototype.zoomDouble = function () {
            this.port.zoomDouble();
        };
        StructureView.prototype.zoomHalf = function () {
            this.port.zoomHalf();
        };
        return StructureView;
    }());
    GDS.StructureView = StructureView;
    ;
})(GDS || (GDS = {}));
