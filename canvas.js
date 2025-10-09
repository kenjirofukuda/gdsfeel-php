/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global GDS, GEO, createjs, Snap */
"use strict";

let gLibrary = null;
let gStructure = null;
let gStructureView = null;
let gQueue = null;
let gWaitMSecs = 300;

function loadIt() {
  $("#canvas-wrapper").css("display", "block");
  window.addEventListener("resize", function () {
    clearTimeout(gQueue);
    gQueue = setTimeout(function () {
      adjustPortSize();
    }, gWaitMSecs);
  }, false);

  adjustPortSize();
  let obj = jsonData();
  gLibrary = new GDS.Library();
  gLibrary.loadFromJson(obj);
  gStructure = new GDS.Structure();
  let strucName = $("#struc_name").html();
  if (strucName) {
    gStructure = gLibrary.structureNamed(strucName);
  }
  
//  sampleData.nodes.forEach(function (node) {
//    let p3 = node.position;
//    let hash = {
//      "vertices": [[p3[0], p3[2]]],
//      "type": "point"
//    };
//    gStructure.addElement(new GDS.Point(hash));
//  });


  gStructureView = new GDS.StructureView("canvas", gStructure);
  gStructureView.addMouseMoveListener(function (e) {
    $("#deviceX").html(sprintf("%5d", e.offsetX));
    $("#deviceY").html(sprintf("%5d", e.offsetY));
    let worldPoint = gStructureView.port.deviceToWorld(e.offsetX, e.offsetY);
    $("#worldX").html(sprintf("%+20.4f", worldPoint.x.roundDigits(4)));
    $("#worldY").html(sprintf("%+20.4f", worldPoint.y.roundDigits(4)));
  });

  gStructureView.fit();
}

function adjustPortSize() {
  let w = $("#canvas-wrapper").width();
  let h = $("#canvas-wrapper").height();
  $("#canvas").attr("width", w);
  $("#canvas").attr("height", h);
  if (gStructureView) {
    gStructureView.port.setSize(w, h);
  }
  $("#canvas-wrapper").css("display", "block");

}

function msg(s) {
  let msgTag = $("#msg")[0];
  if (msgTag) {
    msgTag.innerHTML = s;
  }
  console.log(s);
}

