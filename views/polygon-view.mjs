// @ts-check
/* jshint esversion: 6 */

import { AbstractView } from "./abstract-view.mjs";
import { PolygonCanvas } from "./../js/pci/pathfinding/visibility.mjs";

const html = String.raw;

export class PolygonView extends AbstractView {

    constructor(args = {}) {
        super(args);
        this.title = args.title || "A* Pathfinding in a Polygon.";
        console.log("constructor");
        // Define polygon as an array of points
        this.polygon = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1.5 },
            { x: 2, y: 1.5 },
            { x: 2, y: 0 },
            { x: 3.25, y: 0 },
            { x: 2.75, y: 3 },
            { x: 2, y: 3 },
            { x: 2, y: 2 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 0, y: 3 },
        ];
        // define the start and end points of our path
        this.start = { x: 0.5, y: 2.85 };
        this.end = { x: 2.05, y: 2.75 };
    }

    /**
     *
        <div style="height:100%; width:100%; display:flex; flex-direction:column;">
     * @return {Promise<string>} the html for the view
     */
    async buildHTML() {
        this.html = html`
        <div style='width:100%; height:100%; display:flex; flex-flow:column'>
            <h1> Here's a polygon, shown using a CanvasHelper.</h1>
            <button style="margin:20px;" id="reset-button">Reset</button>
            <div style="display: flex; flex-direction:column; flex:1" id="polygon-div" >
                <canvas style='width:100%; height:100%' id='polygon-canvas'></canvas>
            </div>
        </div>
        `;
        return this.html;
    }

    addListeners() {
        document.title = this.title;

        /** @type HTMLCanvasElement | null */
        this.canvas = document.querySelector('#polygon-canvas');
        if (!this.canvas) throw new Error("Canvas not found.");

        /** @type HTMLDivElement | null */
        const canvasDiv = document.querySelector('#polygon-div');
        if (!canvasDiv) throw new Error("Canvas parent div not found.");

        this.polygonCanvas = new PolygonCanvas(this.canvas, this.polygon, this.start, this.end);
        const ph = this.polygonCanvas.pHelper;

        const resetBtn = document.querySelector('#reset-button');
        resetBtn?.addEventListener('click', () => {
            if (this.polygonCanvas == undefined) throw new Error("No Polygon Canvas");
            this.polygonCanvas.resetScaleAndOffset();
        });

        this.resizeObserver = new ResizeObserver(entries => {
            this.resize();
        });
        if (canvasDiv && this.resizeObserver) this.resizeObserver.observe(canvasDiv);

        this.resize();
        this.polygonCanvas.resetScaleAndOffset();

        console.log("Area = " + ph.signedArea);

    }

    modelToView() {
    }

    /**
     * Resize the canvas to match its on-screen size
     */
    resize() {
        if (!this.canvas ) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        if (this.polygonCanvas)
            this.polygonCanvas.draw();
    }

}
