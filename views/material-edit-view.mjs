// @ts-check
/* jshint esversion: 6 */

import { AbstractView } from "./abstract-view.mjs";
import { getMaterial, setMaterial, } from "../data/materials-data.mjs";
import { Material, Mat_Isotropic, Mat_FRP, Mat_PlanarIso12, Mat_PlanarIso13, Mat_PlanarIso23, Mat_Orthotropic } from "../js/pci/lpt/material.mjs";
import isEqual from "../js/ext/lodash/esm/isEqual.js";

const html = String.raw;

const templateHTML = html`

    <h1>Material Entry UI</h1>

    <div id="materialForm">

      <div class="tooltip">
        <span class="tooltiptext">The name should be unique to this material.</span>
        <label for="mat-name">Name:</label>
        <input type="text" id="mat-name" style="width: 22em">
      </div>
      <br>

      <label for="mat-description">Description:</label>
      <input  type="text" size="80" id="mat-description" style="width: 20em">
      <br>

      <label>Material Type: </label>
      <label id="mat-type" style="width: 20em"> </label>
      <br> <br>

      <label for="mat-density">Density:</label>
      <input type="text" class="num" id="mat-density">
      <label class="units-density">kg/cu.m</label>

      <br> <br>

      <label for="mat-E1">E1:</label>
      <input type="text" class="num" id="mat-E1">
      <label class="units-modulus">Pa</label>

      <label for="mat-PR12">PR12:</label>
      <input type="text" class="num" id="mat-PR12">

      <label for="mat-G12">G12:</label>
      <input type="text" class="num" id="mat-G12">
      <label class="units-modulus">Pa</label>

      <br>

      <label for="mat-E2">E2:</label>
      <input type="text" class="num" id="mat-E2">
      <label class="units-modulus">Pa</label>

      <label for="mat-PR13">PR13:</label>
      <input type="text" class="num" id="mat-PR13">

      <label for="mat-G13">G13:</label>
      <input type="text" class="num" id="mat-G13">
      <label class="units-modulus">Pa</label>

      <br>

      <label for="mat-E3">E3:</label>
      <input type="text" class="num" id="mat-E3">
      <label class="units-modulus">Pa</label>

      <label for="mat-PR23">PR23:</label>
      <input type="text" class="num" id="mat-PR23">

      <label for="mat-G23">G23:</label>
      <input type="text" class="num" id="mat-G23">
      <label class="units-modulus">Pa</label>

      <br>
      <div id="mat-composite">
          <br>
          <label for="mat-fiber">Fiber:</label>
          <input type="text" id="mat-fiber">

          <label for="mat-resin">Resin:</label>
          <input type="text" id="mat-resin">

          <label for="mat-vf">Vf:</label>
          <input type="text" class="num" id="mat-vf">
      </div>
      <br>
      <div id="div-btns" width="32em">
        <button id="btn-reset" type="submit" class="btn-reset" display="inline-block">Reset</button>
        <button id="btn-cancel" type="submit" class="btn-cancel" display="inline-block">Cancel</button>
        <button id="btn-save" type="submit" class="btn-save" display="inline-block">Save</button>
      </div>

      <label id="error-message"></label>
    </div>
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

  
  /**
   * buildHTML() - build the static html for a view
   * 
   * @param {object} [request={}]
   * @param {string} [request.resource]
   * @param {string} [request.id]
   * @param {string} [request.verb]
   * 
   * @return {Promise<string | undefined>} the html for the view
   * @memberof AbstractView
   * 
   * @memberOf AbstractView
   */
  async buildHTML(request={}) {
    this.request = request;
    this.errorMessage = undefined;
    /** @type {Mat_PlanarIso12 | Mat_Isotropic | Mat_FRP | Mat_PlanarIso23 |  Mat_Orthotropic | Mat_PlanarIso13 | undefined} */
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
   * @param {any} theMaterial
   */
  setMaterial(theMaterial) {
    this.targetMaterial = theMaterial;
    this.material = Material.duplicate(this.targetMaterial);
  }

  // Wire up UI select options and event handlers
  addListeners() {
    super.addListeners();
    this.title = `Material editing: ${this.material?.name}`;
    // imports
    let doc = document;

    // references to HTML elements
    /** @type HTMLInputElement | null */
    this.nameFld = doc.querySelector("#mat-name");
    /** @type HTMLElement | null */
    this.matTypeLbl = doc.querySelector("#mat-type");
    /** @type HTMLInputElement | null */
    this.descriptionFld = doc.querySelector("#mat-description");
    /** @type HTMLInputElement | null */
    this.densityFld = doc.querySelector("#mat-density");
    /** @type HTMLInputElement | null */
    this.e1Fld = doc.querySelector("#mat-E1");
    /** @type HTMLInputElement | null */
    this.e2Fld = doc.querySelector("#mat-E2");
    /** @type HTMLInputElement | null */
    this.e3Fld = doc.querySelector("#mat-E3");
    /** @type HTMLInputElement | null */
    this.pr12Fld = doc.querySelector("#mat-PR12");
    /** @type HTMLInputElement | null */
    this.pr13Fld = doc.querySelector("#mat-PR13");
    /** @type HTMLInputElement | null */
    this.pr23Fld = doc.querySelector("#mat-PR23");
    /** @type HTMLInputElement | null */
    this.g12Fld = doc.querySelector("#mat-G12");
    /** @type HTMLInputElement | null */
    this.g13Fld = doc.querySelector("#mat-G13");
    /** @type HTMLInputElement | null */
    this.g23Fld = doc.querySelector("#mat-G23");
    /** @type HTMLElement | null */
    this.compositeDiv = doc.getElementById("mat-composite");
    /** @type HTMLInputElement | null */
    this.fiberFld = doc.querySelector("#mat-fiber");
    /** @type HTMLInputElement | null */
    this.resinFld = doc.querySelector("#mat-resin");
    /** @type HTMLInputElement | null */
    this.vfFld = doc.querySelector("#mat-vf");
    /** @type HTMLElement | null */
    this.errMsgLbl = doc.querySelector("#error-message");
    /** @type HTMLButtonElement | null */
    this.cancelBtn = doc.querySelector("#btn-cancel");
    /** @type HTMLButtonElement | null */
    this.resetBtn = doc.querySelector("#btn-reset");
    /** @type HTMLButtonElement | null */
    this.saveBtn = doc.querySelector("#btn-save");

    let handleChangeEvent = this.handleChangeEvent;
    // load select with material types
    this.nameFld?.addEventListener("change", handleChangeEvent, false);
    this.descriptionFld?.addEventListener("change", handleChangeEvent, false);
    this.densityFld?.addEventListener("change", handleChangeEvent, false);
    this.e1Fld?.addEventListener("change", handleChangeEvent, false);
    this.e2Fld?.addEventListener("change", handleChangeEvent, false);
    this.e3Fld?.addEventListener("change", handleChangeEvent, false);
    this.pr12Fld?.addEventListener("change", handleChangeEvent, false);
    this.pr13Fld?.addEventListener("change", handleChangeEvent, false);
    this.pr23Fld?.addEventListener("change", handleChangeEvent, false);
    this.g12Fld?.addEventListener("change", handleChangeEvent, false);
    this.g13Fld?.addEventListener("change", handleChangeEvent, false);
    this.g23Fld?.addEventListener("change", handleChangeEvent, false);
    this.fiberFld?.addEventListener("change", handleChangeEvent, false);
    this.resinFld?.addEventListener("change", handleChangeEvent, false);
    this.vfFld?.addEventListener("change", handleChangeEvent, false);

    if (this.cancelBtn) this.cancelBtn.onclick = handleChangeEvent;
    if (this.resetBtn) this.resetBtn.onclick = handleChangeEvent;
    if (this.saveBtn) this.saveBtn.onclick = handleChangeEvent;

    this.modelToView();
  }

  // push the current state to the UI
  modelToView() {
    this.disableReadOnlyElements();
    let theMaterial = this.material;
    if (!theMaterial) return;

    if (this.nameFld) this.nameFld.value = theMaterial.name;
    if (this.descriptionFld) this.descriptionFld.value = theMaterial.description;
    if (this.matTypeLbl) this.matTypeLbl.innerHTML = theMaterial.constructor.name;
    if (this.densityFld) this.densityFld.value = theMaterial.density.toPrecision(4);
    if (this.e1Fld) this.e1Fld.value = theMaterial.E1.toPrecision(4);
    if (this.e2Fld) this.e2Fld.value = theMaterial.E2.toPrecision(4);
    if (this.e3Fld) this.e3Fld.value = theMaterial?.E3.toPrecision(4);
    if (this.pr12Fld) this.pr12Fld.value = theMaterial.PR12.toPrecision(2);
    if (this.pr13Fld) this.pr13Fld.value = theMaterial.PR13.toPrecision(2);
    if (this.pr23Fld) this.pr23Fld.value = theMaterial.PR23.toPrecision(2);
    if (this.g12Fld) this.g12Fld.value = theMaterial.G12.toPrecision(4);
    if (this.g13Fld) this.g13Fld.value = theMaterial.G13.toPrecision(4);
    if (this.g23Fld) this.g23Fld.value = theMaterial.G23.toPrecision(4);
    // show the fiber, resin and vf for composite materials
    if (this.compositeDiv) this.compositeDiv.style.display = "none";
    if (theMaterial && theMaterial.constructor === Mat_FRP) {
      if (this.compositeDiv) this.compositeDiv.style.display = "block";
      if (this.fiberFld) this.fiberFld.value = theMaterial.fiber?.name || "Fiber";
      if (this.resinFld) this.resinFld.value = theMaterial.resin?.name || "Resin";
      if (this.vfFld) this.vfFld.value = theMaterial.vf?.toPrecision(2) || "Vf";
    }
    if (this.errMsgLbl) this.errMsgLbl.innerHTML = this.errorMessage ? this.errorMessage : "";
    this.errorMessage = undefined;

    let editsPending = !isEqual(this.material, this.targetMaterial);
    if (this.resetBtn) this.resetBtn.disabled = editsPending ? false : true;
    if (this.saveBtn) this.saveBtn.disabled = editsPending ? false : true;

  }

  disableReadOnlyElements() {
    // selects elements whose IDs start with 'mat-'
    /** @type NodeListOf<HTMLInputElement> */
    let elements = document.querySelectorAll("[id^=mat-]");
    elements.forEach((el) => { el.disabled = false; });

    // disable inputs for read-only properties by material type
    switch (this.material?.constructor) {
      case Mat_Isotropic:
        elements.forEach((el) => { el.disabled = true; });
        if (this.densityFld) this.densityFld.disabled = false;
        if (this.e1Fld) this.e1Fld.disabled = false;
        if (this.pr12Fld) this.pr12Fld.disabled = false;
        break;
      case Mat_PlanarIso12:
        if (this.e2Fld) this.e2Fld.disabled = true;
        if (this.g12Fld) this.g12Fld.disabled = true;
        if (this.g23Fld) this.g23Fld.disabled = true;
        if (this.pr23Fld) this.pr23Fld.disabled = true;
        break;
      case Mat_PlanarIso13:
        if (this.e3Fld) this.e3Fld.disabled = true;
        if (this.g13Fld) this.g13Fld.disabled = true;
        if (this.g23Fld) this.g23Fld.disabled = true;
        if (this.pr23Fld) this.pr23Fld.disabled = true;
        break;
      case Mat_PlanarIso23:
        if (this.e3Fld) this.e3Fld.disabled = true;
        if (this.g13Fld) this.g13Fld.disabled = true;
        if (this.g23Fld) this.g23Fld.disabled = true;
        if (this.pr13Fld) this.pr13Fld.disabled = true;
        break;
      case Mat_FRP:
        elements.forEach((el) => { el.disabled = true; });
        if (this.vfFld) this.vfFld.disabled = false;
        break;
    }
    // Basic info is read/write for all types
    if (this.nameFld) this.nameFld.disabled = false;
    if (this.descriptionFld) this.descriptionFld.disabled = false;
  }

  // updates to state data come from the UI via events
  handleChangeEvent = (e) => {
    e.preventDefault();
    let target = e.target;
    let numberValue = parseFloat(target.value);
    let strValue = "" + target.value;
    this.errorMessage = undefined;
    let mat = this.material;
    if (!mat) return;
    console.log("change event");
    /*  
    * The writable properties for the 6 different Material sub-types are:    
    * Mat_Isotropic:   density, E1,                        PR12            ;   
    * Mat_Orthotropic: density, E1, E2, E3, G12, G13, G23, PR12, PR13, PR23;    
    * Mat_PlanarIso12: density, E1,     E3,      G13,      PR12, PR13      ;    
    * Mat_PlanarIso13: density, E1, E2,     G12,           PR12, PR13      ;    
    * Mat_PlanarIso23: density, E1, E2,     G12,           PR12,       PR23;    
    * Mat_FRP: fiber, resin, vf.     
    * All units are basic kg/m/s/degC, ie moduli are in (kg-m/s^2)/m^2 = N/m^2 = Pa). 
    */
    try {
      switch (target) {
        case this.nameFld:
          mat.name = strValue;
          break;
        case this.descriptionFld:
          mat.description = strValue;
          break;
        case this.densityFld:
          if (!(mat instanceof Mat_FRP))
            mat.density = numberValue;
          break;
        case this.e1Fld:
          if (!(mat instanceof Mat_FRP))
            mat.E1 = numberValue;
          break;
        case this.pr12Fld:
          if (!(mat instanceof Mat_FRP))
            mat.PR12 = numberValue;
          break;
        case this.e2Fld:
          if (mat instanceof Mat_Orthotropic
            || mat instanceof Mat_PlanarIso13 || mat instanceof Mat_PlanarIso23)
            mat.E2 = numberValue;
          break;
        case this.e3Fld:
          if (mat instanceof Mat_Orthotropic || mat instanceof Mat_PlanarIso12)
            mat.E3 = numberValue;
          break;
        case this.pr13Fld:
          if (mat instanceof Mat_Orthotropic || mat instanceof Mat_PlanarIso12
            || mat instanceof Mat_PlanarIso13)
            mat.PR13 = numberValue;
          break;
        case this.pr23Fld:
          if (mat instanceof Mat_Orthotropic || mat instanceof Mat_PlanarIso23)
            mat.PR23 = numberValue;
          break;
        case this.g12Fld:
          if (mat instanceof Mat_Orthotropic || mat instanceof Mat_PlanarIso13
            || mat instanceof Mat_PlanarIso23)
            mat.G12 = numberValue;
          break;
        case this.g13Fld:
          if (mat instanceof Mat_Orthotropic || mat instanceof Mat_PlanarIso12)
            mat.G13 = numberValue;
          break;
        case this.g23Fld:
          if (mat instanceof Mat_Orthotropic)
            mat.G23 = numberValue;
          break;
        case this.vfFld:
          if (mat instanceof Mat_FRP && numberValue <= 1.0 && numberValue >= 0.0)
            mat.vf = numberValue;
          break;
        case this.cancelBtn:
          // history.back();
          document.location.hash = "#/materials";
          break;
        case this.resetBtn:
          this.setMaterial(this.targetMaterial);
          break;
        case this.saveBtn:
          setMaterial(this.request?.id, this.material);
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
