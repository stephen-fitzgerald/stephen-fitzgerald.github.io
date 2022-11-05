//import { html, render } from '../js/ext/lit/lit-html.mjs';

const html = String.raw;

const rows = [
    { rowNum: 1, data: 1 },
    { rowNum: 2, data: 2 },
    { rowNum: 3, data: 3 },
    { rowNum: 4, data: 4 },
];

const myTemplate = html`

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

    <h1>Layup Table</h1>
    <table id="layup-table" class="layup-table" data-laminate="">
        <caption>Material layers, axial positions & clocking.</caption>
        
        <thead id="layup-table-hdr">
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

        ${rows.map(
            (row) => html`
                <tr id="layup-table-row-${row.rowNum}" data-layer-num="${row.rowNum - 1}">
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                    <td>${row.rowNum}</td>
                </tr>
            `.trim()
        ).join('')}

        <tfoot>
            <tr>
                <th style="text-align:right" scope="row" colspan="10">Total thickness : </th>
                <th style="text-align:right" colspan="1">${(3.14 * 1000.0).toFixed(3)}</th>
            </tr>
        </tfoot>

    </table>
`;

function app() {
    document._myTemplate = myTemplate;
    //render(myTemplate, document.body);
    document.body.innerHTML = myTemplate;

}

document.addEventListener("DOMContentLoaded", app);