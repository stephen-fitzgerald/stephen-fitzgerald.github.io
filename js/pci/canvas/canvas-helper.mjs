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

const PIx2 = 6.283185307;

export class CanvasHelper {
    constructor(canvas) {

        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.scale = { x: 1.0, y: 1.0 };
        this.offset = { x: 0.0, y: 0.0 };
        this.flipY = true;

        this.pointSize = 3;
        this.labelOffset = { x: 6, y: 6 };

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

        canvas.addEventListener('contextmenu', this.contextMenu.bind(this));

        canvas.addEventListener('mouseenter', this.mouseEnter.bind(this));
        canvas.addEventListener('mouseleave', this.mouseLeave.bind(this));
        canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        canvas.addEventListener('mouseup', this.mouseUp.bind(this));

        this.scaleFactor = 1.025;
        canvas.addEventListener('DOMMouseScroll', this.handleScroll.bind(this), false);
        canvas.addEventListener('mousewheel', this.handleScroll.bind(this), false);
    }

    handleScroll(evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) {
            let mpc1 = this.mouseLocation;
            let mpw1 = this.transformPointToWorld(mpc1);
            let f = Math.pow(this.scaleFactor, delta);
            this.scale.x *= f;
            this.scale.y *= f;
            let mpc2 = this.transformPointToCanvas(mpw1);
            // adjust offset to keep the mouse point stationary on the canvas
            this.offset.x -= (mpc2.x - mpc1.x);
            this.offset.y += this.flipY ? (mpc2.y - mpc1.y) : -(mpc2.y - mpc1.y);
        }
        this.draw();
        return evt.preventDefault() && false;
    };

    get mouseLocation() {
        return { x: this.canvasX, y: this.canvasY };
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
        this.doMouseEnter(event);
        this.draw();
    };

    doMouseEnter(event) {
    }

    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseLeave(event) {
        this.mouseIsInside = false;
        this.setPosition(event);
        this.readButtons(event);
        this.doMouseLeave(event);
        this.draw();
    };

    doMouseLeave(event) {
    }

    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseMove(event) {
        this.setPosition(event);
        this.readButtons(event);
        this.doMouseMove(event);
        this.draw();
    };

    doMouseMove(event) {
    }

    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseUp(event) {
        this.setPosition(event);
        this.readButtons(event);
        this.doMouseUp(event);
        this.draw();
    };

    doMouseUp(event) {
    }

    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseDown(event) {
        this.setPosition(event);
        this.readButtons(event);
        this.doMouseDown(event);
        this.draw();
    };

    doMouseDown(event) {
    }

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

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Return true if a point on the canvas is near where a point in 
     * world coordinates would be drawn
     *
     * @param {{x:number,y:number}} cp the point on the canvas
     * @param {{x:number,y:number} | undefined} wp the target point in world coordinates
     * @param {number} [withinPixels=4] how close it needs to be in pixels (default = 4)
     * @returns {boolean} true if the point is close
     */
    canvasPtIsNearWorldPt(cp, wp, withinPixels = 4) {
        if (wp == undefined) return false;
        const cwp = this.transformPointToCanvas(wp);
        const dx = cp.x - cwp.x;
        const dy = cp.y - cwp.y;
        const dist = Math.abs(dx * dx + dy * dy);
        return (dist < (withinPixels * withinPixels));
    }

    resetScaleAndOffset(extents) {
        let so = {
            scale: { x: 1.0, y: 1.0 },
            offset: { x: 0.0, y: 0.0 }
        };
        if (extents) {
            so = this.calcScaleAndOffset(extents);
        }
        this.scale = so.scale;
        this.offset = so.offset;
        this.draw();
    }

    /**
     * 
     */
    draw() {
        // console.log("draw");
        let _canvas = this.canvas;
        if (_canvas == undefined) return;
        let _context = this.context;
        if (_context == undefined) return;

        _context.save();
        _context.clearRect(0, 0, _canvas.width, _canvas.height);

        _context.fillStyle = 'black';
        _context.font = "10px arial";

        _context.fillText(JSON.stringify({ screenX: this.screenX, screenY: this.screenY }, null, 0), 0, 20);
        _context.fillText(JSON.stringify({ offsetX: this.offsetX, offsetY: this.offsetY }, null, 0), 0, 35);
        _context.fillText(JSON.stringify({ clientX: this.clientX, clientY: this.clientY }, null, 0), 0, 50);
        _context.fillText(JSON.stringify({ pageX: this.pageX, pageY: this.pageY }, null, 0), 0, 65);
        _context.fillText(JSON.stringify({ canvasX: this.canvasX, canvasY: this.canvasY }, null, 0), 0, 80);
        _context.fillText(JSON.stringify({ mouseIsDown: this.mouseIsDown, mouseInside: this.mouseIsInside }, null, 0), 0, 95);
        _context.fillText(JSON.stringify({ movementX: this.movementX, movementY: this.movementY }, null, 0), 0, 110);
        _context.fillText(JSON.stringify({ button: this.button }, null, 0), 0, 125);
        _context.fillText(JSON.stringify({ buttons: this.buttons }, null, 0), 0, 140);
        _context.fillText(JSON.stringify({ width: _canvas.width, height: _canvas.height }, null, 0), 0, 155);
        _context.fillText(JSON.stringify({ rec: _canvas.getBoundingClientRect() }, null, 0), 0, 170);

        _context.fillStyle = this.mouseIsDown ? 'black' : 'red';

        if (this.mouseIsInside)
            _context.fillRect(this.canvasX - 5, this.canvasY - 5, 10, 10);

        _context.fillRect(0, 0, 8, 8);
        _context.fillRect(_canvas.width - 8, 0, 8, 8);
        _context.fillRect(0, _canvas.height - 8, 8, 8);
        _context.fillRect(_canvas.width - 8, _canvas.height - 8, 8, 8);
        _context.restore();
    };

    // set zoom(factor) {
    //     this._zoom = factor;
    //     this.context.scale(this._zoom, this._zoom);
    // }

    // set zoomCenter(centerPt) {
    //     this._translate = { x: centerPt.x, y: centerPt.y };
    //     this.context.translate(-centerPt.x, -centerPt.y);
    // }

    get canvasCenterPt() {
        return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    }

    /**
     * get the scale and offset to center an object with extents into a canvas
     * so that it covers a rough percentage of the area.
     *
     * @param {{xMin:number, xMax:number, yMin:number, yMax:number} | undefined} extents
     * @param {number} [coverFactor=0.80] defaults to 80%
     * @returns {{ scale: { x: number; y: number; }; offset: { x: number; y: number; }; }}
     */
    calcScaleAndOffset(extents, coverFactor = 0.80) {
        if (extents == undefined ||
            Math.abs(extents.xMax - extents.xMin) < 0.00001 ||
            Math.abs(extents.yMax - extents.yMin) < 0.00001
        ) {
            return {
                scale: { x: 1.0, y: 1.0 },
                offset: { x: 0.0, y: 0.0 }
            };
        }
        const width = extents.xMax - extents.xMin;
        const height = extents.yMax - extents.yMin;
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

    /**
     * Transform x,y from world coordinates to canvas coordinates
     * @param {number} x in world coordinates
     * @param {number} y in world coordinates
     * @returns {{ x: number; y: number; }} the pt in canvas coordinates
     */
    transformXYToCanvas(x, y) {
        return (this.transformPointToCanvas({ x: x, y: y }));
    }

    /**
     * Transform a point from world coordinates to canvas coordinates
     * @param {{x:number, y:number}} pt the pt in world coordinates
     * @returns {{ x: number; y: number; }} the pt in canvas coordinates
     */
    transformPointToCanvas(pt) {
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
     * Transform an x,y point on the canvas to world coordinates
     * @param {*} x canvas x coordinate
     * @param {*} y canvas y coordinate
     * @returns {{ x: number; y: number; }} the point in world coordinates
     */
    transformXYToWorld(x, y) {
        let c = { x: x, y: y };
        return (this.transformPointToWorld(c));
    }


    /**
     * Transform a point on the canvas to world coordinates
     *
     * @param {*} pt point on the canvas
     * @returns {{ x: number; y: number; }} same point in world coordinates
     */
    transformPointToWorld(pt) {
        let c = { x: pt.x, y: pt.y };
        if (this.flipY == true) {
            c.y = this.canvas.height - c.y;
        }
        let w = { x: 0.0, y: 0.0 };
        w.x = (c.x - this.offset.x) / this.scale.x;
        w.y = (c.y - this.offset.y) / this.scale.y;
        return w;
    }

    /**
     * Draw a small circle at a point given in canvas coordinates
     * @param {{x:number, y:number}} pt in canvas coords
     */
    drawPoint(pt) {
        let context = this.context;
        context.beginPath();
        context.arc(pt.x, pt.y, this.pointSize, 0, PIx2);
        context.stroke();
    }

    /**
     * Draw a small circle at a point given in world coordinates
     * @param {{x:number, y:number}} pt in world coords
     */
    drawCircleAtWorldPt(pt) {
        if (pt == undefined) return;
        let _pt = this.transformPointToCanvas(pt);
        let context = this.context;
        context.beginPath();
        context.arc(_pt.x, _pt.y, this.pointSize, 0, PIx2);
        context.stroke();
    }
    /**
     * Draw small circles at points given in world coordinates
     * @param {Array<{x:number, y:number}>} pts array in world coords
     */
    drawWorldPoints(pts) {
        if (pts == undefined) return;
        for (let i = 0; i < pts.length; i++) {
            this.drawCircleAtWorldPt(pts[i]);
        }
    }

    /**
     * Label a point on a canvas with text, offset by this.labelOffset.x & .y pixels
     * @param {{x:number, y:number}} pt in world coords
     * @param {string} text
     * @param {{x:number, y:number}} [offset]
     */
    labelWorldPoint(pt, text, offset) {
        let _pt = this.transformPointToCanvas(pt);
        const dx = (offset && offset.x) ? offset.x : this.labelOffset.x;
        const dy = (offset && offset.y) ? offset.y : - this.labelOffset.y;
        this.context.strokeText("" + text, _pt.x + dx, _pt.y + dy);
    }

    /**
     * Label an array of points with their indices in the array
     * @param {Array<{x:number, y:number}>} pts array in world coords
     */
    labelWorldPoints(pts) {
        for (let i = 0; i < pts.length; i++) {
            this.labelWorldPoint(pts[i], "" + i);
        }
    }

    /**
     * Draw an array of edges in the form [[startpt, endpt], [startpt, endpt]...].
     * @param {Array<Array<{x:number, y:number}>>} edges An array of 2-item arrays of endpoints [start,end], in world coords
     */
    drawEdges(edges) {
        const context = this.context;
        context.beginPath();
        for (let i = 0; i < edges.length; i++) {
            const pt1 = this.transformXYToCanvas(edges[i][0].x, edges[i][0].y);
            const pt2 = this.transformXYToCanvas(edges[i][1].x, edges[i][1].y);
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
     * @param {Array<{x:number, y:number}>} path array of endpoints in world coords
     * @param {boolean} [close=false] if true close the loop
     */
    drawWorldPath(path, close = false) {
        if (path.length === 0) return;
        const vertices = path.map((v, i) => {
            return this.transformPointToCanvas(v);
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
     * @param {Array<{x:number, y:number}>} p array of endpoints in world coords
     */
    drawWorldPolygon(p) {
        this.drawWorldPath(p, true);
    }

}