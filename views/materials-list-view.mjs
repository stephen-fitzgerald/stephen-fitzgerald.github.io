//@ts-check
import { addMaterial, getMaterial, deleteMaterial, getMaterials, } from "../data/materials-data.mjs";
import { Material } from "../js/pci/lpt/material.mjs";
import { AbstractView } from "./abstract-view.mjs";

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
    this.html = this.generateTable(this.materials);
    return this.html;
  }

  generateTable(mats) {
    let html = ``;

    html += `<a href='#/materials-create' align="right">New Material..</a>`;
    html += `<br>`;
    html += `<br>`;
    html += `<br>`;
    html += `<br>`;
    html += `<style>
                tr, td {
                    margin: 4px 8px 4px 8px;
                    padding: 6px 12px;
                }
            </style>`;

    html += `<table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th colspan="4">Description</th>
                    </tr>
                </thead>`;

    html += `<tbody id="mat-tbl-body">`;

    for (let row = 0; row < mats.length; row++) {
      html += `<tr mat-id="${row}"`;
      html += row % 2 == 0 ? `class="even-row">` : `class="odd-row">`;

      html += `<td>${row + 1}</td>`;
      html += `<td>${mats[row].name}</td>`;
      html += `<td>${mats[row].description}</td>`;
      html += `<td><a href='#/material/${row}/edit'>Edit..</a></td>`;
      html += `<td><a href='' class='copy-link' mat-id='${row}'>Copy..</a></td>`;
      html += `<td><a href='' class='delete-link' mat-id='${row}'>Delete..</a></td>`;

      html += `</tr>`;
    }
    html += "</tbody>";
    html += "</table>";

    return html.trim();
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
    if (resp ==true) {
      deleteMaterial(matId);
      document.location.hash = `#/`;
      document.location.hash = `#/materials`;
    } 
  }
}
