// @ts-check
/*jshint esversion: 6 */

/** @typedef {Array<{x:number,y:number}>} Polygon */
/** @typedef {{x:number, y:number}} Point */
/** @typedef {Array<Point>} Edge */
/** @typedef {Array<Edge>} EdgeList */

const EPS = 0.0 + 0.0000001;
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
   * returns the inside angle at vertex pt2 in degrees.  IE the angle between 
   * vectors 1-2 and 2-3.  Interior is on the right when facing 2 from 1.
   *
   * @param {{x:number, y:number}} pt1
   * @param {{x:number, y:number}} pt2
   * @param {{x:number, y:number}} pt3
   * @returns {number}
   */
function vertexAngle(pt1, pt2, pt3) {
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
 * Helper function to determine if two line segments intersect.
 * @param {{x:number, y:number}} l1Start
 * @param {{x:number, y:number}} l1End
 * @param {{x:number, y:number}} l2Start
 * @param {{x:number, y:number}} l2End
 * @param {number} eps tolerance to use for point intersections
 * @returns {boolean} true if line 1 intersects line 2.
 */
function doLinesIntersect(l1Start, l1End, l2Start, l2End, eps = EPS) {
    function orientation(p, q, r) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0;  // Collinear
        return val > 0 ? 1 : 2;   // Clockwise or counterclockwise
    }

    function onSegment(p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }

    function pointsAreEqual(pt1, pt2) {
        const dx = Math.abs(pt1.x - pt2.x);
        const dy = Math.abs(pt1.y - pt2.y);
        if (dx < EPS && dy < EPS) return true;
        return false;
    }

    // A common end point is not an intersection
    if (pointsAreEqual(l1Start, l2Start)) return false;
    if (pointsAreEqual(l1Start, l2End)) return false;
    if (pointsAreEqual(l1End, l2Start)) return false;
    if (pointsAreEqual(l1End, l2End)) return false;


    const o1 = orientation(l1Start, l1End, l2Start);
    const o2 = orientation(l1Start, l1End, l2End);
    const o3 = orientation(l2Start, l2End, l1Start);
    const o4 = orientation(l2Start, l2End, l1End);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    // Special case: check if points are collinear and on segment
    if (o1 === 0 && onSegment(l1Start, l2Start, l1End)) return true;
    if (o2 === 0 && onSegment(l1Start, l2End, l1End)) return true;
    if (o3 === 0 && onSegment(l2Start, l1Start, l2End)) return true;
    if (o4 === 0 && onSegment(l2Start, l1End, l2End)) return true;

    return false;
}

export class PolygonHelper {

    /**
     * Description placeholder
     *
     * @param {Array<{x:number,y:number}>} polygon
     */
    constructor(polygon) {
        this.polygon = polygon;
        this._eps = Math.abs(0.0000001);
    }

    /** @type {number} */
    get eps() {
        return this._eps;
    }

    /** @param {number} value */
    set eps(value) {
        this._eps = Math.abs(value);
    }

    /**
     * The polygon's extents
     *
     * @readonly
     * @type {{xMin:number, xMax:number, yMin:number, yMax:number}}
     */
    get extents() {
        const ret = {
            xMin: Infinity,
            xMax: -Infinity,
            yMin: Infinity,
            yMax: -Infinity,
        };
        this.polygon.forEach(v => {
            if (ret.xMin == undefined || v.x < ret.xMin) {
                ret.xMin = v.x;
            }
            if (ret.xMax == undefined || v.x > ret.xMax) {
                ret.xMax = v.x;
            }
            if (ret.yMin == undefined || v.y < ret.yMin) {
                ret.yMin = v.y;
            }
            if (ret.yMax == undefined || v.y > ret.yMax) {
                ret.yMax = v.y;
            }
        });
        return ret;
    }

    nextIndex(currentIndex) {
        return ((currentIndex + 1) % this.polygon.length);
    }

    prevIndex(currentIndex) {
        return ((currentIndex + this.polygon.length - 1) % this.polygon.length);
    }


    /**
     * Determines if a point is inside a polygon using the Ray-Casting algorithm.
     * @param {{x: number, y: number}} point - The point to check.
     * @returns {boolean} - True if the point is inside the polygon, false otherwise.
     */
    isPointInPolygon(point) {
        return pointInPolygon(point, this.polygon);
    }

    isVertexConcave(index) {
        const prev = this.polygon[this.prevIndex(index)];// Previous vertex (wrap around)
        const current = this.polygon[index];             // Current vertex
        const next = this.polygon[this.nextIndex(index)];// Next vertex (wrap around)
        const cross = crossProduct(prev, current, next);
        // If cross product is negative, the vertex is concave
        return (cross < 0);
    }

    /**
     * Finds the concave vertices of our polygon.
     * @returns {Array<{x: number, y: number}>} - An array of concave vertices.
     */
    concaveVertices() {
        const concaveVertices = [];
        const n = this.polygon.length;
        for (let i = 0; i < n; i++) {
            const prev = this.polygon[(i - 1 + n) % n];  // Previous vertex (wrap around)
            const current = this.polygon[i];             // Current vertex
            const next = this.polygon[(i + 1) % n];      // Next vertex (wrap around)
            const cross = crossProduct(prev, current, next);
            // If cross product is negative, the vertex is concave
            if (cross < 0) {
                concaveVertices.push(current);
            }
        }
        return concaveVertices;
    }

    /**
     * Determines if the point v1 is visible from point v2, based on current blocking edges.
     * @param {{x: number, y: number}} v1 - The base vertex.
     * @param {{x: number, y: number}} v2 - The vertex to check visibility for.
     * @param {Array<Array<{x:number,y:number}>> | undefined} [edges] - Edges that may block the view.  
     *   If left undefined all edges of the polygon are considered.
     * @returns {boolean} - True if v1<->v2 is visible, false otherwise.
     */
    isVisible(v1, v2, edges = undefined) {
        if (edges == undefined) {
            edges = this.edgeList;
        }
        for (const edge of edges) {
            if (doLinesIntersect(v1, v2, edge[0], edge[1], this.eps)) {
                return false; // w_i is blocked by an edge in T
            }
        }
        return true; // No edge in T blocks the line of sight
    }

    /**
     * get a list of edges of the polygon
     * @returns {Array<Array<{x:number,y:number}>>}
     */
    get edgeList() {
        const p = this.polygon;
        let edges = [];
        const n = p.length;
        for (let i = 0; i < n; i++) {
            edges.push([p[i], p[(i + 1) % n]]);
        }
        return edges;
    }


    /**
     * build a visibility list with concave vertices, plus start and end points.
     *
     * @param {{x:number,y:number}} start
     * @param {{x:number,y:number}} end
     */
    buildVisibilityList(start, end) {
        let vertices = [start, ...this.concaveVertices(), end];
        const allEdges = this.edgeList;
        let visiblePairs = [];
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                let isVisible = this.isVisible(vertices[i], vertices[j], allEdges);
                if (isVisible) {
                    visiblePairs.push([vertices[i], vertices[j]]);
                }
            }
        }
        return visiblePairs;
    }
}