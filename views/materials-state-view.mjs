//@ts-check

import { Material } from "../js/pci/lpt/material.mjs";
import { State } from "../js/state.mjs";
import { AbstractView } from "./abstract-view.mjs";

export class MaterialsStateView extends AbstractView {
  constructor(args = {}) {
    super(args);
    this.state = new State(["materialsList"], this.stateChanged.bind(this));
  }

  // called whenever the materialsList database changes.
  stateChanged(name, value) {
    console.log(`State of ${name} has changed.`);
    // this[name] = value;
    this.materialsList = value;
  }

  /**
   * @override
   * buildHTML() - build the static html for a view
   *
   * @return {Promise<string>} the html for the view
   */
  async buildHTML() {
    this.html = this.generateTable(this.materialsList);
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
    let srcMaterial = this.materialsList[matId];
    let newMaterial = Material.duplicate(srcMaterial);
    if (newMaterial) {
      newMaterial.name = `Copy of: ${srcMaterial.name}`;
      this.state.set("materialsList", this.materialsList.concat(newMaterial));
    }
  }
}
