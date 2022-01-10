// @ts-check
/*jshint esversion: 6 */

import { ORIENTATION } from "./orientation.mjs";

/**
 * A PlySpec describes the layup position of a tubular layer of material.
 *
 * start, taperStart, taperEnd, end and widthAtStart, widthAtEnd define width = f(x)
 * x1->x2 constant width = widthAtStart
 * x2->x3 transition from widthAtStart to widthAtEnd
 * x3->x4 constant width = widthAtEnd
 * Setting x1=x2, x2=x3 or x3=x4 eliminates one (or more) of the three sections
 *
 * Width is always measured perpendicular to the tube axis.
 *
 * An angle other than 0 or 90 degrees indicates a spiral wrap.
 *
 * upright orientation indicates the "top" of the layer is oriented outwards
 *
 * numPieces is the number of identical pieces in the PlySpec
 *
 * startAngles[] is an array of the starting angles ("clocking") for each piece
 *
 * @param {object} options
 * @param {object} options.layer Solid, Fiber, Prepreg, Release, Braided or Fabric Layer
 * @param {number} options.start start position on x axis, in meters
 * @param {number} options.end end position on x axis, in meters
 * @param {number} [options.widthAtStart] width of layer at start, in meters
 * @param {number} [options.widthAtEnd] width of layer at end, in meters
 * @param {number} [options.taperStart] position where ply width taper starts, in meters
 * @param {number} [options.taperEnd] position where ply width taper ends, in meters
 * @param {number} [options.angle] layup angle, in degrees
 * @param {Object} [options.orientation] upright or not (1=upright,-1=flipped)
 * @param {number} [options.numPieces] no. of identical pieces distributed around perimeter
 * @param {number} [options.clocking] start angle of 1st pc, rest are distributed on the circumference, in degrees
 */

export class PlySpec {
    constructor(options) {

        this.layer = options == undefined ? undefined : options.layer;
        this.start = 0.0;
        this.end = 1.0;
        this.widthAtStart = 1.0;
        this.widthAtEnd = 1.0;
        this.taperStart = this.start;
        this.taperEnd = this.end;
        this.angle = 0.0;
        this.orientation = ORIENTATION.UPRIGHT;
        this.numPieces = 1.0;
        this.clocking = 0.0;

        if (options) {
            this.layer = options.layer == undefined ? this.layer : options.layer;
            this.start = options.start == undefined ? this.start : options.start;
            this.end = options.end == undefined ? this.end : options.end;
            this.widthAtStart = options.widthAtStart == undefined ? this.widthAtStart : options.widthAtStart;
            this.widthAtEnd = options.widthAtEnd == undefined ? this.widthAtEnd : options.widthAtEnd;
            this.taperStart = options.taperStart == undefined ? this.start : options.taperStart;
            this.taperEnd = options.taperEnd == undefined ? this.end : options.taperEnd;
            this.angle = options.angle == undefined ? this.angle : options.angle;
            this.orientation = options.orientation == undefined ? this.orientation : options.orientation;
            this.numPieces = options.numPieces == undefined ? this.numPieces : options.numPieces;
            this.clocking = options.clocking == undefined ? this.clocking : options.clocking;

            if (this.layer == undefined) {
                throw new Error("Solid, Fiber, Prepreg, Release, Braided or Fabric Layer must be provided for ply specification.");
            }
            if (this.end <= this.start) {
                throw new Error("End Position must be greater than start position.");
            }
            if (this.taperStart < this.start) {
                console.log("Taper start less than start position.");
                this.taperStart = this.start;
            }
            if (this.taperEnd < this.taperStart) {
                console.log("Taper end less than taper start.");
                this.taperEnd = this.end;
            }
            if (this.taperEnd > this.end) {
                console.log("Taper end greater than end position.");
                this.taperEnd = this.end;
            }
        }
    }

    getWidthAtPos(pos) {
        if (pos <= this.taperStart) {
            return this.widthAtStart;
        } else if (pos >= this.taperEnd) {
            return this.widthAtEnd;
        }
        let slope = (this.widthAtEnd - this.widthAtStart) / (this.taperEnd - this.taperStart);
        let width = this.widthAtStart + (pos - this.taperStart) * slope;
        width = this.numPieces * width;
        return (width);
    }

    getArea() {
        let a = (this.taperStart - this.start) * this.widthAtStart;
        let b = (this.taperEnd - this.taperStart) * (this.widthAtStart + this.widthAtEnd) / 2.0;
        let c = (this.end - this.taperEnd) * this.widthAtEnd;
        return (this.numPieces * (a + b + c));
    }
}