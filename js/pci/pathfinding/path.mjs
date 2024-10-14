// @ts-check
/*jshint esversion: 6 */

import { assert, diff } from "../util/assert.mjs";
import { Polygon } from "../polygon.mjs";
import { printToHTML, syntaxHighlight } from "../util/print-to-html.mjs";

const eps = 1.0;

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

    openList.push(start);

    while (openList.length > 0) {
        // Get node with the lowest f value
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

        for (let neighbor of currentNode.neighbors) {
            if (closedList.find(node => node === neighbor)) {
                continue;  // Skip neighbors that are in the closed list
            }

            let gScore = currentNode.g + distance(currentNode, neighbor);  // New g score
            // let inOpen = openList.find(node => node.x === neighbor.x && node.y === neighbor.y);
            let inOpen = openList.find(node => node === neighbor);

            if (!inOpen || gScore < neighbor.g) {
                neighbor.g = gScore;
                neighbor.h = heuristic(neighbor, goal);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentNode;

                if (!inOpen) {
                    openList.push(neighbor);  // Add neighbor to open list if it's not already there
                }
            }
        }
    }

    return [];  // No path found
}

/**
 * Calculates the heuristic distance (Euclidean) between a node and the goal.
 * @param {Node} node - The current node.
 * @param {Node} goal - The goal node.
 * @returns {number} - The heuristic cost to the goal.
 */
function heuristic(node, goal) {
    return distance(node, goal);
}

/**
 * Calculates the Euclidean distance between two nodes.
 * @param {Node} nodeA - The first node.
 * @param {Node} nodeB - The second node.
 * @returns {number} - The distance between the two nodes.
 */
function distance(nodeA, nodeB) {
    return Math.sqrt((nodeB.x - nodeA.x) ** 2 + (nodeB.y - nodeA.y) ** 2);
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

// Example usage
// Define polygon as an array of points
let polygon = [
    new Node(0, 0),
    new Node(1, 0),
    new Node(1, 1),
    new Node(2, 1),
    new Node(2, 0),
    new Node(3, 0),
    new Node(3, 3),
    new Node(2, 3),
    new Node(2, 2),
    new Node(1, 2),
    new Node(1, 3),
    new Node(0, 3),
];

let start = new Node(0.75, 2.75);
let goal = new Node(2.25, 2.75);

start.neighbors = [polygon[2], polygon[9]];
polygon[2].neighbors = [start, polygon[3], polygon[8], polygon[9]];
polygon[3].neighbors = [goal, polygon[2], polygon[8], polygon[9]];
polygon[8].neighbors = [goal, polygon[2], polygon[3], polygon[9]];
polygon[9].neighbors = [start, polygon[2], polygon[3], polygon[8]];
goal.neighbors = [polygon[3], polygon[8]];

let path = aStar(start, goal);
printToHTML(path);
console.log(path);  // Outputs the path found
