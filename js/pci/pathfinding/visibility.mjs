// @ts-check
/*jshint esversion: 6 */

import { printToHTML, syntaxHighlight, appendCanvas } from "../util/print-to-html.mjs";
import { CanvasHelper } from "../canvas/canvas-helper.mjs";
import { PolygonHelper } from "../polygon/polygon-helper.mjs";
import { Graph } from "../polygon/graph.mjs";

class PolygonCanvas extends CanvasHelper {
    constructor(canvas, polygon, start, end) {
        super(canvas);
        this.polygon = polygon;
        this.start = start;
        this.end = end;
        this.draggingEnd = false;
        this.draggingStart = false;
        this.pHelper = new PolygonHelper(this.polygon);
        this.draw();
    }

    doMouseMove(event) {
        if (this.draggingStart) {
            let wp = this.transformPointToWorld(this.mouseLocation);
            if(this.pHelper.isPointInPolygon(wp)){
                this.start = wp;
            }
        }
        if (this.draggingEnd) {
            let wp = this.transformPointToWorld(this.mouseLocation);
            this.end = wp;
        }
    }

    doMouseUp(event) {
        // console.log("mouse up");
        if (this.draggingStart) {
            let wp = this.transformPointToWorld(this.mouseLocation);
            if(this.pHelper.isPointInPolygon(wp)){
                this.start = wp;
            }
            console.log(`dropping start at x: ${this.start.x.toFixed(3)}, y: ${this.start.y.toFixed(3)}`);
            this.draggingStart = false;
        }
        if (this.draggingEnd) {
            let wp = this.transformPointToWorld(this.mouseLocation);
            console.log(`dropping end at x: ${wp.x.toFixed(3)}, y: ${wp.y.toFixed(3)}`);
            this.end = wp;
            this.draggingEnd = false;
        }
    }

    doMouseDown(event) {
        const cp = { x: this.canvasX, y: this.canvasY };
        console.log(`mouse down at x: ${Math.round(cp.x)} y: ${Math.round(cp.y)}`);
        const wp = this.transformPointToWorld(cp);
        console.log(`in the world that's x: ${wp.x.toFixed(3)} y: ${wp.y.toFixed(3)}`);
        if (this.canvasPtIsNearWorldPt(cp, this.start)) {
            console.log("Start point clicked!");
            this.draggingStart = true;
        }else if (this.canvasPtIsNearWorldPt(cp, this.end)) {
            console.log("End point clicked!");
            this.draggingEnd = true;
        }
    }

    draw() {

        let extents = this.pHelper.extents;
        let so = this.calcScaleAndOffset(extents);
        this.scale = so.scale;
        this.offset = so.offset;

        this.clear();
        this.context.save();

        this.concaveVertices = pHelper.concaveVertices();
        this.vlist = this.pHelper.buildVisibilityList(this.start, this.end);
        this.graph = new Graph(this.vlist);
        this.path = this.graph.aStarPath(this.start, this.end);

        this.context.strokeStyle = 'yellow';
        this.drawEdges(this.vlist);

        this.context.strokeStyle = 'black';
        this.drawWorldPolygon(this.polygon);
        this.context.strokeStyle = 'blue';
        this.drawWorldPoints(this.polygon);
        this.context.strokeStyle = 'grey';
        this.labelWorldPoints(this.polygon);

        this.context.strokeStyle = 'purple';
        this.drawWorldPoints(this.concaveVertices);

        this.context.strokeStyle = 'green';
        this.drawWorldPoint(this.start);
        this.labelWorldPoint(this.start, "start");

        this.context.strokeStyle = 'red';
        this.drawWorldPoint(this.end);
        this.labelWorldPoint(this.end, "end");

        this.context.strokeStyle = 'black';
        this.drawPoint({ x: this.canvasX, y: this.canvasY });

        this.context.strokeStyle = 'red';
        this.drawWorldPath(this.path);

        this.context.restore;
    }
}

// Example usage
// Define polygon as an array of points
const polygon = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 2, y: 0 },
    { x: 3.25, y: 0 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 0, y: 3 },
];

const pHelper = new PolygonHelper(polygon);
const start = { x: 0.5, y: 2.85 };
const end = { x: 2.05, y: 2.75 };

printToHTML("Done with CanvasHelper: ");
const canvas = appendCanvas(800, 400);
const helper = new PolygonCanvas(canvas, polygon, start, end);