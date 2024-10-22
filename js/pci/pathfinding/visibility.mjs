// @ts-check
/*jshint esversion: 6 */

import { printToHTML, syntaxHighlight, appendCanvas } from "../util/print-to-html.mjs";
import { CanvasHelper } from "../canvas/canvas-helper.mjs";
import { edgeListToGraph, PolygonHelper } from "../polygon/polygon-helper.mjs";
import { decycle, serialize } from "../util/serialize.mjs";

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

const concaveVertices = pHelper.concaveVertices();

const start = { x: 0.5, y: 2.85 };  
const end = { x: 2.05, y: 2.75 };  

printToHTML("Done with CanvasHelper: ");

class PolygonCanvas extends CanvasHelper {
    constructor(canvas, polygon, start, end, concaveVertices ) {
        super(canvas);
        this.polygon = polygon;
        this.start = { x: start.x, y: start.y };
        this.end = { x: end.x, y: end.y };
        this.concaveVertices = concaveVertices;
        this.draw();
    }

    draw() {

        let extents = this.polygonExtents();
        let so = this.calcScaleAndOffset(extents);
        this.scale = so.scale;
        this.offset = so.offset;

        this.clear();
        this.context.save();
        // super.draw();


        this.context.strokeStyle = 'yellow';
        let vlist =pHelper.buildVisibilityList(this.start, this.end);
        this.drawEdges(vlist);

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
        this.drawPoint({x:this.canvasX, y:this.canvasY});

        this.context.restore

        // console.log("draw");        
    }
}

const canvas = appendCanvas(800, 400);
const helper = new PolygonCanvas(canvas, polygon, start, end, concaveVertices );
helper.draw();

let vlist =pHelper.buildVisibilityList(start, end);
printToHTML(vlist);
let graph = edgeListToGraph(vlist);
printToHTML(serialize(graph));
