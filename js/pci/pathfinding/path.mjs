// @ts-check
/*jshint esversion: 6 */

import { printToHTML, syntaxHighlight, appendCanvas } from "../util/print-to-html.mjs";
import { CanvasMouseTracker } from "./CanvasMouseTracker.mjs";


class Graph {
    // Map() with nodes as keys, and nodes as values.
    // nodes are {x,y} points, + extra graph-related data: f,g,h,parent.
    adjacencyList;

    constructor() {
        this.adjacencyList = new Map();
    }

    addNode(node) {
        this.adjacencyList.set(node, new Set());
    }

    addEdge(node1, node2) {
        this.adjacencyList.get(node1).add(node2);
        this.adjacencyList.get(node2).add(node1);
    }

    getNeighboors(node) {
        return this.adjacencyList.get(node);
    }

    hasEdge(node1, node2) {
        return this.adjacencyList.get(node1).has(node2);
    }


    /**
     * Create a graph node at an x,y point
     *
     * @static
     * @param {{x:number, y:number}} pt
     * @returns {{pt:{x:number, y:number}, f:number, g:number, h:number, parent:any}}
     */
    addNodeForPt(pt) {
        let n = {
            pt: pt,
            f: 0.0,
            g: 0.0,
            h: 0.0,
            parent: null,
        };
        this.adjacencyList.set(n, new Set());
        return n;
    }

    getNodeForPt(pt) {
        this.adjacencyList.forEach((_value, key) => {
            if (key.pt === pt)
                return key;
        });
        return undefined;
    }
}

/**
 * Class representing a node in the A* algorithm.
 */
class Node {
    /**
     * Creates a node.
     * @param {number} x - The x-coordinate of the node.
     * @param {number} y - The y-coordinate of the node.
     * @param {number} [g=0] - The cost from the start node to this node.
     * @param {number} [h=0] - The heuristic cost from this node to the goal.
     * @param {Node|null} [parent=null] - The parent node.
     */
    constructor(x, y, g = 0, h = 0, neighbors = [], parent = null) {
        this.x = x;
        this.y = y;
        this.g = g;  // Cost from start to this node
        this.h = h;  // Heuristic cost to goal
        this.f = g + h;  // Total cost (g + h)
        this.parent = parent;
        this.neighbors = neighbors;
    }
}

/**
 * Implements the A* pathfinding algorithm.
 * @param {Node} start - The start pt.
 * @param {Node} goal - The goal pt.
 * @returns {Array<{x: number, y: number}>} - The path from the start to the goal, or an empty array if no path is found.
 */
function aStar(start, goal) {
    let openList = [];
    let closedList = [];

    function heuristic(node, goal) {
        return distance(node, goal);
    }

    function distance(nodeA, nodeB) {
        return Math.sqrt((nodeB.x - nodeA.x) ** 2 + (nodeB.y - nodeA.y) ** 2);
    }

    openList.push(start);

    while (openList.length > 0) {
        // Get node with the lowest f value from the open list
        let currentNode = openList.reduce((lowest, node) => lowest.f < node.f ? lowest : node);

        // If we've reached the goal, return the path
        if (currentNode === goal) {
            let path = [];
            let temp = currentNode;
            while (temp != null) {
                path.push({ x: temp.x, y: temp.y });
                temp = temp.parent;
            }
            return path.reverse();  // Return the path from start to goal
        }

        // Remove current node from open list and add to closed list
        openList = openList.filter(node => node !== currentNode);
        closedList.push(currentNode);

        // go through all of the current node's neighbors
        for (let neighbor of currentNode.neighbors) {

            // Skip neighbors that are in the closed list
            if (closedList.find(node => node === neighbor)) {
                continue;
            }

            // Calculate the new g score from the start to this neighbor
            let gScore = currentNode.g + distance(currentNode, neighbor);

            // if neighbor not in the open list, or this new path has a lower gScore
            // add it to, or update it in, the open list with updated g, h, f scores & parent
            let inOpen = openList.find(node => node === neighbor);
            if (!inOpen || gScore < neighbor.g) {
                neighbor.g = gScore;
                neighbor.h = heuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;
                // Add neighbor to open list if it's not already there
                if (!inOpen) {
                    openList.push(neighbor);
                }
            }
        }
    }
    return [];  // No path found
}


/**
 * Determines if a point is inside a polygon using the Ray-Casting algorithm.
 * @param {{x: number, y: number}} point - The point to check.
 * @param {Array<{x: number, y: number}>} polygon - An array of points representing the polygon's vertices.
 * @returns {boolean} - True if the point is inside the polygon, false otherwise.
 */
function pointInPolygon(point, polygon) {
    let x = point.x, y = point.y;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;

        let intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}


/**
 * Get the extents of an array of x,y points
 *
 * @param {Array<{ x: number; y: number; }>} points
 * @returns {{ xmin: any; xmax: number; ymin: any; ymax: number; }}
 */
