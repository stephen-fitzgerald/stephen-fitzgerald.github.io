//@ts-check
import { addMaterial, getMaterial, deleteMaterial, getMaterials, } from "../data/materials-data.mjs";
import { Material } from "../js/pci/lpt/material.mjs";
import { serialize } from "../js/pci/util/serialize.mjs";
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

    console.log(serialize(mats));

    let ret = html`
       <style type="text/css">
          
          caption {
              text-align: left;
              vertical-align: middle;
              overflow: hidden;
              word-break: normal;
          }

          table {
              text-align: left;
              vertical-align: middle;
              overflow: hidden;
              word-break: normal;

              border-collapse: collapse;
              border-style: solid;
              border-width: 1px;
              border-spacing: 0;
              border-color: #9ABAD9;
          }

          th {
              font-weight: bold;
              text-align: center;
              padding: 6px 20px;
              background-color: #3166ff;
              color: #fff;

              border-collapse: collapse;
              border-style: solid;
              border-width: 1px;
              border-spacing: 0;
              border-color: #9ABAD9;
          }

          td {
              padding: 4px 15px;

              border-collapse: collapse;
              border-style: solid;
              border-width: 1px;
              border-spacing: 0;
              border-color: #9ABAD9;
          }

          td:hover {
              background-color: #ffff99;
          }

          tbody tr:hover {
              background-color: #fafabd;
          }

          tr:nth-child(odd) {
              background-color: #EBF5FF;
          }

          tr:nth-child(even) {
              background-color: #D2E4FC;
          }

          tr[data-selected] {
              background-color: #fafabd;
          }

          .align-right {
            align:right;
          }
      </style>
      
      <div class=align-right><a href="#/materials-create" class="align-right">New Material..</a></div>
      <br><br>

      <table class="prevent-select">
      <caption>Available Materials.</caption>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th colspan="4">Description</th>
            </tr>
        </thead>

        <tbody id="mat-tbl-body" >
          ${mats.map((mat, row, theArray) => html`
            <tr mat-id="${row}" >
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
