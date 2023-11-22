import { Profile } from "../../js/pci/bats/profile.mjs";
import { MoldedTube } from "../../js/pci/bats/molded-tube.mjs";
import { PlySpec } from "../../js/pci/lpt/plyspec.mjs";
import { isNumeric } from "../../js/pci/util/isNumeric.mjs";
import { getTube } from "./tube.mjs";

const html = String.raw;

class MoldedTubeWC extends HTMLElement {

  constructor() {
    super();

    this.initialized = false;
    this.canvasHeight = 600;
    this.canvasWidth = 300;

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({ mode: 'open' });

    // attach styles
    this.styleEl = document.createElement('style');
    this.styleEl.innerHTML = this.styleText;
    this.styleEl.setAttribute('id', 'styleEl');

    // create a div as a top-level container
    this.rootEl = document.createElement('div');
    this.rootEl.innerHTML = this.templateHTML;
    this.rootEl.setAttribute('id', 'rootEl');

    // add style and root div to shadow dom
    shadowRoot.appendChild(this.styleEl);
    shadowRoot.appendChild(this.rootEl);
    // element created
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)

    this._moldedTube = getTube();
    this._profile = this.moldedTube.profile;
    this._plySpecs = this.moldedTube.plySpecs;

    this._zoomIntensity = 0.15;

    // extents is in real worlld units = meters
    this._extents = {
      minX: this._profile.xMin,
      maxX: this._profile.xMax,
      minY: -this._profile.dMax,
      maxY: this._profile.dMax,
    };

    let scalex = 0.8 * (this.canvas.width) / (this._extents.maxX - this._extents.minX);
    let scaley = 0.8 / 7.0 * (this.canvas.height) / (this._extents.maxY - this._extents.minY);
    this._scale = Math.min(scalex, scaley);
    this._original_scale = this._scale; // scale has units of px/meter
    this._originx = 0;  // origin x & y are in world units, ie meters
    this._originy = 0; // origin x & y are in world units, ie meters

    this.canvas.onwheel = this.mouseWheel.bind(this);
    this.canvas.onmousedown = this.mousedown.bind(this);
    this.canvas.onmousemove = this.mousemove.bind(this);
    this.canvas.onmouseup = this.mouseup.bind(this);
    this.canvas.onmouseout = this.mouseup.bind(this);
    this.canvas.ondblclick = this.dblclick.bind(this);

    // Begin the animation loop.
    this.drawProfile();
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    /* array of attribute names to monitor for changes */
    return ['molded-tube'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    if (name === 'molded-tube') { this.moldedTube = JSON.parse(newValue); }
  }

  /**
   * called when the element is moved to a new document
   * (happens in document.adoptNode, very rarely used)
   *
   * @memberof MyElement
   */
  adoptedCallback() {
  }

  get canvas() {
    return this.shadowRoot.querySelector("#profile-canvas");
  }

  get context() {
    return this.canvas.getContext("2d");
  }

  get moldedTube() {
    return this._moldedTube;
  }

  set moldedTube(value) {
    if (value instanceof MoldedTube) {
      this._moldedTube = value;
    } else {
      this_moldedTube = new MoldedTube(value);
    }
  }

  /*
    The style tags allow syntax highlighting, but need to be stripped to
    work properly because this gets wrapped in <style> </style> tags
    when added to the shadow dom.
  */
  get styleText() {
    let ret = html`
        <style>
          :host {
            --bg-color: lightblue;
          }
          #rootEl {
            display: inline-block;
            background-color: var(--bg-color);
            padding: 1rem;
            border: 1px solid blue;
          }
          canvas {
            border: 1px solid black;
          }
        </style>
      `;
    ret = ret.replace('<style>', '').replace('</style>', '');
    return ret;
  }

  get templateHTML() {
    let ret = html`
      <canvas id="profile-canvas" height="${this.canvasHeight}" width="${this.canvasWidth}"></canvas>
    `;
    return ret;
  }

