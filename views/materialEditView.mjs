// @ts-check
/* jshint esversion: 6 */

import { parseRequestURL } from "../js/router.mjs";
import { AbstractView } from "./abstractView.mjs";
import {
  getMaterial,
  getMaterials,
  setMaterial,
} from "../data/materialsData.mjs";
import {
  Material,
  Mat_Isotropic,
  Mat_FRP,
  Mat_Orthotropic,
  Mat_PlanarIso12,
  Mat_PlanarIso13,
  Mat_PlanarIso23,
} from "../js/lpt/material.mjs";

const templateHTML = `

    <style>
    input {
        width: 6em;
    }
    </style>

    <h1>Material Entry UI</h1>

    <form id="materialForm">

        <label for="mat-name">Name:</label>
        <input type="text" id="mat-name" style="width: 22em">
        <br>

        <label for="mat-description">Description:</label>
        <input type="text" size="80" id="mat-description" style="width: 20em">
        <br>

        <label>Material Type: </label>
        <label id="mat-type" style="width: 20em"> </label>
        <br> <br>

        <label for="mat-density">Density:</label>
        <input type="text" id="mat-density">
        <label class="units-density">kg/cu.m</label>

        <br> <br>

        <label for="mat-E1">E1:</label>
        <input type="text" id="mat-E1">
        <label class="units-modulus">Pa</label>

        <label for="mat-PR12">PR12:</label>
        <input type="text" id="mat-PR12">

        <label for="mat-G12">G12:</label>
        <input type="text" id="mat-G12">
        <label class="units-modulus">Pa</label>

        <br>

        <label for="mat-E2">E2:</label>
        <input type="text" id="mat-E2">
        <label class="units-modulus">Pa</label>

        <label for="mat-PR13">PR13:</label>
        <input type="text" id="mat-PR13">

        <label for="mat-G13">G13:</label>
        <input type="text" id="mat-G13">
        <label class="units-modulus">Pa</label>

        <br>

        <label for="mat-E3">E3:</label>
        <input type="text" id="mat-E3">
        <label class="units-modulus">Pa</label>

        <label for="mat-PR23">PR23:</label>
        <input type="text" id="mat-PR23">

        <label for="mat-G23">G23:</label>
        <input type="text" id="mat-G23">
        <label class="units-modulus">Pa</label>

        <br>
        <div id="mat-composite">
            <br>
            <label for="mat-fiber">Fiber:</label>
            <input type="text" id="mat-fiber">

            <label for="mat-resin">Resin:</label>
            <input type="text" id="mat-resin">

            <label for="mat-vf">Vf:</label>
            <input type="text" id="mat-vf">
        </div>
        <br>
        <div id="div-btns" width="32em">
            <button id="btn-cancel" class="btn-cancel" display="inline-block">Cancel</button>
            <button id="btn-reset" class="btn-reset" display="inline-block">Reset</button>
            <button id="btn-save" class="btn-save" display="inline-block">Save</button>
        </div>

        <label id="error-message"></label>
    </form>
    `;

export class MaterialEditView extends AbstractView {
  /**
   *
   * @param {object | string} args
   */
  constructor(args = {}) {
    super(args);
    this.html = templateHTML;
  }

  buildHTML() {
    this.request = parseRequestURL();
    this.errorMessage = undefined;
    this.material = undefined;
    let m = getMaterial(this.request.id);
    if (m) {
      this.setMaterial(m);
    } else {
      this.html = `<h1> No material with id = ${this.request.id}.</h1>`;
    }
    return this.html;
  }

  /**
   *
   * @param {Material} theMaterial
   */
  setMaterial(theMaterial) {
    this.targetMaterial = theMaterial;
    this.material = Material.duplicate(this.targetMaterial);
  }

