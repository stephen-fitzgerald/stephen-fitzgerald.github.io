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

/**
 * get the scale and offset to center an object with extents into a canvas
 * so that it covers 80% of the area.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{xmin:number, xmax:number, ymin:number, ymax:number}} extents
 * @param {number} [coverFactor=0.80] defaults to 80%
 * @returns {{ scale: { x: number; y: number; }; offset: { x: number; y: number; }; }}
 */
export function scaleAndOffset(canvas, extents, coverFactor = 0.80) {
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
 * Draw a polygon in an HTMLCanvasElement.
 * Note that y=0 is at the bottom of the canvas.
 * default scale = { x: 1.0, y: 1.0 }
 * default offset = { x: 0.0, y: 0.0 }
 *
 * @param {Array<{x:number, y:number}>} p
 * @param {HTMLCanvasElement} canvas
 * @param {{x:number,y:number}} [scale]
 * @param {{x:number,y:number}} [offset]
 */
export function drawPolygon(p, canvas, scale = { x: 1.0, y: 1.0 }, offset = { x: 0, y: 0 }) {
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
export function drawPath(path, canvas, scale = { x: 1.0, y: 1.0 }, offset = { x: 0, y: 0 }, close = false) {
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

/**
 * Draw a path of lines on a canvas using the scale factor and offset. 
 * The path is defined by an array of x,y points.
 * If close is true, a line will be drawn between the last & first points, 
 * closing the loop.
 *
 * @param {Array<Array<{x:number, y:number}>>} edges
 * @param {HTMLCanvasElement} canvas
 * @param {{x:number,y:number}} scale
 * @param {{x:number,y:number}} offset
 * @param {boolean} [close=false] if true close the loop
 */
export function drawEdges(edges, canvas, scale = { x: 1.0, y: 1.0 }, offset = { x: 0, y: 0 }, close = false) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const yMax = context.canvas.height;
    context.beginPath();
    for (let i = 0; i < edges.length; i++) {
        let pt1x = Math.floor(edges[i][0].x * scale.x + offset.x)+0.5;
        let pt1y = Math.floor(yMax - (edges[i][0].y * scale.x + offset.y))+0.5;
        let pt2x = Math.floor(edges[i][1].x * scale.x + offset.x)+0.5;
        let pt2y = Math.floor(yMax - (edges[i][1].y * scale.x + offset.y))+0.5;
        context.moveTo(pt1x,pt1y);
        context.lineTo(pt2x,pt2y);
    }
    context.stroke();
}
