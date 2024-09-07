// @ts-check
import { assert, diff } from "../js/pci/util/assert.mjs";
import { linesIntersect } from "../js/pci/util/lines-intersect.mjs";

/**
 * Main application entry point
 */
const app = async () => {
    console.log("Starting unit tests");
    assert( true, "---------- linesIntersect tests ----------")
    assert(false, "This is just a test to make sure assert() is working");

    let pt1 = { x: 0.0, y: 0.0 };
    let pt2 = { x: 1.0, y: 1.0 };

    let pt3 = { x: 0.0, y: 1.0 };
    let pt4 = { x: 1.0, y: 0.0 };

    let pt5 = { x: 0.4, y: 0.4 };
    let pt6 = { x: 0.5, y: 0.5 };
    
    let result;

    result = linesIntersect(pt1, pt2, pt3, pt4);
    assert(result, "Unit X intersects (1234)");

    result = linesIntersect(pt1, pt3, pt2, pt4);
    assert(result==false, "|| do not intersect (1324)");

    result = linesIntersect(pt1, pt4, pt3, pt2);
    assert(result==false, "= do not intersect (1432)");

    result = linesIntersect(pt1, pt6, pt3, pt4);
    assert(result==true, "/\\ endpoint on 2nd segment(1634)");

    result = linesIntersect(pt1, pt5, pt3, pt4);
    assert(result==false, "/\\ Lines intersect, but segments don't(1534)");

    result = linesIntersect(pt5, pt2, pt3, pt4);
    assert(result==true, "/\\ Segments intersect (5234)");

    result = linesIntersect(pt1, pt2, pt1, pt2);
    assert(result==true, "Segment intersects itself.");

    assert( true, "---------- End of tests ----------")
};

document.addEventListener("DOMContentLoaded", app);
