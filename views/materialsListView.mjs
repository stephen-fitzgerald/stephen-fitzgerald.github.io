//@ts-check
import { getMaterials } from "../data/materialsData.mjs";
import { AbstractView } from "./AbstractView.mjs";

export class MaterialsListView extends AbstractView {

    constructor(templateStr) {
        super(templateStr);
    }

    buildHTML() {
        this.materials = getMaterials();
        this.html = this.generateTable2(this.materials);
        return this.html;
    }

    generateTable2 = (mats) => {

        let html = ``;

        html += `<a href='#/materials-create' align="right">New Material..</a>`
        html += `<br>`
        html += `<br>`
        html += `<br>`
        html += `<br>`
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
                            <th colspan="2">Description</th>
                        </tr>
                    </thead>`;

        html += `<tbody>`;
        for (let row = 0; row < mats.length; row++) {

            html += `<tr `;
            html += `mat-id="${row}"`;
            html += (row % 2 == 0) ? `class="even-row"` : `class="odd-row"`;
            html += `>`

            html += `<td>${row + 1}</td>`;
            html += `<td>${mats[row].name}</td>`;
            html += `<td>${mats[row].description}</td>`;
            html += `<td><a href='#/material/${row}/edit'>edit..</a></td>`;

            html += `</tr>`;
        }
        html += '</tbody>'
        html += '</table>'

        return (html.trim());
    }

}