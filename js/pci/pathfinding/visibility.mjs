// @ts-check
/*jshint esversion: 6 */

import { printToHTML, syntaxHighlight, appendCanvas } from "../util/print-to-html.mjs";
import { getExtents, CanvasHelper } from "../canvas/drawPolygon.mjs";

/**
 * Helper function to compute the angle between two points relative to the x-axis.
 * @param {{x: number, y: number}} v - The base vertex.
 * @param {{x: number, y: number}} w - The vertex whose angle to v is to be computed.
 * @returns {number} - The angle in radians.
 */
function computeAngle(v, w) {
    return Math.atan2(w.y - v.y, w.x - v.x);
}

/**
 * Helper function to compute the Euclidean distance between two points.
 * @param {{x: number, y: number}} v - First point.
 * @param {{x: number, y: number}} w - Second point.
 * @returns {number} - The distance between v and w.
 */
function computeDistance(v, w) {
    return Math.sqrt((v.x - w.x) ** 2 + (v.y - w.y) ** 2);
}

/**
 * Determines if the point w_i is visible from point v, based on current blocking edges.
 * @param {{x: number, y: number}} v - The base vertex.
 * @param {{x: number, y: number}} w_i - The vertex to check visibility for.
 * @param {Set} T - A set of edges currently blocking the scan line (the binary search tree T).
 * @returns {boolean} - True if w_i is visible, false otherwise.
 */
function isVisible(v, w_i, T) {
    for (const edge of T) {
        if (doLinesIntersect(v, w_i, edge[0], edge[1])) {
            return false; // w_i is blocked by an edge in T
        }
    }
    return true; // No edge in T blocks the line of sight
}

/**
 * Main function to find visible vertices from a given vertex v using the rotating scan line method.
 * @param {{x: number, y: number}} v - The base vertex.
 * @param {Array<{x: number, y: number}>} vertices - List of vertices in the obstacle polygons.
 * @param {Array<Array<{x: number, y: number}, {x: number, y: number}>>} edges - List of edges represented as pairs of vertices.
 * @returns {Array<{x: number, y: number}>} - List of vertices visible from v.
 */
function visibleVertices(v, vertices, edges) {
    // Step 1: Sort vertices by counterclockwise angle from v
    const sortedVertices = vertices.slice().sort((w1, w2) => {
        const angle1 = computeAngle(v, w1);
        const angle2 = computeAngle(v, w2);

        if (angle1 === angle2) {
            return computeDistance(v, w1) - computeDistance(v, w2); // In case of ties, closer vertices come first
        }

        return angle1 - angle2;
    });

    // Step 2: Initialize the scan line s and binary search tree T
    let T = new Set(); // We will use a Set to simulate the binary search tree

    // Initially populate T with edges that intersect the scan line (s is horizontal)
    edges.forEach(edge => {
        const [start, end] = edge;
        // Check if the edge intersects the scan line s (horizontal line starting at v)
        if (doLinesIntersect(v, { x: Infinity, y: v.y }, start, end)) {
            T.add(edge);
        }
    });

    // Step 3: Initialize the list of visible vertices
    const W = [];

    // Step 4: Iterate over the sorted vertices
    for (let i = 0; i < sortedVertices.length; i++) {
        const w_i = sortedVertices[i];

        // Step 5: Check if w_i is visible
        if (isVisible(v, w_i, T)) {
            W.push(w_i); // Add w_i to the list of visible vertices
        }

        // Step 6: Insert into T the edges incident to w_i that lie on the counterclockwise side
        edges.forEach(edge => {
            const [start, end] = edge;

            // If w_i is an endpoint of the edge, check its position relative to the scan line
            if (w_i === start || w_i === end) {
                const other = w_i === start ? end : start;
                if (computeAngle(v, other) > computeAngle(v, w_i)) {
                    // The edge is on the counterclockwise side, so insert it into T
                    T.add(edge);
                }
            }
        });

        // Step 7: Delete from T the edges incident to w_i that lie on the clockwise side
        edges.forEach(edge => {
            const [start, end] = edge;

            // If w_i is an endpoint of the edge, check its position relative to the scan line
            if (w_i === start || w_i === end) {
                const other = w_i === start ? end : start;
                if (computeAngle(v, other) < computeAngle(v, w_i)) {
                    // The edge is on the clockwise side, so remove it from T
                    T.delete(edge);
                }
            }
        });
    }

    // Step 8: Return the list of visible vertices
    return W;
}

/**
 * Helper function to determine if two line segments intersect.
 * This is the same helper function used previously.
 */
function doLinesIntersect(p1, p2, p3, p4) {
    function orientation(p, q, r) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0;  // Collinear
        return val > 0 ? 1 : 2;   // Clockwise or counterclockwise
    }

    function onSegment(p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }

    const o1 = orientation(p1, p2, p3);
    const o2 = orientation(p1, p2, p4);
    const o3 = orientation(p3, p4, p1);
    const o4 = orientation(p3, p4, p2);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    // Special case: check if points are collinear and on segment
    if (o1 === 0 && onSegment(p1, p3, p2)) return true;
    if (o2 === 0 && onSegment(p1, p4, p2)) return true;
    if (o3 === 0 && onSegment(p3, p1, p4)) return true;
    if (o4 === 0 && onSegment(p3, p2, p4)) return true;

    return false;
}
// Example usage
// Define polygon as an array of points
let polygon = [
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

const edges = [];
for (let i = 0; i < polygon.length; i++) {
    edges.push([polygon[i], polygon[(i + 1) % polygon.length]]);
}

const v = { x: 2.5, y: 2.5 };  // Base vertex

const visible = visibleVertices(v, polygon, edges);
//   printToHTML(v);
//   printToHTML(vertices);
//   printToHTML(edges);
//printToHTML(visible);
printToHTML(edges.length);

const canvas = appendCanvas(800, 400);
const helper = new CanvasHelper(canvas);
let extents = getExtents(polygon);
let so = helper.calcScaleAndOffset(extents);
helper.scale = so.scale;
helper.offset = so.offset;
const context = helper.context;
// helper.zoom = 1;
//helper.zoomCenter = helper.canvasCenterPt;
// helper.zoomCenter = {x:150,y:-20};
helper.drawEdges(edges);
context.strokeStyle = 'red';
helper.drawPoint(v);
helper.labelPoint(v, "end");
context.strokeStyle = 'blue';
helper.drawPoints(polygon);
context.strokeStyle = 'grey';
helper.labelPoints(polygon);
// drawPolygon(polygon, canvas, so.scale, so.offset);