  drawProfile() {
    const scale = this._scale; // px / meter
    const rngY = this._extents.maxY;  // meters
    const border = 0.1; // meters
    const canvas = this.canvas;
    const profile = this._profile;
    const plySpecs = this._plySpecs;
    const context = this.context;

    context.save();
    context.fillStyle = 'rgb(245, 245, 245)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.translate(-this._originx * scale, -this._originy * scale);

    // move down & right to create a border area
    context.translate(border * scale, (border + rngY / 2.0) * scale);

    // draw the profile
    context.beginPath();

    let curX = profile.xPositions[0];
    let curY = 0;
    let curYMirror = 0;
    let nextX, nextY, nextYMirror;

    for (let i = 0; i < profile.xPositions.length; i++) {
      nextX = profile.xPositions[i] * scale;
      nextY = profile.oDiameters[i] / 2.0 * scale;
      nextYMirror = -nextY;
      context.moveTo(curX, curY);
      context.lineTo(nextX, nextY);
      context.moveTo(curX, curYMirror);
      context.lineTo(nextX, nextYMirror);
      curX = nextX;
      curY = nextY;
      curYMirror = nextYMirror;
    }

    context.moveTo(curX, curY);
    context.lineTo(curX, curYMirror);

    context.stroke();  // finish drawing profile

    // move down to below the profile before drawing the plies
    context.translate(0, (rngY / 2.0) * scale * 1.2);

    // draw the plies
    context.strokeStyle = '#ff0000';

    // scale the ply widths, so a full wrap is equal in size to the diameter
    let plyWidthScale = 1 / 3.14159;
    // .. or not
    plyWidthScale = 1.0;

    // draw each ply
    plySpecs.forEach((plySpec, index) => {
      context.translate(0, (plySpec.maxWidth / 2.0 * plyWidthScale) * scale * 1.2);
      this.drawPly(plySpec, context, { x: scale, y: scale * plyWidthScale });
      context.translate(0, (plySpec.maxWidth / 2.0 * plyWidthScale) * scale * 1.2);
    });
    context.restore();
  }

  drawPly(plySpec, ctx, scale) {
    let start = plySpec.start * scale.x;
    let tStart = plySpec.taperStart * scale.x;
    let tEnd = plySpec.taperEnd * scale.x;
    let end = plySpec.end * scale.x;
    let was = plySpec.widthAtStart * scale.y;
    let wae = plySpec.widthAtEnd * scale.y;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start, 0);
    ctx.lineTo(start, was / 2.0);
    ctx.lineTo(tStart, was / 2.0);
    ctx.lineTo(tEnd, wae / 2.0);
    ctx.lineTo(end, wae / 2.0);
    ctx.lineTo(end, -wae / 2.0);
    ctx.lineTo(tEnd, -wae / 2.0);
    ctx.lineTo(tStart, -was / 2.0);
    ctx.lineTo(start, -was / 2.0);
    ctx.lineTo(start, 0.0);
    ctx.stroke();
    ctx.restore();
  }

  mouseWheel(event) {
    event.preventDefault();
    const canvas = this.canvas;

    const mousex = event.clientX - canvas.offsetLeft;
    const mousey = event.clientY - canvas.offsetTop;

    // Normalize mouse wheel movement to +1 or -1 to avoid unusual jumps.
    const wheel = event.deltaY < 0 ? 1 : -1;

    // Compute zoom factor.
    const zoom = Math.exp(wheel * this._zoomIntensity);

    // Compute the new visible origin. Originally the mouse is at a
    // distance mouse/scale from the corner, we want the point under
    // the mouse to remain in the same place after the zoom, but this
    // is at mouse/new_scale away from the corner. Therefore we need to
    // shift the origin (coordinates of the corner) to account for this.
    this._originx -= mousex / (this._scale * zoom) - mousex / this._scale;
    this._originy -= mousey / (this._scale * zoom) - mousey / this._scale;

    // Update scale and redraw.
    this._scale *= zoom;
    this.drawProfile();
  };

  mousedown(event) {
    this._dragging = true;
    this._dragStart = {
      x: event.pageX - this.canvas.offsetLeft,
      y: event.pageY - this.canvas.offsetTop
    };
  }

  mousemove(event) {
    if (this._dragging) {
      this._dragEnd = {
        x: event.pageX - this.canvas.offsetLeft,
        y: event.pageY - this.canvas.offsetTop
      };
      this._originx -= (this._dragEnd.x - this._dragStart.x) / this._scale;
      this._originy -= (this._dragEnd.y - this._dragStart.y) / this._scale;
      this._dragStart = this._dragEnd;
      this._dragEnd = undefined;
      this.drawProfile();

    }
  }

  mouseup() {
    this._dragging = false;
    this._dragStart = undefined;
    this._dragEnd = undefined;
  }

  dblclick(event) {
    this._scale = this._original_scale;
    this._originx = 0;
    this._originy = 0;
    this.drawProfile();
  }
}

customElements.define("molded-tube", MoldedTubeWC);