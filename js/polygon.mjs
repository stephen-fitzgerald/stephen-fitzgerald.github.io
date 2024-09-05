// @ts-check
/*jshint esversion: 6 */

/*---------------------------------------------------------------------------
	linesIntersect() returns non-zero if two line segments intersect.
----------------------------------------------------------------------------*/
function linesIntersect(L1p1, L1p2, L2p1, L2p2) {
    let L1_dx = L1p2.x - L1p1.x;
    let L1_dy = L1p2.y - L1p1.y;
    let L2_dx = L2p2.x - L2p1.x;
    let L2_dy = L2p2.y - L2p1.y;
    let s = (-L1_dy * (L1p1.x - L2p1.x) + L1_dx * (L1p1.y - L2p1.y)) / (-L2_dx * L1_dy + L1_dx * L2_dy);
    let t = (+L2_dx * (L1p1.y - L2p1.y) - L2_dy * (L1p1.x - L2p1.x)) / (-L2_dx * L1_dy + L1_dx * L2_dy);
    //return (s >= 0 && s <= 1 && t >= 0 && t <= 1) ? [L1p1.x + t * L1_dx, L1p1.y + t * L1_dy] : false;
    //let intx = L1p1.x + t * L1_dx;
    //let inty = L1p1.y + t * L1_dy;
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}

/*
    0=inactive, 1=convex, 2=R-corner. 
*/
export class VertexStatus {
    static get kInactive() { return 0; }
    static get kConvex() { return 1; }
    static get kRCorner() { return 2; }
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
export class BarrierScore {
    static get kInvalid() { return 0; }
    static get kValid() { return 1; }
    static get kRemovesStartR() { return 3; }
    static get kRemovesEndR() { return 5; }
    static get kRemovesStartAndEndR() { return 7; }
}

export class Direction {
    static get kForward() { return 1; }
    static get kBackward() { return -1; }
}
const kForward = Direction.kForward;
const kBackward = Direction.kBackward;

export class Vertex {
    constructor(x, y, status = VertexStatus.kInactive) {
        this.x = x;
        this.y = y;
        this.status = status; // 0=inactive, 1=convex, 2=R-corner. 
    }
}

export class Polygon {

    constructor(vertexList = []) {
        this.vertexList = vertexList;
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

    nextVertex(current, dir) {
        let ret = current + dir;
        if (ret > this.lastVertex) ret = this.firstVertex;
        if (ret < this.firstVertex) ret = this.lastVertex;
        return (ret);
    }

    /*---------------------------------------------------------------------------
        nextActiveVertex() finds the next active corner. Returns undefined if none.
    ----------------------------------------------------------------------------*/
    nextActiveVertex(current, dir) {

        if (current < this.firstVertex || current > this.lastVertex)
            throw new RangeError("Vertex out of range.");

        let next = this.nextVertex(current, dir);
        while (next != current) {
            if (this.vertexList[next].status != VertexStatus.kInactive) {
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
        if (Math.abs(dot) < 1e-12) dot = 0.0;

        let theta = Math.atan2(crossAbs, dot) * 180.0 / Math.PI;

        return (180 - theta);
    }

/*---------------------------------------------------------------------------
	lineHitsSide() returns non-zero if a line segment from start to end 
	would intersect any segment of the polygon P.
----------------------------------------------------------------------------*/
	lineHitsSide( start,  end) {

	let				next, i, N, found ;
	let			L1_start, L1_end, L2_start, L2_end ;
	
	N = this.numVertices;
	
	L1_start = this.vertexList[start] ;
	L1_end   = this.vertexList[end] ;
	found = 0 ;
	
	/*-------------------------------------------------------------------
		Check every side, unless it shares a vertex with the given line
	---------------------------------------------------------------------*/
	for( i=0; i<N && !found ; i++ ) {
	
		next = this.nextVertex(i,kForward  ) ;
		
		if( i!=start && i!=end && next!=start && next!=end ) {
		
			L2_start = this.vertexList[i] ;
			L2_end   = this.vertexList[next] ;
			
			if( linesIntersect( L1_start, L1_end , L2_start, L2_end ) ) {
				found = 1 ;
			}
		}
	}
	
	return(found) ;
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
    scoreBarrier(P, start, end, dir) {

        let ret;
        let beforeStart, afterStart, beforeEnd, afterEnd;
        let alpha1, alpha2, beta1, beta2;
        const one80 = 180.0;

        if (start == end) { return (0); }

        beforeStart = this.nextActiveVertex(start, kBackward);
        afterStart = this.nextActiveVertex(start, kForward);
        beforeEnd = this.nextActiveVertex(end, kBackward);
        afterEnd = this.nextActiveVertex(end, kForward);

        if (end == afterStart || end == beforeStart || start == beforeEnd || start == afterEnd) {
            return (0);
        }

        if (dir == kForward) {
            alpha1 = this.vertexAngle(end, start, afterStart);
        } else if (dir == kBackward) {
            alpha1 = this.vertexAngle(beforeStart, start, end);
        }
        if (alpha1 && alpha1 > one80) { return (0); }

        if (dir == kForward) {
            alpha2 = this.vertexAngle(beforeEnd, end, start);
        }
        else if (dir == kBackward) {
            alpha2 = this.vertexAngle(start, end, afterEnd);
        }
        if (alpha2 && alpha2 > one80) { return (0); }

        beta1 = this.vertexAngle(beforeStart, start, afterStart);
        if (alpha1 && beta1 <= alpha1) { return (0); }

        beta2 = this.vertexAngle(beforeEnd, end, afterEnd);
        if (alpha2 && beta2 <= alpha2) { return (0); }

        if (lineHitsSide(P, start, end)) { return (0); }

        ret = 1;

        if (beta1 - alpha1 <= one80) {
            ret += 2;
        }

        if (beta2 > one80 && beta2 - alpha2 <= one80) {
            ret += 4;
        }

        return (ret);
    }

}