  // Wire up UI select options and event handlers
  addListeners() {
    super.addListeners();
    this.title = `Material editing: ${this.material.name}`;
    // imports
    let doc = document;
    // references to HTML elements
    this.nameFld = doc.querySelector("#mat-name");
    this.matTypeLbl = doc.querySelector("#mat-type");
    this.descriptionFld = doc.querySelector("#mat-description");
    this.densityFld = doc.querySelector("#mat-density");
    this.e1Fld = doc.querySelector("#mat-E1");
    this.e2Fld = doc.querySelector("#mat-E2");
    this.e3Fld = doc.querySelector("#mat-E3");
    this.pr12Fld = doc.querySelector("#mat-PR12");
    this.pr13Fld = doc.querySelector("#mat-PR13");
    this.pr23Fld = doc.querySelector("#mat-PR23");
    this.g12Fld = doc.querySelector("#mat-G12");
    this.g13Fld = doc.querySelector("#mat-G13");
    this.g23Fld = doc.querySelector("#mat-G23");
    this.compositeDiv = doc.getElementById("mat-composite");
    this.fiberFld = doc.querySelector("#mat-fiber");
    this.resinFld = doc.querySelector("#mat-resin");
    this.vfFld = doc.querySelector("#mat-vf");
    this.errMsgLbl = doc.querySelector("#error-message");
    this.cancelBtn = doc.querySelector("#btn-cancel");
    this.resetBtn = doc.querySelector("#btn-reset");
    this.saveBtn = doc.querySelector("#btn-save");

    let handleChangeEvent = this.handleChangeEvent;
    // load select with material types
    this.nameFld.addEventListener("change", handleChangeEvent, false);
    this.descriptionFld.addEventListener("change", handleChangeEvent, false);
    this.densityFld.addEventListener("change", handleChangeEvent, false);
    this.e1Fld.addEventListener("change", handleChangeEvent, false);
    this.e2Fld.addEventListener("change", handleChangeEvent, false);
    this.e3Fld.addEventListener("change", handleChangeEvent, false);
    this.pr12Fld.addEventListener("change", handleChangeEvent, false);
    this.pr13Fld.addEventListener("change", handleChangeEvent, false);
    this.pr23Fld.addEventListener("change", handleChangeEvent, false);
    this.g12Fld.addEventListener("change", handleChangeEvent, false);
    this.g13Fld.addEventListener("change", handleChangeEvent, false);
    this.g23Fld.addEventListener("change", handleChangeEvent, false);
    this.fiberFld.addEventListener("change", handleChangeEvent, false);
    this.resinFld.addEventListener("change", handleChangeEvent, false);
    this.vfFld.addEventListener("change", handleChangeEvent, false);

    //@ts-expect-error
    this.cancelBtn.onclick = handleChangeEvent;
    //@ts-expect-error
    this.resetBtn.onclick = handleChangeEvent;
    //@ts-expect-error
    this.saveBtn.onclick = handleChangeEvent;

    this.modelToView();
  }

  // push the current state to the UI
  modelToView() {
    this.disableReadOnlyElements();
    let theMaterial = this.material;
    //@ts-expect-error
    this.nameFld.value = theMaterial.name;
    //@ts-expect-error
    this.descriptionFld.value = theMaterial.description;
    this.matTypeLbl.innerHTML = theMaterial.constructor.name;
    //@ts-expect-error
    this.densityFld.value = theMaterial.density.toPrecision(4);
    //@ts-expect-error
    this.e1Fld.value = theMaterial.E1.toPrecision(4);
    //@ts-expect-error
    this.e2Fld.value = theMaterial.E2.toPrecision(4);
    //@ts-expect-error
    this.e3Fld.value = theMaterial.E3.toPrecision(4);
    //@ts-expect-error
    this.pr12Fld.value = theMaterial.PR12.toPrecision(2);
    //@ts-expect-error
    this.pr13Fld.value = theMaterial.PR13.toPrecision(2);
    //@ts-expect-error
    this.pr23Fld.value = theMaterial.PR23.toPrecision(2);
    //@ts-expect-error
    this.g12Fld.value = theMaterial.G12.toPrecision(4);
    //@ts-expect-error
    this.g13Fld.value = theMaterial.G13.toPrecision(4);
    //@ts-expect-error
    this.g23Fld.value = theMaterial.G23.toPrecision(4);
    // show the fiber, resin and vf for composite materials
    this.compositeDiv.style.display = "none";
    if (theMaterial.constructor === Mat_FRP) {
      this.compositeDiv.style.display = "block";
      //@ts-expect-error
      this.fiberFld.value = theMaterial.fiber.name || "Fiber";
      //@ts-expect-error
      this.resinFld.value = theMaterial.resin.name || "Resin";
      //@ts-expect-error
      this.vfFld.value = theMaterial.vf.toPrecision(2) || "Vf";
    }
    this.errMsgLbl.innerHTML = this.errorMessage ? this.errorMessage : "";
    this.errorMessage = undefined;
  }

