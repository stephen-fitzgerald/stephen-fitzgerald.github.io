// @ts-check
/*jshint esversion: 6 */


/**
    * Description placeholder
    *
    * @param {number} num
    * @param {number} min
    * @param {number} max
    * @returns {*}
    */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Get the extents of an array of x,y points
 *
 * @param {Array<{ x: number; y: number; }>} points
 * @returns {{ xmin: any; xmax: number; ymin: any; ymax: number; }}
 */
function getExtents(points) {
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
 * Draw a polygon in an HTMLCanvasElement.
 * Note that y=0 is at the bottom of the canvas.
 *
 * @param {Array<{x:number, y:number}>} p
 * @param {HTMLCanvasElement} canvas
 * @param {{x:number,y:number}} scale
 * @param {{x:number,y:number}} offset
 */
function drawPolygon(p, canvas, scale, offset) {
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
function drawPath(path, canvas, scale, offset, close = false) {
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
 * get the scale and offset to center an object with extents into a canvas
 * so that it covers 80% of the area.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{xmin:number, xmax:number, ymin:number, ymax:number}} extents
 * @param {number} [coverFactor=0.80] defaults to 80%
 * @returns {{ scale: { x: number; y: number; }; offset: { x: number; y: number; }; }}
 */
function scaleAndOffset(canvas, extents, coverFactor = 0.80) {
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
 * A quasi-abstract class to track mouse movements in a canvas.
 * This implementation just tracks the mouse and displays info.
 * 
 * Override the mouse event & draw methods to get your desired behavior
 *
 * @export
 * @class CanvasMouseTracker
 */
export class CanvasMouseTracker {


    /**
     * Creates an instance of CanvasMouseTracker.
     *
     * @constructor
     * @param {HTMLCanvasElement} canvas
     * @param {Array<{x:number, y:number}>} polygon
     * @param {Array<{x:number, y:number}>} path
     */
    constructor(canvas, polygon, path) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.buttons = 0;
        this.button = 0;
        this.mouseIsInside = false;
        this.mouseIsDown = false;
        this.movementX = 0;
        this.movementY = 0;
        this.canvasX = 0;
        this.canvasY = 0;
        this.clientX = 0;
        this.clientY = 0;
        this.screenX = 0;
        this.screenY = 0;
        this.pageX = 0;
        this.pageY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.contextMenuIsEnabled = false;
        this.polygon = polygon;
        this.path = path;

        canvas.addEventListener('contextmenu', this.contextMenu.bind(this));

        canvas.addEventListener('mouseenter', this.mouseEnter.bind(this));
        canvas.addEventListener('mouseleave', this.mouseLeave.bind(this));
        canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        canvas.addEventListener('mouseup', this.mouseUp.bind(this));

        this.draw();
    }

    /**
     * Context menu is called for a right click in the canvas
     *
     * @param {MouseEvent} event
     */
    contextMenu(event) {
        if (!this.contextMenuIsEnabled)
            event.preventDefault();
    }

    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseEnter(event) {
        this.mouseIsInside = true;
        this.setPosition(event);
        this.readButtons(event);
        this.draw();
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseLeave(event) {
        this.mouseIsInside = false;
        this.setPosition(event);
        this.readButtons(event);
        this.draw();
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseMove(event) {
        this.setPosition(event);
        this.readButtons(event);
        this.draw();
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseUp(event) {
        this.setPosition(event);
        this.readButtons(event);
        // console.log("mouse up");
        this.draw();
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseDown(event) {
        this.setPosition(event);
        this.readButtons(event);
        // console.log("mouse down");
        this.draw();
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    readButtons(event) {
        this.button = event.button;
        this.buttons = event.buttons;
        this.mouseIsDown = this.buttons > 0;
    };

    //TODO: Workout why x can be negative here. Use clamping of the values if required.
    //TODO: Talk about buttons
    //TODO: Stop propagation
    //Show what happens if we don't update posistion on mouse leave

    getMouseCanvas() {
        if (this.canvas == undefined) throw new Error("No Canvas!");
        var rec = this.canvas.getBoundingClientRect();
        const x = ((this.offsetX) * this.canvas.width) / (rec.width);
        const y = ((this.offsetY) * this.canvas.height) / (rec.height);
        return { x: x, y: y };
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    setPosition(event) {
        this.clientX = event.clientX;
        this.clientY = event.clientY;
        this.pageX = event.pageX;
        this.pageY = event.pageY;
        this.offsetX = clamp(event.offsetX, 0, this.canvas.getBoundingClientRect().width);
        this.offsetY = clamp(event.offsetY, 0, this.canvas.getBoundingClientRect().height);
        this.screenX = event.screenX;
        this.screenY = event.screenY;
        this.movementX = event.movementX;
        this.movementY = event.movementY;
        const canvasPosition = this.getMouseCanvas();
        this.canvasX = canvasPosition.x;
        this.canvasY = canvasPosition.y;
    };

    startLooping() {
        this.running = true;
        requestAnimationFrame(this.loop.bind(this));
        console.log("started");
    }

    stopLooping() {
        this.running = false;
        console.log("stopped");
    }

    loop() {
        this.draw();
        if (this.running) {
            requestAnimationFrame(this.loop.bind(this));
        }
    };

    /**
     * 
     */
    draw() {
        // console.log("draw");
        let _canvas = this.canvas;
        if (_canvas == undefined) return;
        let _context = this.context;
        if (_context == undefined) return;

        _context.clearRect(0, 0, _canvas.width, _canvas.height);

        let so = {
            scale: { x: 1.0, y: 1.0 },
            offset: { x: 0, y: 0 },
        };

        if (this.polygon) {
            _context.save();
            _context.strokeStyle = 'blue';
            const extents = getExtents(this.polygon);
            so = scaleAndOffset(_canvas, extents);
            drawPolygon(this.polygon, _canvas, so.scale, so.offset);
            _context.restore();
        }

        if (this.path) {
            _context.save();
            _context.strokeStyle = 'green';
            drawPath(this.path, _canvas, so.scale, so.offset);
            _context.restore();
        }

        _context.fillStyle = 'black';
        _context.font = "10px arial";

        _context.fillText(JSON.stringify({ screenX: this.screenX, screenY: this.screenY }, null, 0), 0, 40);
        _context.fillText(JSON.stringify({ offsetX: this.offsetX, offsetY: this.offsetY }, null, 0), 0, 60);
        _context.fillText(JSON.stringify({ clientX: this.clientX, clientY: this.clientY }, null, 0), 0, 80);
        _context.fillText(JSON.stringify({ pageX: this.pageX, pageY: this.pageY }, null, 0), 0, 100);
        _context.fillText(JSON.stringify({ canvasX: this.canvasX, canvasY: this.canvasY }, null, 0), 0, 120);
        _context.fillText(JSON.stringify({ mouseIsDown: this.mouseIsDown, mouseInside: this.mouseIsInside }, null, 0), 0, 140);
        _context.fillText(JSON.stringify({ movementX: this.movementX, movementY: this.movementY }, null, 0), 0, 160);
        _context.fillText(JSON.stringify({ button: this.button }, null, 0), 0, 180);
        _context.fillText(JSON.stringify({ buttons: this.buttons }, null, 0), 0, 200);
        _context.fillText(JSON.stringify({ width: _canvas.width, height: _canvas.height }, null, 0), 0, 220);
        _context.fillText(JSON.stringify({ rec: _canvas.getBoundingClientRect() }, null, 0), 0, 240);

        _context.fillStyle = this.mouseIsDown ? 'black' : 'red';

        if (this.mouseIsInside)
            _context.fillRect(this.canvasX-5, this.canvasY-5, 10, 10);

        _context.fillRect(0, 0, 8, 8);
        _context.fillRect(_canvas.width - 8, 0, 8, 8);
        _context.fillRect(0, _canvas.height - 8, 8, 8);
        _context.fillRect(_canvas.width - 8, _canvas.height - 8, 8, 8);

    };
}