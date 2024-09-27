// @ts-check
/*jshint esversion: 6 */

import { linesIntersect } from "./util/lines-intersect.mjs";
import { sign } from "./util/sign.mjs";

const kEps = 1.0e-33;

/*---------------------------------------------------------------------------
  Direction of traversal around polygon vertices
---------------------------------------------------------------------------*/
const kForward = 1;
const kBackward = -1;

/*---------------------------------------------------------------------------
   vertex status
---------------------------------------------------------------------------*/
const kStatusInactive = 0;
const kStatusConvex = 1;
const kStatusRCorner = 2;

/*---------------------------------------------------------------------------
   scoreBarrier() returns non-zero if barrier from start to end is valid.
---------------------------------------------------------------------------*/
const kBarrierIsInvalid = 0;
const kBarrierIsValid = 1;
const kBarrierRemovesAnR = 3;
const kBarrierRemovesStartR = 3;
const kBarrierRemovesEndR = 5;
const kBarrierRemovesStartAndEndR = 7;


export class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Polygon {

    constructor(vertexList = [], statusList = []) {
        this.vertexList = Array(...vertexList);
        if (statusList == undefined || statusList == []) {
            this.statusList = Array(vertexList.length).fill(0);
        } else if (statusList.length == vertexList.length) {
            this.statusList = Array(...statusList);
        }
        else {
            throw new Error("Status list length does not match vertex list.");
        }
    }

    get firstVertex() {
        return 0;
    }

    get lastVertex() {
        return this.vertexList.length - 1;
    }

    get numVertices() {
        return this.vertexList.length;
    }

