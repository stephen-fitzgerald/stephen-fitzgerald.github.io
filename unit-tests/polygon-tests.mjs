// @ts-check
/*jshint esversion: 6 */

import { assert, diff } from "../js/pci/util/assert.mjs";
import { Polygon } from "../js/pci/polygon.mjs";
import { printToHTML, syntaxHighlight } from "../js/pci/util/print-to-html.mjs";

let canvasNum = 0;

/**
 * Create a new canvas and 
 *
 * @param {HTMLElement} [parentElement=document.body]
 * @returns {HTMLElement | null}
 */
function appendCanvas(parentElement = document.body) {
    const canvas = document.createElement("canvas");
    canvasNum++;
    canvas.id = 'canvas-' + canvasNum; // gives canvas id
    parentElement.appendChild(canvas);
    const element = document.getElementById(canvas.id); //find new canvas we created
    return element;
}

function drawPolygon(p, context, scale, offset) {
    context.fillStyle = 'white';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    const origVertices = p.vertices;
    const vertices = origVertices.map((v, i) => {
        return { x: v.x * scale.x, y: v.y * scale.y };
    });
    context.save();
    context.lineWidth = 1;
    context.translate(offset.x, offset.y);
    //context.scale(scale.x, scale.y);
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
        context.lineTo(vertices[i].x, vertices[i].y);
    }
    context.lineTo(vertices[0].x, vertices[0].y);
    context.stroke();
    context.restore();
}

/**
 * Main application entry point
 */
const app = async () => {
    console.log("Starting unit tests");
    assert(true, "---------- Polygon tests ----------");
    assert(false, "This is just a test to make sure assert() is working");

    let pt1 = { x: 0.0, y: 0.0 };
    let pt2 = { x: 1.0, y: 0.0 };
    let pt3 = { x: 1.0, y: 1.0 };
    let pt4 = { x: 0.0, y: 1.0 };

    let pt5 = { x: 0.5, y: 0.5 };
    let pt6 = { x: 0.5, y: 0.5 };

    let result;
    let p;

    p = new Polygon();
    p.addVertexAt(pt1.x, pt1.y);
    p.addVertexAt(pt2.x, pt2.y);
    p.addVertexAt(pt3.x, pt3.y);
    p.addVertexAt(pt4.x, pt4.y);

    printToHTML("A Polygon:");
    printToHTML(syntaxHighlight(p));

    result = p.numVertices;
    assert(result === 4, "A square has 4 vertices.");

    result = p.isConvex;
    assert(result == true, "The polygon is convex.");

    result = p.area;
    assert(diff(result, 1.0) < 0.01, "A unit square has an area of one. ( " + result + " ).");

    p.insertVertexAt(pt5.x, pt5.y, 2);

    printToHTML("A Polygon with 5 vertices:");
    printToHTML(syntaxHighlight(p));

    result = p.isConvex;
    assert(result == false, "Addition of pt5 makes polygon non-convex.");

    result = p.area;
    assert(diff(result, 0.75) < 0.01, "A unit square has an area of 5 pt polygon has area odf 3/4. ( " + result + " ).");

    const canvas = appendCanvas();
    if (canvas) {
        // @ts-ignore
        canvas.height = 200;
        // @ts-ignore
        canvas.width = 400;
        // @ts-ignore
        const context = canvas.getContext('2d');
        const extents = p.extents;
        // printToHTML(extents);
        const scale = { x: 40, y: 40 };
        const offset = { x: 50, y: 50 };
        drawPolygon(p, context, scale, offset);
    }
    assert(true, "---------- End of tests ----------");
};

document.addEventListener("DOMContentLoaded", app);
