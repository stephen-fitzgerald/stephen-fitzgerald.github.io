//@ts-check
import { addMaterial, getMaterial, deleteMaterial, getMaterials, } from "../data/materials-data.mjs";
import { Material } from "../js/pci/lpt/material.mjs";
import { AbstractView } from "./abstract-view.mjs";

const html = String.raw;

export class MaterialsListView extends AbstractView {


  constructor(args = {}) {
    super(args);
  }

  /**
   * @override
   * @returns {Promise<String>} the html to show for this page
   */
  async buildHTML() {
    this.materials = getMaterials();
    let mats = this.materials;

    let ret = html`
      <a href='#/materials-create' align="right">New Material..</a>
      <br><br>

      <style>
        tr, td {
            margin: 4px 8px 4px 8px;
            padding: 4px 8px;
        }
      </style>

      <table class="no-select">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th colspan="4">Description</th>
            </tr>
        </thead>

        <tbody id="mat-tbl-body">
          ${mats.map((mat, row, theArray) => html`
            <tr mat-id="${row}" class=${row % 2 ? "no-select odd-row" : "no-select even-row"}>
              <td>${row}</td>
              <td>${mat.name}</td>
              <td>${mat.description}</td>
              <td><a href="#/material/${row}/edit">Edit..</a></td>
              <td><a href='' class='copy-link' mat-id='${row}'>Copy..</a></td>
              <td><a href='' class='delete-link' mat-id='${row}'>Delete..</a></td>
            </tr>
          `.trim()).join('')}
        </tbody>
      </table>
    `;
    return ret;
  }

  /**
   * @override
   */
  addListeners() {
    super.addListeners();
    // add listeners for links to copy each material
    let copyLinks = Array.from(document.getElementsByClassName("copy-link"));
    copyLinks.forEach((element) => {
      element.addEventListener("click", this.copyMaterialAndEdit.bind(this));
    });
    // add listeners for links to delet each material
    let delLinks = Array.from(document.getElementsByClassName("delete-link"));
    delLinks.forEach((element) => {
      element.addEventListener("click", this.deleteMaterial.bind(this));
    });
    let rowEls = document.getElementById("mat-tbl-body")?.querySelectorAll("tr");
    rowEls?.forEach((el) => {
      el.addEventListener("dblclick", this.editMaterial.bind(this));
    });
  }

  editMaterial(e) {
    e.preventDefault();
    let matId = e.currentTarget.attributes["mat-id"].value;
    document.location.hash = `#/material/${matId}/edit`;
  }

  copyMaterialAndEdit(e) {
    e.preventDefault();
    let theLink = e.currentTarget;
    let matId = theLink.attributes["mat-id"].value;
    let srcMaterial = getMaterial(matId);
    let newMaterial = Material.duplicate(srcMaterial);
    if (newMaterial) {
      newMaterial.name = `Copy of: ${srcMaterial.name}`;
      let newId = addMaterial(newMaterial);
      document.location.hash = `#/material/${newId}/edit`;
    }
  }

  deleteMaterial(e) {
    e.preventDefault();
    let theLink = e.currentTarget;
    let matId = theLink.attributes["mat-id"].value;
    let srcMaterial = getMaterial(matId);
    let resp = confirm(`Are you sure you want to delete ${srcMaterial.name}?`);
    if (resp == true) {
      deleteMaterial(matId);
      document.location.hash = `#/`;
      document.location.hash = `#/materials`;
    }
  }
}
