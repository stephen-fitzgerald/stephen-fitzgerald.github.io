import { Profile } from "../../js/pci/bats/profile.mjs";
import { isNumeric } from "../../js/pci/util/isNumeric.mjs";

const html = String.raw;

class ProfileCanvas extends HTMLElement {

  constructor() {
    super();

    this.initialized = false;
    this.canvasHeight = 400;
    this.canvasWidth = 600;

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

    this._profile = new Profile({
      xPositions: [0.00, 0.25, 0.50, 0.75, 1.00],
      oDiameters: [0.01, 0.02, 0.03, 0.01, 0.05]
    });

    this._borderPercentage = 10.0;

    // element created
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)
    this.drawProfile();
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    /* array of attribute names to monitor for changes */
    return ['profile'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    if (name === 'profile') { this.profile = JSON.parse(newValue); }
  }

  /**
   * called when the element is moved to a new document
   * (happens in document.adoptNode, very rarely used)
   *
   * @memberof MyElement
   */
  adoptedCallback() {
  }


  get profile() {
    return (this._profile);
  }

  set profile(value) {
    if (value instanceof Profile) {
      this._profile = value;
    } else {
      this._profile = new Profile(value);
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

  get canvas() {
    return this.shadowRoot.querySelector("#profile-canvas");
  }


  drawProfile() {
    const canvas = this.canvas;
    const profile = this.profile;

    const extents = {
      minX: profile.xMin,
      maxX: profile.xMax,
      minY: profile.dMin,
      maxY: profile.dMax,
    };

    let rngX = profile.xRange;
    let rngY = extents.maxY;

    const border = this.borderPercentage / 100.0 * Math.min(canvas.width, canvas.height);
    const offsetX = border;
    const offsetY = canvas.height / 2;

    const context = canvas.getContext('2d');
    context.fillStyle = 'rgb(235, 235, 235)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let scaleX = (canvas.width - 2 * border) / rngX;
    let scaleY = (canvas.height - 2 * border) / rngY;

    // scaleY = Math.min(scaleX, scaleY);
    // scaleX = scaleY;

    context.beginPath();

    let curX = profile.xPositions[0] * scaleX + offsetX;
    let curY = 0 * scaleY + offsetY;
    let curYMirror = 0 * scaleY + offsetY;
    let nextX, nextY, nextYMirror;

    for (let i = 0; i < profile.xPositions.length; i++) {
      nextX = profile.xPositions[i] * scaleX + offsetX;
      nextY = profile.oDiameters[i] / 2.0 * scaleY + offsetY;
      nextYMirror = -profile.oDiameters[i] / 2.0 * scaleY + offsetY;
      context.moveTo(curX, curY);
      context.lineTo(nextX, nextY);

      context.moveTo(curX, curYMirror);
      context.lineTo(nextX, nextYMirror);

      curX = nextX;
      curY = nextY;
      curYMirror = nextYMirror;
    }

    context.moveTo(curX, curY);
    context.lineTo(curX, offsetY);
    context.moveTo(curX, curYMirror);
    context.lineTo(curX, offsetY );

    context.stroke();
  }

}

customElements.define("profile-canvas", ProfileCanvas);