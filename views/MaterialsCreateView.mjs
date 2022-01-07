// @ts-check
/* jshint esversion: 6 */

import {
  Mat_Isotropic,
  Mat_Orthotropic,
  Mat_PlanarIso12,
  Mat_PlanarIso13,
  Mat_PlanarIso23,
} from "../js/lpt/material.mjs";
import { addMaterial } from "../data/materialsData.mjs";
import { AbstractView } from "./AbstractView.mjs";

const matTypeHTML = `
    <div id="mat-type-div">
        <label for="mat-type">Material Type: </label>
        <select id="mat-type-sel">
            <option value="Mat_Isotropic">Isotropic</option>
            <option value="Mat_PlanarIso12">Planar Isotropic 1-2</option>
            <option value="Mat_PlanarIso13">Planar Isotropic 1-3</option>
            <option value="Mat_PlanarIso23">Planar Isotropic 2-3</option>
            <option value="Mat_Orthotropic">Orthotropic</option>
            <option value="Mat_FRP">FRP</option>
        </select>
        <button id="mat-create-btn">Create..</button>
    </div>
    `;

export class MaterialsCreateView extends AbstractView {
  constructor(args = {}) {
    super(args);
    this.html = matTypeHTML;
  }

  buildHTML() {
    return this.html;
  }

  addListeners() {
    super.addListeners();
    let matCreateBtn = document.getElementById("mat-create-btn");
    matCreateBtn.addEventListener("click", this.createMaterial.bind(this));
  }

  createMaterial(e) {
    let matTypeSel = document.getElementById("mat-type-sel");
    //@ts-expect-error
    let type = matTypeSel.value;

    let m;
    if (type == "Mat_FRP") {
      // select a material for the fiber and the resin, plus a Vf
      alert("sorry, FRP materials are not implemented yet.");
      history.back();
    } else {
      switch (type) {
        case "Mat_Isotropic":
          m = new Mat_Isotropic();
          break;
        case "Mat_PlanarIso12":
          m = new Mat_PlanarIso12();
          break;
        case "Mat_PlanarIso13":
          m = new Mat_PlanarIso13();
          break;
        case "Mat_PlanarIso23":
          m = new Mat_PlanarIso23();
          break;
        case "Mat_Orthotropic":
          m = new Mat_Orthotropic();
          break;
      }
      let id = addMaterial(m);
      document.location.hash = `#/material/${id}/edit`;
    }
  }
}
