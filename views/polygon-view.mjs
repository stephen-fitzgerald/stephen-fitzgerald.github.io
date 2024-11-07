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
        <div style="height:100%; width:100%; display:flex; flex-direction:column;">
            <h1> Here's a polygon, shown using a CanvasHelper.</h1>
            <button id="reset-button">Reset</button>
            <div style="flex: 1; display:flex; flex-direction:column;" id="polygon-div" >
                <canvas style="flex: 1;" id='polygon-canvas'></canvas>
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

        this.resize();

        this.polygonCanvas = new PolygonCanvas(this.canvas, this.polygon, this.start, this.end);
        const ph = this.polygonCanvas.pHelper;
        console.log("Area = " + ph.signedArea);
        const resetBtn = document.querySelector('#reset-button');
        resetBtn?.addEventListener('click', () => {
            if( this.polygonCanvas == undefined ) throw new Error("No Polygon Canvas");
            this.polygonCanvas.resetScaleAndOffset();
        });

        this.resizeObserver = new ResizeObserver(entries => {
            this.resize();
            // for (let entry of entries) {
            //     this.resize(entry.contentRect);
            //     console.log("resizing");
            // }
        });

        if (canvasDiv && this.resizeObserver) this.resizeObserver.observe(canvasDiv);

    }

    modelToView() {
    }

    /**
  * Resize the canvas to a rectangle or the parent element.
  * Move agents so all are still in the canvas
  * @param {object} [rect] 
  * @param {number} rect.width 
  * @param {number} rect.height 
  */
    resize(rect) {
        let parent;

        if (this.canvas == undefined) throw new Error("No canvas.");
        parent = this.canvas.parentNode;

        if (parent instanceof HTMLDivElement)
            rect = rect || parent.getBoundingClientRect();

        if (rect == undefined) {
            throw new Error("No parent rectangle to resize canvas");
        }

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        if( this.polygonCanvas )
            this.polygonCanvas.draw();
    }

}
