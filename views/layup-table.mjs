//@ts-check

import { AbstractView } from "./abstract-view.mjs";
import { batLaminates } from "../js/pci/bats/bat-laminates.mjs";
import { MoldedTube } from "../js/pci/bats/molded-tube.mjs";
import { ORIENTATION } from "../js/pci/lpt/orientation.mjs";
import { PlySpec } from "../js/pci/lpt/plyspec.mjs";

export class LayupTableView extends AbstractView {

    constructor(args) {
        super(args);

        this.canvasHeight = 400;
        this.canvasWidth = 600;
        this.tube = buildTube();
    }

    buildHTML() {


        let plySpecs = this.tube.plySpecs;
        let start = this.tube.getXMin();
        let end = this.tube.getXMax();
        let laminateProperties = this.tube.getSectionProperties(start + 0.5 * (end - start));
        let resin = this.tube.resin;

        let style = `
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

                tr:nth-child(odd) {
                    background-color: #EBF5FF;
                }

                tr:nth-child(even) {
                    background-color: #D2E4FC;
                }

                tr[data-selected] {
                    background-color: #fafabd;
                }
            </style>
        `;


        let tableHeader = `
            <thead>
                <tr>
                    <th rowspan="2">No.</th>
                    <th rowspan="2">Material</th>
                    <th colspan="4">Start/End Pos. (mm)</th>
                    <th colspan="2">Ply Width (mm)</th>
                    <th rowspan="2"># Pc</th>
                    <th rowspan="2">Clck.</th>
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
        `;

        let tableBody = "<tbody>";

        for (let i = 1; i <= plySpecs.length; i++) {
            let plySpec = plySpecs[i - 1];
            let layer = plySpec.layer;
            let tableRow = `<tr>`;
            tableRow += `<td >${i}`;
            tableRow += `<td style="text-align:left">${layer.name}</td>`;
            tableRow += `<td >${(1000 * plySpec.start).toFixed(0)}</td>`;
            tableRow += `<td >${plySpec.start.toFixed(1)}</td>`;
            tableRow += `<td >${plySpec.end.toFixed(1)}</td>`;
            tableRow += `<td >${(1000 * plySpec.end).toFixed(0)}</td>`;
            tableRow += `<td >${(1000 * plySpec.widthAtStart).toFixed(1)}</td>`;
            tableRow += `<td >${(1000 * plySpec.widthAtEnd).toFixed(1)}</td>`;
            tableRow += `<td >${plySpec.numPieces}</td>`;
            tableRow += `<td >${plySpec.clocking}</td>`;
            tableRow += `<td >${(1000 * layer.getThickness({ resin: resin })).toFixed(3)}</td>`;
            tableRow += `</tr>`;
            tableBody += tableRow;
        }
        tableBody += "</tbody>";

        let tableFooter = `
            <tfoot>
                <tr>
                    <th style="text-align:right" scope="row" colspan="10">Total thickness : </th>
                    <th style="text-align:right" colspan="1">${(laminateProperties.thickness * 1000.0).toFixed(3)}</th>
                </tr>
            </tfoot>
        `;


        let html = "";
        html += `<canvas id="profile-canvas" height="${this.canvasHeight}" width="${this.canvasWidth}"></canvas>`;
        html += "<div>";
        html += style;
        html += "<h1>Layup Table</h1>\n";
        html += '<table id="layup-table" class="layup-table">';
        html += "<caption>Material layers, axial positions & clocking.</caption>";
        html += tableHeader;
        html += tableBody;
        html += tableFooter;
        html += "</table>";
        html += "</div>";

        console.log(html);
        return html;

    }

    addListeners() {
        document.title = this.title;

        document.querySelectorAll('#layup-table td')
            .forEach(e => e.addEventListener("click", function (e) {
                //@ts-expect-error
                let tr = e.target.parentElement;
                // this table has 2 header rows
                console.log("clicked row: " + (tr.rowIndex - 1));
            }));

        //draw the profile
        const canvas = document.getElementById("profile-canvas");
        const profile = this.tube.profile;
        drawProfile(profile, canvas);
    }

    modelToView() {
    }

}

function drawProfile(profile, canvas) {
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgb(220, 242, 255)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const extents = {
        minX: 0.0,
        maxX: 1.0,
        minY: -0.050,
        maxY: 0.050,
    };
    let rngX = extents.maxX - extents.minX;
    let rngY = extents.maxY - extents.minY;
    const border = 80;
    const offsetX = border;
    const offsetY = canvas.height / 2;
    let scaleX = (canvas.width - 2 * border) / rngX;
    let scaleY = (canvas.height - 2 * border) / rngY;

    scaleY = Math.min(scaleX, scaleY);
    scaleX = scaleY;

    context.beginPath();

    let curX = profile.xPositions[0] * scaleX + offsetX;
    let curY = 0 * scaleY + offsetY;
    let curYMirror = 0 * scaleY + offsetY;
    let nextX, nextY, nextYMirror;

    for (let i = 0; i < profile.xPositions.length; i++) {
        nextX = profile.xPositions[i] * scaleX + offsetX;
        nextY = profile.oDiameters[i]/2.0 * scaleY + offsetY;
        nextYMirror = -profile.oDiameters[i]/2.0 * scaleY + offsetY;
        context.moveTo(curX, curY);
        context.lineTo(nextX, nextY);

        context.moveTo(curX, curYMirror);
        context.lineTo(nextX, nextYMirror);

        curX = nextX;
        curY = nextY;
        curYMirror = nextYMirror;
    }

    context.moveTo(curX, curY);
    context.lineTo(curX, 0 * scaleY + offsetY);
    context.moveTo(curX, curYMirror);
    context.lineTo(curX, 0 * scaleY + offsetY);

    context.stroke();
}

function buildTube() {

    const epoxyResin = batLaminates.epoxyResin;
    const glassUni = batLaminates.glassUni;
    const carbonUni = batLaminates.carbonUni;
    const lam4 = batLaminates.lam_4;

    const profile = {
        xPositions: [0.000, 0.250, 0.500, 0.750, 1.000],
        oDiameters: [0.050, 0.050, 0.050, 0.050, 0.050],
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
        widthAtStart: 0.157,
        widthAtEnd: 0.157,
        taperStart: start,
        taperEnd: end,
        angle: 0.0,
        orientation: ORIENTATION.UPRIGHT,
        numPieces: 1.0,
        clocking: 0.0,
    }));

    tube.addLayer(new PlySpec({
        layer: carbonUni,
        start: start + 0.25,
        end: end - 0.25,
        widthAtStart: 0.050 * Math.PI,
        widthAtEnd: 0.050 * Math.PI,
        taperStart: start,
        taperEnd: end,
        angle: 0.0,
        orientation: ORIENTATION.UPRIGHT,
        numPieces: 1.0,
        clocking: 30.0,
    }));

    tube.addLayer(new PlySpec({
        layer: lam4,
        start: start,
        end: end,
        widthAtStart: 0.05 * Math.PI / 2.0,
        widthAtEnd: 0.05 * Math.PI / 2.0,
        taperStart: start,
        taperEnd: end,
        angle: 0.0,
        orientation: ORIENTATION.UPRIGHT,
        numPieces: 2.0,
        clocking: 90.0,
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