function getExtents(points) {
    let ret = { xmin: Infinity, xmax: -Infinity, ymin: Infinity, ymax: -Infinity };
    for (let i = 0; i < points.length; i++) {
        let x = points[i].x;
        let y = points[i].y;
        if (x < ret.xmin) ret.xmin = x;
        if (x > ret.xmax) ret.xmax = x;
        if (y < ret.ymin) ret.ymin = y;
        if (y > ret.ymax) ret.ymax = y;

    }
    return ret;
}


/**
 * get the scale and offset to center an object with extents into a canvas
 * so that it covers 80% of the area.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{xmin:number, xmax:number, ymin:number, ymax:number}} extents
 * @param {number} [coverFactor=0.80] defaults to 80%
 * @returns {{ scale: { x: number; y: number; }; offset: { x: number; y: number; }; }}
 */
function scaleAndOffset(canvas, extents, coverFactor = 0.80) {
    const width = extents.xmax - extents.xmin;
    const height = extents.ymax - extents.ymin;

    // Calculate the scale factor to fit the extents in the canvas
    const scaleFactor = 0.80 * Math.min(canvas.width / width, canvas.height / height);

    // Calculate the dimensions of the scaled extents
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;

    // Calculate the offsets to center the extents in the canvas
    const xOffset = (canvas.width - scaledWidth) / 2;
    const yOffset = (canvas.height - scaledHeight) / 2;

    // Return the calculated scale and offsets
    return {
        scale: { x: scaleFactor, y: scaleFactor },
        offset: { x: xOffset, y: yOffset }
    };
}


/**
 * Draw a border around an HTMLCanvasElement
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} [inset=1.5]
 */
function drawBorder(canvas, inset = 1.5) {
    const context = canvas.getContext('2d');
    if (!context) return;
    context.beginPath();
    context.moveTo(inset, inset);
    context.lineTo(context.canvas.width - inset, inset);
    context.lineTo(context.canvas.width - inset, context.canvas.height - inset);
    context.lineTo(inset, context.canvas.height - inset);
    context.lineTo(inset, inset);
    context.stroke();
}



/**
 * Draw a polygon in an HTMLCanvasElement.
 * Note that y=0 is at the bottom of the canvas.
 *
 * @param {Array<{x:number, y:number}>} p
 * @param {HTMLCanvasElement} canvas
 * @param {{x:number,y:number}} scale
 * @param {{x:number,y:number}} offset
 */
function drawPolygon(p, canvas, scale, offset) {
    drawPath(p, canvas, scale, offset, true);
}


/**
 * Draw a path of lines on a canvas using the scale factor and offset. 
 * The path is defined by an array of x,y points.
 * If close is true, a line will be drawn between the last & first points, 
 * closing the loop.
 *
 * @param {Array<{x:number, y:number}>} path
 * @param {HTMLCanvasElement} canvas
 * @param {{x:number,y:number}} scale
 * @param {{x:number,y:number}} offset
 * @param {boolean} [close=false] if true close the loop
 */
function drawPath(path, canvas, scale, offset, close = false) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const yMax = context.canvas.height;
    const vertices = path.map((v, i) => {
        return {
            x: Math.floor(offset.x + v.x * scale.x) + 0.5,
            y: Math.floor(yMax - (offset.y + v.y * scale.y)) + 0.5
        };
    });
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
        context.lineTo(vertices[i].x, vertices[i].y);
    }
    if (close) {
        context.lineTo(vertices[0].x, vertices[0].y);
    }
    context.stroke();
}

// Example usage
// Define polygon as an array of points
let polygon = [
    new Node(0, 0),
    new Node(1, 0),
    new Node(1, 1),
    new Node(2, 1),
    new Node(2, 0),
    new Node(3.25, 0),
    new Node(3, 3),
    new Node(2, 3),
    new Node(2, 2),
    new Node(1, 2),
    new Node(1, 3),
    new Node(0, 3),
];

let start = new Node(0.75, 2.75);
let goal = new Node(2.05, 0.15);

start.neighbors = [polygon[2], polygon[9]];
polygon[2].neighbors = [start, polygon[3], polygon[8], polygon[9]];
polygon[3].neighbors = [goal, polygon[2], polygon[8], polygon[9]];
polygon[8].neighbors = [goal, polygon[2], polygon[3], polygon[9]];
polygon[9].neighbors = [start, polygon[2], polygon[3], polygon[8]];
goal.neighbors = [polygon[3], polygon[8]];

let path = aStar(start, goal);
printToHTML(path);

const canvas = appendCanvas(800, 400);
if (!canvas)
    throw new Error("Could not create HTMLCanvasElement");

// const context = canvas.getContext('2d');
// if (!context)
//     throw new Error("Graphics context (CanvasContext2d) not found");

// const extents = getExtents(polygon);

// const { scale, offset } = scaleAndOffset(canvas, extents);

// context.lineWidth = 1;

// context.strokeStyle = 'blue';
// drawBorder(canvas);

// context.strokeStyle = 'black';
// drawPolygon(polygon, canvas, scale, offset);

// context.strokeStyle = 'red';
// drawPath(path, canvas, scale, offset);

printToHTML("done");

let tracker = new CanvasMouseTracker(canvas, polygon, path);
//tracker.polygon = polygon;

