
const kEps = 1.0e-33;

/**
 * Returns true if two segements intersect
 *
 * @export
 * @param {{x: number, y: number}} start1 - line 1 start
 * @param {{x: number, y: number}} end1 - line 1 end
 * @param {{x: number, y: number}} start2 - line 2 start
 * @param {{x: number, y: number}} end2 - line 2 end
 * 
 * @returns {boolean} true if segments intersect
 */
export function linesIntersect(start1, end1, start2, end2) {

    const abs = Math.abs;

    // bounding boxes of the two segments
    let x1max = Math.max(start1.x, end1.x);
    let x1min = Math.min(start1.x, end1.x);
    let y1max = Math.max(start1.y, end1.y);
    let y1min = Math.min(start1.y, end1.y);

    let x2max = Math.max(start2.x, end2.x);
    let x2min = Math.min(start2.x, end2.x);
    let y2max = Math.max(start2.y, end2.y);
    let y2min = Math.min(start2.y, end2.y);

    //	If the boxes do not intersect, then the segments don't either.
    if (x1max < x2min || x1min > x2max || y1max < y2min || y1min > y2max) {
        return (false);
    }

    let L1dx = end1.x - start1.x;
    let L1dy = end1.y - start1.y;
    let L2dx = end2.x - start2.x;
    let L2dy = end2.y - start2.y;

    /*---------------------------------------------------------------------
        If the boxes intersect, and both segments are either horizontal or 
        vertical then the segments intersect.
    ---------------------------------------------------------------------*/
    if ((abs(L1dx) < kEps || abs(L1dy) < kEps)
        && (abs(L2dx) < kEps || abs(L2dy) < kEps)) {
        return (true);
    }

    // if any end points are common then segments intersect
    if (abs(start1.x - start2.x) < kEps && abs(start1.y - start2.y) < kEps) return true;
    if (abs(start1.x - end2.x) < kEps && abs(start1.y - end2.y) < kEps) return true;
    if (abs(end1.x - start2.x) < kEps && abs(end1.y - start2.y) < kEps) return true;
    if (abs(end1.x - end2.x) < kEps && abs(end1.y - end2.y) < kEps) return true;

    let s = (-L1dy * (start1.x - start2.x) + L1dx * (start1.y - start2.y)) / (-L2dx * L1dy + L1dx * L2dy);
    let t = (+L2dx * (start1.y - start2.y) - L2dy * (start1.x - start2.x)) / (-L2dx * L1dy + L1dx * L2dy);

    //let intx = start1.x + t * L1dx;
    //let inty = start1.y + t * L1dy;
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}
