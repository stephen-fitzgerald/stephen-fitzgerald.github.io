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
 * A quasi-abstract class to track mouse movements in a canvas.
 * This implementation just tracks the mouse and displays info.
 * 
 * Override the mouse event methods to get your desired behavior
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
     */
    constructor(canvas) {
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

        canvas.addEventListener('mouseenter', this.mouseEnter);
        canvas.addEventListener('mouseleave', this.mouseLeave);
        canvas.addEventListener('mousemove', this.mouseMove);
        canvas.addEventListener('mousedown', this.mouseDown);
        canvas.addEventListener('mouseup', this.mouseUp);
    }

    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseEnter = (event) => {
        this.mouseInside = true;
        this.setPosition(event);
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseLeave = (event) => {
        this.mouseInside = false;
        this.setPosition(event);
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseMove = (event) => {
        this.setPosition(event);
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseUp = (event) => {
        this.mouseIsDown = false;
        this.setButton(event);
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    mouseDown = (event) => {
        this.mousIsDown = true;
        this.setButton(event);
    };


    /**
     * Description placeholder
     *
     * @param {MouseEvent} event
     */
    setButton = (event) => {
        this.button = event.button;
        this.buttons = event.buttons;
    };

    //TODO: Workout why x can be negative here. Use clamping of the values if required.
    //TODO: Talk about buttons
    //TODO: Stop propagation
    //Show what happens if we don't update posistion on mouse leave

    getMouseCanvas = () => {
        if(this.canvas==undefined)throw new Error("No Canvas!");
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
    setPosition = (event) => {
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

    loop = () => {
        this.draw();
    };

    /**
     * 
     */
    draw() {

        let _canvas = this.canvas;
        if( _canvas==undefined) return;
        let _context = this.context;
        if( _context==undefined) return;

        _context.clearRect(0, 0, _canvas.width, _canvas.height);
        _context.fillStyle = 'black';
        _context.font = "18px arial";

        _context.fillText(JSON.stringify({ screenX: this.screenX, screenY: this.screenY }, null, 0), 0, 40);
        _context.fillText(JSON.stringify({ offsetX: this.offsetX, offsetY: this.offsetY }, null, 0), 0, 60);
        _context.fillText(JSON.stringify({ clientX: this.clientX, clientY: this.clientY }, null, 0), 0, 80);
        _context.fillText(JSON.stringify({ pageX: this.pageX, pageY: this.pageY }, null, 0), 0, 100);
        _context.fillText(JSON.stringify({ canvasX: this.canvasX, canvasY: this.canvasY }, null, 0), 0, 120);
        _context.fillText(JSON.stringify({ mouseDown: this.mouseDown, mouseInside: this.mouseInside }, null, 0), 0, 140);
        _context.fillText(JSON.stringify({ movementX: this.movementX, movementY: this.movementY }, null, 0), 0, 160);
        _context.fillText(JSON.stringify({ button: this.button }, null, 0), 0, 180);
        _context.fillText(JSON.stringify({ buttons: this.buttons }, null, 0), 0, 200);
        _context.fillText(JSON.stringify({ width: _canvas.width, height: _canvas.height }, null, 0), 0, 220);
        _context.fillText(JSON.stringify({ rec: _canvas.getBoundingClientRect() }, null, 0), 0, 240);

        _context.fillStyle = this.mouseIsDown ? 'red' : 'black';
        _context.fillRect(this.canvasX, this.canvasY, 50, 50);
        _context.fillRect(0, 0, 8, 8);
        _context.fillRect(792, 0, 8, 8);
        _context.fillRect(0, 592, 8, 8);
        _context.fillRect(792, 592, 8, 8);

    };
}