    get extents() {
        const ret = {};
        this.vertexList.forEach(v => {
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

    get vertices() {
        const ret = [];
        this.vertexList.forEach((val, indx, array) => {
            ret.push(new Vertex(val.x, val.y));
        });
        return ret;
    }

    /**
     * Add a new Vertex at the point x, y
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    addVertexAt(x, y) {
        this.vertexList.push(new Vertex(x, y));
        this.statusList.push(kStatusInactive);
    }

    insertVertexAt(x, y, before) {
        if (before < this.firstVertex) {
            before = this.firstVertex;
        }
        if (before > this.lastVertex) {
            before = this.lastVertex;
        }
        let v = new Vertex(x, y);
        this.vertexList.splice(before, 0, v);
    }

    /**
     * Returns the index of the next vertex in the given direction
     *
     * @param {number} current
     * @param {number} [dir=kForward]
     * @returns {number}
     */
    nextVertex(current, dir = kForward) {
        let ret = current + dir;
        if (ret > this.lastVertex) ret = this.firstVertex;
        if (ret < this.firstVertex) ret = this.lastVertex;
        return (ret);
    }

    /**
     * returns the next active vertex, or undefined if none.
     *
     * @param {number} current
     * @param {number} dir
     * @returns {number | undefined}
     */
    nextActiveVertex(current, dir) {

        if (current < this.firstVertex || current > this.lastVertex)
            throw new RangeError("Vertex out of range.");

        let next = this.nextVertex(current, dir);
        while (next != current) {
            if (this.statusList[next] != kStatusInactive) {
                return (next);
            }
            next = this.nextVertex(next, dir);
        }
        return (undefined);
    }

    /*---------------------------------------------------------------------------
     vertexAngle() returns the inside angle at vertex v2 in degrees.
     IE the angle between vectors 1-2 and 2-3. 
     Interior is on the right when facing 2 from 1.
    ----------------------------------------------------------------------------*/

    /**
     * returns the inside angle at vertex v2 in degrees.  IE the angle between 
     * vectors 1-2 and 2-3.  Interior is on the right when facing 2 from 1.
     *
     * @param {number} v1
     * @param {number} v2
     * @param {number} v3
     * @returns {number}
     */
    vertexAngle(v1, v2, v3) {

        let pt1, pt2, pt3;
        let N;

        pt1 = this.vertexList[v1];
        pt2 = this.vertexList[v2];
        pt3 = this.vertexList[v3];

        let x1x2 = (pt2.x - pt1.x);
        let x3x2 = (pt3.x - pt2.x);
        let y1y2 = (pt2.y - pt1.y);
        let y3y2 = (pt3.y - pt2.y);

        let crossAbs = x1x2 * y3y2 - x3x2 * y1y2;
        let dot = x1x2 * x3x2 + y3y2 * y1y2;
        if (Math.abs(dot) < kEps) dot = 0.0;

        let theta = Math.atan2(crossAbs, dot) * 180.0 / Math.PI;

        return (180 - theta);
    }

    /*---------------------------------------------------------------------------
        lineHitsSide() returns non-zero if a line segment from start to end 
        would intersect any segment of the polygon P.
    ----------------------------------------------------------------------------*/

    /**
     * returns non-zero if a line segment from start to end would intersect any 
     * segment of this polygon
     *
     * @param {number} start - index of vertex at start of line
     * @param {number} end - index of vertex at end of line
     * @returns {boolean}
     */
    lineHitsSide(start, end) {

        let next, i, N, found;
        let L1_start, L1_end, L2_start, L2_end;

        N = this.numVertices;

        L1_start = this.vertexList[start];
        L1_end = this.vertexList[end];
        found = false;

        /*-------------------------------------------------------------------
            Check every side, unless it shares a vertex with the given line
        ---------------------------------------------------------------------*/
        for (i = 0; i < N && !found; i++) {

            next = this.nextVertex(i, kForward);

            if (i != start && i != end && next != start && next != end) {

                L2_start = this.vertexList[i];
                L2_end = this.vertexList[next];

                if (linesIntersect(L1_start, L1_end, L2_start, L2_end)) {
                    found = true;
                }
            }
        }

        return (found);
    }

    /*---------------------------------------------------------------------------
    scoreBarrier() returns non-zero if barrier from start to end is valid.
    It returns :
                0 : Barrier is invalid
                1 : Barrier is valid
                3 : Barrier is valid, and removes the R-corner at start.
                5 : Barrier is valid, and removes an R-Corner at end.
                7 : Barrier is valid, and removes 2 R-corners.	
    ---------------------------------------------------------------------------*/
    //int	scoreBarrier(PolyHndl P,int start, int end, int dir ) {
    scoreBarrier(start, end, dir) {

        let ret;
        let beforeStart, afterStart, beforeEnd, afterEnd;
        let alpha1, alpha2, beta1, beta2;
        const one80 = 180.0;

        if (start == end) { return (kBarrierIsInvalid); }

        if (start == undefined || start < 0 || start > this.lastVertex) {
            throw new Error("Bad start point.");
        }
        if (end == undefined || end < 0 || end > this.lastVertex) {
            throw new Error("Bad end point.");
        }

        beforeStart = this.nextActiveVertex(start, kBackward);
        afterStart = this.nextActiveVertex(start, kForward);
        beforeEnd = this.nextActiveVertex(end, kBackward);
        afterEnd = this.nextActiveVertex(end, kForward);

        if (beforeStart == undefined || afterStart == undefined ||
            beforeEnd == undefined || afterEnd == undefined) {
            throw new Error("Bad start or end point.");
        }

        if (end == afterStart || end == beforeStart || start == beforeEnd || start == afterEnd) {
            return (kBarrierIsInvalid);
        }

        if (dir == kForward) {
            alpha1 = this.vertexAngle(end, start, afterStart);
        } else if (dir == kBackward) {
            alpha1 = this.vertexAngle(beforeStart, start, end);
        }
        if (alpha1 && alpha1 > one80) { return (kBarrierIsInvalid); }

        if (dir == kForward) {
            alpha2 = this.vertexAngle(beforeEnd, end, start);
        }
        else if (dir == kBackward) {
            alpha2 = this.vertexAngle(start, end, afterEnd);
        }
        if (alpha2 && alpha2 > one80) { return (kBarrierIsInvalid); }

        beta1 = this.vertexAngle(beforeStart, start, afterStart);
        if (alpha1 && beta1 <= alpha1) { return (kBarrierIsInvalid); }

        beta2 = this.vertexAngle(beforeEnd, end, afterEnd);
        if (alpha2 && beta2 <= alpha2) { return (kBarrierIsInvalid); }

        if (this.lineHitsSide(start, end)) { return (kBarrierIsInvalid); }

        ret = 1;

        if (alpha1 && beta1 - alpha1 <= one80) {
            ret += 2;
        }

        if (alpha2 && beta2 > one80 && beta2 - alpha2 <= one80) {
            ret += 4;
        }

        return (ret);
    }

    get isConvex() {

        let i, N;
        let nx, ny;
        let x_dir, y_dir, new_x_dir, new_y_dir;

        N = this.numVertices;

        /* check for empty polygon */
        if (N < 3) { throw new Error("Polygon needs at least 3 vertices"); }

        /* Triangles are always convex */
        if (N == 3) { return (true); }

        /* Get initial direction of polygon edge */
        x_dir = sign(this.vertexList[0].x - this.vertexList[this.lastVertex].x);
        y_dir = sign(this.vertexList[0].y - this.vertexList[this.lastVertex].y);

        /* nx & ny are number of sign changes in dx & dy */
        nx = ny = 0;

        /* loop through edges looking for direction changes */

        for (i = 0; i < N - 1; i++) {
            new_x_dir = sign(this.vertexList[i + 1].x - this.vertexList[i].x);
            new_y_dir = sign(this.vertexList[i + 1].y - this.vertexList[i].y);

            if (new_x_dir * x_dir == -1) nx++;
            if (new_y_dir * y_dir == -1) ny++;

            if (new_x_dir != 0)
                x_dir = new_x_dir;
            if (new_y_dir != 0)
                y_dir = new_y_dir;
        }

        /* if x and y travel changes sign less than thrice polygon is convex */
        if (nx <= 2 && ny <= 2) {
            return (true);
        } else {
            return (false);
        }
    }

    /*---------------------------------------------------------------------------
        UpdateStatus() updates the status field for each vertex
        0=inactive, 1=convex, 2=R-corner. 
    ----------------------------------------------------------------------------*/
    updateStatus() {

        let prev, next;
        let angle;

        /* Mark R corners and convex corners */
        for (let i = 0; i < this.numVertices; i++) {
            next = this.nextVertex(i, kForward);
            prev = this.nextVertex(i, kBackward);
            angle = this.vertexAngle(prev, i, next);
            if (angle <= 180.0) {
                this.statusList[i] = kStatusConvex;
            } else {
                this.statusList[i] = kStatusRCorner;
            }
        }
    }
    /*---------------------------------------------------------------------------
        isRCorner() returns non-zero if current is R-corner.
    ----------------------------------------------------------------------------*/
    isRCorner(current) {
        return (this.statusList[current] == kStatusRCorner);
    }

    /**
     * 
     * @param {number} start starting vertex (0 - N-1)
     * @param {number} dir direction 1 or -1
     * @returns {number | undefined } index of next R corner from curr in direction dir, or undefined
     */
    nextRCorner(start, dir) {
        let ret = undefined;
        let i = this.nextActiveVertex(start, dir);
        while (i != undefined && i != start) {
            if (this.isRCorner(i)) {
                return (i);
            }
            i = this.nextActiveVertex(i, dir);
        }
        return (ret);
    }

    /*---------------------------------------------------------------------------
        cnvxPolyArea() calculates the area of a convex sub-polygon of P.
        The sub-poly starts at start and ends at end, traveling in direction
        dir. Only active vertices are considered.
    ----------------------------------------------------------------------------*/

    cnvxPolyArea(start, end, dir) {

        let i, ip1, N;
        let xi, yi, xip1, yip1;
        let area = 0.0;

        xi = this.vertexList[end].x;
        yi = this.vertexList[end].y;
        xip1 = this.vertexList[start].x;
        yip1 = this.vertexList[start].y;
        area = (xi * yip1 - xip1 * yi);

        i = ip1 = start;

        while (ip1 != end) {
            i = ip1;
            ip1 = this.nextActiveVertex(i, dir);
            xi = this.vertexList[i].x;
            yi = this.vertexList[i].y;
            // @ts-ignore
            xip1 = this.vertexList[ip1].x;
            // @ts-ignore
            yip1 = this.vertexList[ip1].y;
            area += (xi * yip1 - xip1 * yi);
        };

        return (Math.abs(area) / 2.0);
    }

    /*-----------------------------------------------------------------------------
        removeSubPoly() deactivates all the active vertices between start and end.
        start is set to convex if score = 3 or 7, end is set to convex if score
        = 5 or 7.
    ------------------------------------------------------------------------------*/

    removeSubPoly(start, end, dir, score) {

        if (score == 3 || score == 7) {
            this.statusList[start] = kStatusConvex;
        }

        if (score == 5 || score == 7) {
            this.statusList[end] = kStatusConvex;
        }

        let i = this.nextActiveVertex(start, dir);
        while (i != undefined && i != end) {
            this.statusList[i] = kStatusInactive;
            i = this.nextActiveVertex(i, dir);
        }
    }

    /*---------------------------------------------------------------------------
        PolyArea() calculates the area of a simple, but not necessarily
        convex, polygon.
    ----------------------------------------------------------------------------*/

    get area() {

        let bStart, bEnd, currentDir;
        let bestStart, bestEnd, bestScore, bestDir;
        let thisScore;
        let area = 0.0, subPolyArea = 0.0;

        area = 0.0;
        bStart = 0;

        /*-------------------------------------------------------------
            Update the status field of each vertex in the polygon.
            This is where we determine which vertices are R-Corners.
        ---------------------------------------------------------------*/
        this.updateStatus();

        /*-------------------------------------------------------------
            Eliminate all R-Corners in the polygon by finding valid
            barriers, and removing the convex sub-polygons they bound.
        ---------------------------------------------------------------*/
        while ((bStart = this.nextRCorner(bStart, kForward)) != undefined) {

            bestStart = bestEnd = bestScore = bestDir = 0;
            thisScore = 0;

            /*--------------------------------------------------------
                Search for a valid barrier from bStart to any 
                active Vertex, bEnd.
            ----------------------------------------------------------*/
            currentDir = kForward;
            bEnd = this.nextActiveVertex(bStart, currentDir);

            /*-----------------------------------------------------------
                Search forwards for a valid barrier.
            ------------------------------------------------------------*/
            while (bEnd != undefined && !this.isRCorner(bEnd)
                && bestScore < kBarrierRemovesAnR) {

                bEnd = this.nextActiveVertex(bEnd, currentDir);

                thisScore = this.scoreBarrier(bStart, bEnd, currentDir);

                /*----------------------------------------------------
                    If this is the best barrier so far, save it.
                -----------------------------------------------------*/
                if (thisScore > bestScore) {
                    bestScore = thisScore;
                    bestStart = bStart;
                    bestEnd = bEnd;
                    bestDir = currentDir;
                }

            } /* while() - End of forwards barrier search for current R-corner  */

            /*-----------------------------------------------------------
                Search backwards for a valid barrier.
            ------------------------------------------------------------*/
            currentDir = kBackward;
            bEnd = this.nextActiveVertex(bStart, currentDir);

            while (bEnd != undefined && !this.isRCorner(bEnd)
                && bestScore < kBarrierRemovesAnR) {

                bEnd = this.nextActiveVertex(bEnd, currentDir);

                thisScore = this.scoreBarrier(bStart, bEnd, currentDir);

                /*----------------------------------------------------
                    If this is the best barrier so far, save it.
                -----------------------------------------------------*/
                if (thisScore > bestScore) {
                    bestScore = thisScore;
                    bestStart = bStart;
                    bestEnd = bEnd;
                    bestDir = currentDir;
                }

            } /* while() - End of backwards barrier search for current R-corner  */

            /*---------------------------------------------------------
                If a barrier is found add the sub-polygon area to
                our total, and remove the sub-polygon.
            -----------------------------------------------------------*/
            if (bestScore > 0) {
                subPolyArea = this.cnvxPolyArea(bestStart, bestEnd, bestDir);
                area += subPolyArea;
                this.removeSubPoly(bestStart, bestEnd, bestDir, bestScore);
            }

        }  /* while() - All R-corners have been delt with.  */

        /*---------------------------------------------------------------
            The remaining vertices form a convex polygon.
        ----------------------------------------------------------------*/
        bStart = this.nextActiveVertex(0, kForward);
        // @ts-ignore
        bEnd = this.nextActiveVertex(bStart, kBackward);
        area += this.cnvxPolyArea(bStart, bEnd, kForward);

        return (area);
    }

}
