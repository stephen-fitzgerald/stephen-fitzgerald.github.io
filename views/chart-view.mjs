// @ts-check
/*jshint esversion: 6 */

import { AbstractView } from './abstract-view.mjs';

export class ChartView extends AbstractView {

    constructor(args = {}) {
        super(args);
    }

    buildHTML() {
        let mat;
        let _html = `
        <h1> Here's a chart.</h1>
        <div>
            <canvas  id="chart-goes-here"></canvas>
        </div>
        `;
        return _html;
    }

    async addListeners() {
        super.addListeners();
    }

    async modelToView() {
        super.modelToView();
        const labels = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
        ];

        const data = {
            labels: labels,
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {}
        };
        //@ts-expect-error Chart.js is included in index html
        const myChart = new Chart(document.getElementById("chart-goes-here"), config);
    }

}