/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global GEO */

const GDS = {};


GDS.Object = class {
  constructor() {
    this.parent = null;
  }

  root() {
    let obj = this;
    while (true) {
      if (obj.parent === null) {
        break;
      }
      else {
        obj = obj.parent;
      }
    }
    return obj;
  }
  
};

