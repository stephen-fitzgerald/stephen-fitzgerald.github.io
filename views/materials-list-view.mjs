//@ts-check
import { addMaterial, getMaterial, getMaterials, } from "../data/materials-data.mjs";
import { Material } from "../js/pci/lpt/material.mjs";
import { AbstractView } from "./abstract-view.mjs";

export class MaterialsListView extends AbstractView {


  constructor(args={}) {
    super(args);
  }

  /**
   * @override
   * @returns {String} the html to show for this page
   */
  buildHTML() {
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
                        <th colspan="3">Description</th>
                    </tr>
                </thead>`;

    html += `<tbody>`;
    
    for (let row = 0; row < mats.length; row++) {
      html += `<tr `;
      html += `mat-id="${row}"`;
      html += row % 2 == 0 ? `class="even-row"` : `class="odd-row"`;
      html += `>`;

      html += `<td>${row + 1}</td>`;
      html += `<td>${mats[row].name}</td>`;
      html += `<td>${mats[row].description}</td>`;
      html += `<td><a href='#/material/${row}/edit'>edit..</a></td>`;
      html += `<td><a href='' class='copy-link' mat-id='${row}'>copy..</a></td>`;

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
  }

  copyMaterialAndEdit(e) {
    e.preventDefault();
    let theLink = e.target;
    let matId = theLink.attributes["mat-id"].value;
    let srcMaterial = getMaterial(matId);
    let newMaterial = Material.duplicate(srcMaterial);
    newMaterial.name = `Copy of: ${srcMaterial.name}`;
    let newId = addMaterial(newMaterial);
    document.location.hash = `#/material/${newId}/edit`;
  }
}