  disableReadOnlyElements() {
    // selects elements whose IDs start with 'mat-'
    let elements = document.querySelectorAll("[id^=mat-]");
    elements.forEach((el) => {
      //@ts-expect-error
      el.disabled = false;
    });

    // disable inputs for read-only properties by material type
    switch (this.material.constructor) {
      case Mat_Isotropic:
        elements.forEach((el) => {
          //@ts-expect-error
          el.disabled = true;
        });
        //@ts-expect-error
        this.densityFld.disabled = false;
        //@ts-expect-error
        this.e1Fld.disabled = false;
        //@ts-expect-error
        this.pr12Fld.disabled = false;
        break;
      case Mat_PlanarIso12:
        //@ts-expect-error
        this.e2Fld.disabled = true;
        //@ts-expect-error
        this.g12Fld.disabled = true;
        //@ts-expect-error
        this.g23Fld.disabled = true;
        //@ts-expect-error
        this.pr23Fld.disabled = true;
        break;
      case Mat_PlanarIso13:
        //@ts-expect-error
        this.e3Fld.disabled = true;
        //@ts-expect-error
        this.g13Fld.disabled = true;
        //@ts-expect-error
        this.g23Fld.disabled = true;
        //@ts-expect-error
        this.pr23Fld.disabled = true;
        break;
      case Mat_PlanarIso23:
        //@ts-expect-error
        this.e3Fld.disabled = true;
        //@ts-expect-error
        this.g13Fld.disabled = true;
        //@ts-expect-error
        this.g23Fld.disabled = true;
        //@ts-expect-error
        this.pr13Fld.disabled = true;
        break;
      case Mat_FRP:
        elements.forEach((el) => {
          //@ts-expect-error
          el.disabled = true;
        });
        //@ts-expect-error
        this.vfFld.disabled = false;
        break;
    }
    // Basic info is read/write for all types
    //@ts-expect-error
    this.nameFld.disabled = false;
    //@ts-expect-error
    this.descriptionFld.disabled = false;
  }

  // updates to state data come from the UI via events
  handleChangeEvent = (e) => {
    e.preventDefault();
    let target = e.target;
    let numberValue = parseFloat(target.value);
    this.errorMessage = undefined;
    let mat = this.material;

    // UI must prevent writing to read-only material properties
    try {
      switch (target) {
        case this.nameFld:
          mat.name = target.value;
          break;
        case this.descriptionFld:
          mat.description = target.value;
          break;
        case this.densityFld:
          //@ts-expect-error
          mat.density = numberValue;
          break;
        case this.e1Fld:
          //@ts-expect-error
          mat.E1 = numberValue;
          break;
        case this.e2Fld:
          //@ts-expect-error
          mat.E2 = numberValue;
          break;
        case this.e3Fld:
          //@ts-expect-error
          mat.E3 = numberValue;
          break;
        case this.pr12Fld:
          //@ts-expect-error
          mat.PR12 = numberValue;
          break;
        case this.pr13Fld:
          //@ts-expect-error
          mat.PR13 = numberValue;
          break;
        case this.pr23Fld:
          //@ts-expect-error
          mat.PR23 = numberValue;
          break;
        case this.g12Fld:
          //@ts-expect-error
          mat.G12 = numberValue;
          break;
        case this.g13Fld:
          //@ts-expect-error
          mat.G13 = numberValue;
          break;
        case this.g23Fld:
          //@ts-expect-error
          mat.G23 = numberValue;
          break;
        case this.cancelBtn:
          history.back();
          break;
        case this.resetBtn:
          this.setMaterial(this.targetMaterial);
          break;
        case this.saveBtn:
          setMaterial(this.request.id, this.material);
          this.setMaterial(this.material);
          document.location.hash = "#/materials";
          break;
      }
    } catch (er) {
      this.errorMessage = er;
    }
    this.modelToView();
  };
}
