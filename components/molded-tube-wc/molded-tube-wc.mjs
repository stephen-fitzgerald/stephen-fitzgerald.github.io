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
    this.canvasHeight = 1800;
    this.canvasWidth = 900;

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


    this._context = this.canvas.getContext('2d');
    this._borderPercentage = 10.0;
    this._moldedTube = getTube();
    this._profile = this.moldedTube.profile;
    this._plySpecs = this.moldedTube.plySpecs;

    this._zoomIntensity = 0.2;

    this._zoom = 1; // zoom = canvas.width / visibileWidth
    this._originx = 0;
    this._originy = 0;
    this._visibleWidth = this.canvas.width;
    this._visibleHeight = this.canvas.height;

    // extents is in real worlld units = meters
    this._extents = {
      minX: this._profile.xMin,
      maxX: this._profile.xMax,
      minY: this._profile.dMin,
      maxY: this._profile.dMax,
    };

    let sx = (this.canvas.width - 2 * this.border) / (this._extents.maxX - this._extents.minX);
    let sy = (this.canvas.height - 2 * this.border) / (this._extents.maxY - this._extents.minY);

    this._scale = {
      x: Math.min(sx, sy),
      y: Math.min(sx, sy),
    };

    this.canvas.onwheel = this.mouseWheel.bind(this);

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

  get borderPercentage() {
    return this._borderPercentage;
  }

  set borderPercentage(value) {
    if (isNumeric(value) && value >= 0 && value <= 100) {
      this._borderPercentage = value;
    }
  }

  get border() {
    return Math.max(
      0,
      this._borderPercentage / 100.0 * Math.min(
        this.canvas.width,
        this.canvas.height
      )
    );
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
    let canvas = this.canvas;
    let border = this.border;
    let scale = this._scale;
    let rngY = this._extents.maxY - this._extents.minY;
    let profile = this._profile;
    let plySpecs = this._plySpecs;

    // const context = canvas.getContext('2d');
    const context = this._context;
    context.save();
    context.fillStyle = 'rgb(235, 235, 235)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.translate(border, border + rngY * scale.y / 2.0);

    context.scale(this._zoom, this._zoom);
    context.translate(-this._originx, -this._originy);

    context.beginPath();

    let curX = profile.xPositions[0];
    let curY = 0;
    let curYMirror = 0;
    let nextX, nextY, nextYMirror;

    for (let i = 0; i < profile.xPositions.length; i++) {
      nextX = profile.xPositions[i] * scale.x;
      nextY = profile.oDiameters[i] / 2.0 * scale.y;
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

    context.stroke();

    context.strokeStyle = '#ff0000';

    context.translate(0, rngY * scale.y / 2.0 + border);

    let plyWidthScale = 1 / 3.14159;

    plySpecs.forEach((plySpec, index) => {
      context.translate(0, plySpec.maxWidth * scale.y / 2.0 * plyWidthScale);
      this.drawPly(plySpec, context, { x: scale.x, y: scale.y * plyWidthScale });
      context.translate(0, plySpec.maxWidth * scale.y / 2.0 * plyWidthScale + border / 3.0);
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

    // Translate so the visible origin is at the context's origin.
    //context.translate(this._originx, this._originy);

    // Compute the new visible origin. Originally the mouse is at a
    // distance mouse/scale from the corner, we want the point under
    // the mouse to remain in the same place after the zoom, but this
    // is at mouse/new_scale away from the corner. Therefore we need to
    // shift the origin (coordinates of the corner) to account for this.
    this._originx -= mousex / (this._zoom * zoom) - mousex / this._zoom;
    this._originy -= mousey / (this._zoom * zoom) - mousey / this._zoom;

    // Scale it (centered around the origin due to the translate above).
    //context.scale(zoom, zoom);
    // Offset the visible origin to it's proper position.
    //context.translate(-this._originx, -this._originy);

    // Update scale and others.
    this._zoom *= zoom;
    this._visibleWidth = this.canvas.width / this._zoom;
    this._visibleHeight = this.canvas.height / this._zoom;
    this.drawProfile();
  };
}

customElements.define("molded-tube", MoldedTubeWC);