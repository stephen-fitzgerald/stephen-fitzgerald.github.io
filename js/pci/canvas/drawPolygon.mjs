// @ts-check
/*jshint esversion: 6 */

/**
 * Get the extents of an array of x,y points
 *
 * @param {Array<{ x: number; y: number; }>} points
 * @returns {{ xmin: any; xmax: number; ymin: any; ymax: number; }}
 */
export function getExtents(points) {
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



const PIx2 = 6.283185307;

export class CanvasHelper {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.scale = { x: 1.0, y: 1.0 };
        this.offset = { x: 0.0, y: 0.0 };
        this.flipY = true;
        this.pointSize = 4;
        this.labelOffset = { x: 6, y: 6 };
        this._zoom = 1.0;
        this._zoomCenter = { x: this.canvas.width / 2.0, y: this.canvas.height / 2.0 };
    }

    set zoom(factor) {
        this._zoom = factor;
        this.context.scale(this._zoom, this._zoom);
    }

    set zoomCenter(centerPt) {
        this._translate = { x: centerPt.x, y: centerPt.y };
        this.context.translate(-centerPt.x, -centerPt.y);
    }

    get canvasCenterPt(){
        return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    }

    /**
     * get the scale and offset to center an object with extents into a canvas
     * so that it covers a rough percentage of the area.
     *
     * @param {{xmin:number, xmax:number, ymin:number, ymax:number}} extents
     * @param {number} [coverFactor=0.80] defaults to 80%
     * @returns {{ scale: { x: number; y: number; }; offset: { x: number; y: number; }; }}
     */
    calcScaleAndOffset(extents, coverFactor = 0.80) {
        const width = extents.xmax - extents.xmin;
        const height = extents.ymax - extents.ymin;
        const canvas = this.canvas;

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

    transformXY(x, y) {
        return (this.transformPoint({ x: x, y: y }));
    }

    transformPoint(pt) {
        let ret = { x: 0.0, y: 0.0 };
        ret.x = Math.floor(pt.x * this.scale.x + this.offset.x) + 0.5;
        if (this.flipY) {
            const yMax = this.canvas.height;
            ret.y = Math.floor(yMax - (pt.y * this.scale.y + this.offset.y)) + 0.5;
        } else {
            ret.y = Math.floor(pt.y * this.scale.y + this.offset.y) + 0.5;
        }
        return ret;
    }

    /**
     * @param {{x:number, y:number}} pt
     */
    drawPoint(pt) {
        let _pt = this.transformPoint(pt);
        let context = this.context;
        context.beginPath();
        context.arc(_pt.x, _pt.y, this.pointSize, 0, PIx2);
        context.stroke();
    }
    /**
     * @param {Array<{x:number, y:number}>} pts
     */
    drawPoints(pts) {
        for (let i = 0; i < pts.length; i++) {
            this.drawPoint(pts[i]);
        }
    }

    /**
     * Label a point on a canvas with text, offset by this.labelOffset.x & .y pixels
     *
     * @param {{x:number, y:number}} pt
     * @param {string} text
     */
    labelPoint(pt, text) {
        const dx = this.labelOffset.x;
        const dy = - this.labelOffset.y;
        let _pt = this.transformPoint(pt);
        this.context.strokeText("" + text, _pt.x + dx, _pt.y + dy);
    }

    /**
     * Label an array of points with their indices in the array
     * @param {Array<{x:number, y:number}>} pts
     */
    labelPoints(pts) {
        for (let i = 0; i < pts.length; i++) {
            this.labelPoint(pts[i], "" + i);
        }
    }

    /**
     * Draw an array of edges in the form [[startpt, endpt], [startpt, endpt]...].
     * @param {Array<Array<{x:number, y:number}>>} edges
     */
    drawEdges(edges) {
        const context = this.context;
        context.beginPath();
        for (let i = 0; i < edges.length; i++) {
            const pt1 = this.transformXY(edges[i][0].x, edges[i][0].y);
            const pt2 = this.transformXY(edges[i][1].x, edges[i][1].y);
            context.moveTo(pt1.x, pt1.y);
            context.lineTo(pt2.x, pt2.y);
        }
        context.stroke();
    }


    /**
     * Draw a path of lines on a canvas using the scale factor and offset. 
     * The path is defined by an array of x,y points.
     * If close is true, a line will be drawn between the last & first points, 
     * closing the loop.
     *
     * @param {Array<{x:number, y:number}>} path
     * @param {boolean} [close=false] if true close the loop
     */
    drawPath(path, close = false) {
        const vertices = path.map((v, i) => {
            return this.transformPoint(v);
        });
        const context = this.context;
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


    /**
     * Draw a polygon, which is just a closed path.
     * @param {Array<{x:number, y:number}>} p
     */
    drawPolygon(p) {
        this.drawPath(p, true);
    }

}