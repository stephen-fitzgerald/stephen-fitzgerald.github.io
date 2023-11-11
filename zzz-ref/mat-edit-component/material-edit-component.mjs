// @ts-check
/* jshint esversion: 6 */

import { getMaterial, setMaterial, } from "../../data/materials-data.mjs";
import { Material, Mat_Isotropic, Mat_FRP, Mat_PlanarIso12, Mat_PlanarIso13, Mat_PlanarIso23, Mat_Orthotropic } from "../../js/pci/lpt/material.mjs";
import isEqual from "../../js/ext/lodash/esm/isEqual.js";

const html = String.raw;

export class MaterialEditorElement extends HTMLElement {

  constructor() {
    super();

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({ mode: 'open' });

    // attach styles
    this.styleEl = document.createElement('style');
    this.styleEl.innerHTML = this.styleText;
    this.styleEl.setAttribute('id', 'styleEl');

    // create a div as a top-level container
    this.rootEl = document.createElement('div');
    this.rootEl.innerHTML = this.templateHTML;
    this.rootEl.setAttribute('id', 'rootEl');

    // add style and root div to shadow dom
    shadowRoot.appendChild(this.styleEl);
    shadowRoot.appendChild(this.rootEl);

    this.material = undefined;
    this.addListeners();
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)
    let m = getMaterial(this.matId);
    if (m) {
      this.setMaterial(m);
    } else if (this.errMsgLbl) {
      this.errMsgLbl.textContent = `No material with id = ${this.matId}.`;
    }
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    /* array of attribute names to monitor for changes */
    return ['data-mat-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

  /**
   * called when the element is moved to a new document
   * (happens in document.adoptNode, very rarely used)
   *
   * @memberof MyElement
   */
  adoptedCallback() {
    // todo - remove listeners?
    console.log('adoptedCallback');
  }

  get matId() {
    let ret = this.getAttribute('data-mat-id');
    return (ret);
  }

  set matId(str) {
    if (str && str != '') {
      this.setAttribute('data-mat-id', '' + str);
    } else {
      this.removeAttribute('data-mat-id');
    }
  }

  /**
   *
   * @param {any} theMaterial
   */
  setMaterial(theMaterial) {
    this.targetMaterial = theMaterial;
    this.material = Material.duplicate(this.targetMaterial);
    this.modelToView();
  }

  // Wire up UI select options and event handlers
  addListeners() {

    let doc = this.shadowRoot;
    if (doc == undefined) return;
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
    this.compositeDiv = doc.querySelector("#mat-composite");
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

    let handleChangeEvent = this.handleChangeEvent.bind(this);
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
    /** @type NodeListOf<HTMLInputElement> | undefined */
    let elements = this.shadowRoot?.querySelectorAll("[id^=mat-]");
    if (elements == undefined) throw new Error(
      'elements = shadowRoot?.querySelectorAll("[id^=mat-]") returned undefined.');
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
          history.back();
          break;
        case this.resetBtn:
          this.setMaterial(this.targetMaterial);
          break;
        case this.saveBtn:
          setMaterial(this.matId, this.material);
          break;
      }
    } catch (er) {
      this.errorMessage = er;
    }
    this.modelToView();
  };

  get bgColor() {
    return 'antiquewhite';
  }
  get inputNumWidth() {
    return '7rem';
  }

  /*
    The style tags allow syntax highlighting, but need to be stripped to
    work properly because this gets wrapped in <style> </style> tags
    when added to the shadow dom.
  */
  get styleText() {
    let ret = html`
      <style>
        :host {
          --bg-color: ${this.bgColor};
          --input-num-width: ${this.inputNumWidth};
        }
        #rootEl {
          padding: 1rem;
          background-color: var(--bg-color);
        }
        .entry-table {
          display: grid;
          grid-template-columns: repeat(9, auto) 1fr;
          grid-gap: 0.5rem 0.5rem;
        }
        .new-row{
          grid-column: 1;
        }
        label.units {
          margin: 0rem 1rem 0rem 0rem;
        }
        input.num {
          width: var(--input-num-width);
        }
      </style>
    `;
    ret = ret.replace('<style>', '').replace('</style>', '');
    return ret;
  }

  /*
    The html below will be wrapped in a div with id=rootEl
  */
  get templateHTML() {
    let ret = html`

      <h1>Material Entry UI</h1>

      <label for="mat-name">Name:</label>
      <input type="text" size="20" id="mat-name" style="width: 10em">
      <br><br>

      <label for="mat-description">Description:</label>
      <input type="text" size="80" id="mat-description" style="width: 20em">
      <br><br>

      <label>Material Type: </label>
      <label id="mat-type"> </label>
      <br> <br>

      <label for="mat-density">Density:</label>
      <input type="text" class="num" id="mat-density">
      <label class="units density">kg/cu.m</label>

      <br> <br>
      <div class="entry-table">
          <label for="mat-E1">E1:</label>
          <input type="text" class="num" id="mat-E1">
          <label class="units modulus">Pa</label>

          <label for="mat-PR12">PR12:</label>
          <input type="text" class="num" id="mat-PR12">
          <label class="units"></label>

          <label for="mat-G12">G12:</label>
          <input type="text" class="num" id="mat-G12">
          <label class="units modulus">Pa</label>

          <label for="mat-E2" class="new-row">E2:</label>
          <input type="text" class="num" id="mat-E2">
          <label class="units modulus">Pa</label>

          <label for="mat-PR13">PR13:</label>
          <input type="text" class="num" id="mat-PR13">
          <label class="units"></label>

          <label for="mat-G13">G13:</label>
          <input type="text" class="num" id="mat-G13">
          <label class="units modulus">Pa</label>

          <label for="mat-E3" class="new-row">E3:</label>
          <input type="text" class="num" id="mat-E3">
          <label class="units modulus">Pa</label>

          <label for="mat-PR23">PR23:</label>
          <input type="text" class="num" id="mat-PR23">
          <label class="units"></label>

          <label for="mat-G23">G23:</label>
          <input type="text" class="num" id="mat-G23">
          <label class="units modulus">Pa</label>
      </div>
      <br>
      <div id="mat-composite" style="display: none;">
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
    `;
    return ret;
  }

}

customElements.define("material-editor", MaterialEditorElement);
