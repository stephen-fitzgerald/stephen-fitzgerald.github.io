//@ts-check

import { AbstractView } from "./abstract-view.mjs";
import { batLaminates } from "../js/pci/bats/bat-laminates.mjs";
import { MoldedTube } from "../js/pci/bats/molded-tube.mjs";
import { ORIENTATION } from "../js/pci/lpt/orientation.mjs";
import { PlySpec } from "../js/pci/lpt/plyspec.mjs";
import { CONVERT } from "../js/pci/util/convert.mjs";

export class LayupTableView extends AbstractView {

    constructor(args) {
        super(args);
    }

    buildHTML() {

        let tube = buildTube();

        let layers = tube.plySpecs;
        let start = tube.getXMin();
        let end = tube.getXMax();
        let handleProps = tube.getSectionProperties(start + 0.75 * (end - start));
        let thickness = handleProps.thickness;
        let html = "";

        html = "<div>";

        html = html + `
            <style type="text/css">
                
                caption {
                    text-align: left;
                    vertical-align: middle;
                    overflow: hidden;
                    word-break: normal;

                }

                table {
                    text-align: right;
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
                    padding: 2px 20px;
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

                .odd-row {
                    background-color: #EBF5FF;
                }

                .even-row {
                    background-color: #D2E4FC;
                }

            </style>
        `;

        html = html + `
                    <h1>Layup Table</h1>
                    <table id="layup-table" class="layup-table">
                    <caption>Material layers, axial positions & clocking.</caption>
                    <thead>
                        <tr>
                            <th rowspan="2">No.</th>
                            <th rowspan="2">Material</th>
                            <th colspan="4">Start/End Pos. (mm)</th>
                            <th colspan="2">Ply Width (mm)</th>
                            <th rowspan="2"># Pc</th>
                            <th rowspan="2">Clocking</th>
                            <th rowspan="2">Thickness</th>
                        </tr>
                        <tr>
                            <th>Start</th>
                            <th>X2</th>
                            <th>X3</th>
                            <th>End</th>
                            <th>@ Start</th>
                            <th>@ End</th>
                        </tr>
                    </thead>
                    <tbody>
                `;

        for (let i = 1; i <= layers.length; i++) {
            let l = layers[i - 1];
            let evenRow = ((i - 1) % 2 === 0);
            html += `<tr `;
            html += `ondblclick='dblClick(event, ${i - 1})' `;
            html += `oncontextmenu='rightClick(event, ${i - 1})'`;
            html += evenRow ? `class="even-row">` : `class="odd-row">`;
            html += `<td ondblclick='cellDblClick(event, ${i - 1})'>${i}</td>`;
            html += `<td style="text-align:left">${'Material Name'}</td>`;
            html += `<td >${l.start.toFixed(1)}</td>`;
            html += `<td >${l.start.toFixed(1)}</td>`;
            html += `<td >${l.end.toFixed(1)}</td>`;
            html += `<td >${l.end.toFixed(1)}</td>`;
            html += `<td >${l.widthAtStart.toFixed(1)}</td>`;
            html += `<td >${l.widthAtEnd.toFixed(1)}</td>`;
            html += `<td >${1}</td>`;
            html += `<td >${(i - 1) % 7}</td>`;
            html += `<td >${(1000 * handleProps.thickness).toFixed(2)}</td>`;
            html += `</tr>`;
        }

        html += `
            </tbody>
                <tfoot>
                    <tr>
                        <th class="right-align" scope="row" colspan="10">Total thickness : </th>
                        <th class="right-align" colspan="1">${(thickness * 1000.0).toFixed(3)} mm</th>
                    </tr>
                </tfoot>
            </table>`;

        html += "</div>";

        return html;

    }

    addListeners() {
        document.title = this.title;
    }

    modelToView() {
    }

}

function buildTube() {

    const epoxyResin = batLaminates.epoxyResin;
    const glassUni = batLaminates.glassUni;
    const carbonUni = batLaminates.carbonUni;

    const profile = {
        xPositions: [0.000, 1.000],
        oDiameters: [0.050, 0.050],
    };

    const tube = new MoldedTube({
        name: 'Molded Tube',
        description: 'A simple molded tube.  1 meter long x 50 mm OD.',
        profile: profile,
        resin: epoxyResin,
    });

    let start = 0.0;
    let end = 1.0;

    tube.addLayer(new PlySpec({
        layer: glassUni,
        start: start,
        end: end,
        widthAtStart: 1.0,
        widthAtEnd: 1.0,
        taperStart: start,
        taperEnd: end,
        angle: 0.0,
        orientation: ORIENTATION.UPRIGHT,
        numPieces: 1.0,
        clocking: 0.0,
    }));

    tube.addLayer(new PlySpec({
        layer: glassUni,
        start: start,
        end: end,
        widthAtStart: 50.0 * Math.PI,
        widthAtEnd: 50.0 * Math.PI,
        taperStart: start,
        taperEnd: end,
        angle: 0.0,
        orientation: ORIENTATION.UPRIGHT,
        numPieces: 1.0,
        clocking: 0.0,
    }));

    tube.addLayer(new PlySpec({
        layer: glassUni,
        start: start,
        end: end,
        widthAtStart: 1.0,
        widthAtEnd: 1.0,
        taperStart: start,
        taperEnd: end,
        angle: 0.0,
        orientation: ORIENTATION.UPRIGHT,
        numPieces: 1.0,
        clocking: 0.0,
    }));

    return tube;
}


// let rightClick = function (event, n) {
//     event.preventDefault();
//     let layer = currentHandle.getPlySpecs()[n];
//     alert("layer: " + (n+1) + ", target: " + layer.toString());
//     return false;
// };

// let dblClick = function (event, n) {
//     let layer = currentHandle.getPlySpecs()[n];
//     alert("layer: " + (n+1) + ", target: " + layer.toString());
//     return false;
// };

// let cellDblClick = function (event, n) {
//     let layer = currentHandle.getPlySpecs()[n];
//     alert("Cell Double Clicked!  Layer: " + (n+1) + ", Target: " + layer.toString());
//     event.stopImediatePropigation();
//     return false;
// };

