// @ts-check
/*jshint esversion: 6 */

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
     * @param {Array<Node>} [neighbors=[]] - The nodes connected to this node.
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
 * Determines if a point is inside a polygon using the Ray-Casting algorithm.
 * @param {{x: number, y: number}} point - The point to check.
 * @param {Array<{x: number, y: number}>} polygon - An array of points representing the polygon's vertices.
 * @returns {boolean} - True if the point is inside the polygon, false otherwise.
 */
export function pointInPolygon(point, polygon) {
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
    * returns the inside angle at vertex pt2 in degrees.  IE the angle between 
    * vectors 1-2 and 2-3.  Interior is on the right when facing 2 from 1.
    *
    * @param {{x:number, y:number}} pt1
    * @param {{x:number, y:number}} pt2
    * @param {{x:number, y:number}} pt3
    * @returns {number}
    */
export function vertexAngle(pt1, pt2, pt3) {

    let x1x2 = (pt2.x - pt1.x);
    let x3x2 = (pt3.x - pt2.x);
    let y1y2 = (pt2.y - pt1.y);
    let y3y2 = (pt3.y - pt2.y);

    let crossAbs = x1x2 * y3y2 - x3x2 * y1y2;
    let dot = x1x2 * x3x2 + y3y2 * y1y2;
    // if (Math.abs(dot) < kEps) dot = 0.0;
    let theta = Math.atan2(crossAbs, dot) * 180.0 / Math.PI;

    return (180 - theta);
}


/**
 * get the vertices that are concave
 *
 * @export
 * @param {Array<{x:number,y:number}>} polygon
 * @returns {Array<{x:number,y:number}>}
 */
export function getConcaveVertices(polygon) {
    let ret = [];
    let curr, prev, next;
    let angle;
    const N = polygon.length;

    for (curr = 0; curr < this.numVertices; curr++) {
        next = (curr + 1) % N;
        prev = (curr + N - 1) % N;
        angle = vertexAngle(polygon[prev], polygon[curr], polygon[next]);
        if (angle > 180.0) {
            ret.push(polygon[curr]);
        }
    }
    return ret;
}

//-------GPT----------------------

/**
 * Calculates the cross product of vectors (p1->p2) and (p2->p3).
 * @param {{x: number, y: number}} p1 - The first point.
 * @param {{x: number, y: number}} p2 - The second point (current vertex).
 * @param {{x: number, y: number}} p3 - The third point.
 * @returns {number} - The cross product value.
 */
function crossProduct(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
}

/**
 * Finds the concave vertices of a polygon.
 * @param {Array<{x: number, y: number}>} polygon - An array of points representing the polygon's vertices.
 * @returns {Array<{x: number, y: number}>} - An array of concave vertices.
 */
export function findConcaveVertices(polygon) {
    const concaveVertices = [];
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
        const prev = polygon[(i - 1 + n) % n];  // Previous vertex (wrap around)
        const current = polygon[i];             // Current vertex
        const next = polygon[(i + 1) % n];      // Next vertex (wrap around)
        // Calculate cross product of vectors (prev -> current) and (current -> next)
        const cross = crossProduct(prev, current, next);
        // If cross product is negative, the vertex is concave
        if (cross < 0) {
            concaveVertices.push(current);
        }
    }
    return concaveVertices;
}


/**
 * Determines if two line segments (p1->p2 and p3->p4) intersect.
 * @param {{x: number, y: number}} p1 - First point of the first segment.
 * @param {{x: number, y: number}} p2 - Second point of the first segment.
 * @param {{x: number, y: number}} p3 - First point of the second segment.
 * @param {{x: number, y: number}} p4 - Second point of the second segment.
 * @returns {boolean} - True if the segments intersect, false otherwise.
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

/**
 * Checks if two concave vertices can "see" each other (i.e., no polygon edge crosses the line between them).
 * @param {{x: number, y: number}} v1 - The first concave vertex.
 * @param {{x: number, y: number}} v2 - The second concave vertex.
 * @param {Array<{x: number, y: number}>} polygon - The polygon's vertices.
 * @returns {boolean} - True if v1 and v2 can see each other, false otherwise.
 */
export function canSeeEachOther(v1, v2, polygon) {
    // check each edge of the polygon
    for (let i = 0; i < polygon.length; i++) {
        const edgeStart = polygon[i];
        const edgeEnd = polygon[(i + 1) % polygon.length];
        // to see if it intersects the line between v1 and v2
        if (doLinesIntersect(v1, v2, edgeStart, edgeEnd)) {
            return false;  // if so v1/2 is not visible from v2/1
        }
    }
    return true;  // if the line v1-v2 does not cross any polygon edge
}

/**
 * Returns the pairs of points that can "see" each other.
 * @param {Array<{x: number, y: number}>} points - The points to check.
 * @param {Array<{x: number, y: number}>} polygon - The polygon's vertices.
 * @returns {Array<{p1:{x: number, y: number}, p2:{x: number, y: number}}>} - An array of convex vertex pairs that can see each other.
 */
export function findVisiblePoints(points, polygon) {
    const visiblePairs = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];
            // Check if these two points can see each other
            if (canSeeEachOther(p1, p2, polygon)) {
                visiblePairs.push({ p1: p1, p2: p2 });
            }
        }
    }
    return visiblePairs;
}

// Example usage
const _polygon = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 5, y: 5 },   // Concave point
    { x: 0, y: 10 }
];

const _concaveVertices = [
    { x: 5, y: 5 },   // Example concave vertex
    { x: 7, y: 7 }    // Another concave vertex, for example
];

const visiblePairs = findVisiblePoints(_concaveVertices, _polygon);
console.log(visiblePairs);  // Outputs index pairs of concave vertices that can see each other
