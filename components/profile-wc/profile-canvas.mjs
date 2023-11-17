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
    return ['coordinates'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

  /**
   * called when the element is moved to a new document
   * (happens in document.adoptNode, very rarely used)
   *
   * @memberof MyElement
   */
  adoptedCallback() {
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

  get canvas(){
    return this.shadowRoot.querySelector("#profile-canvas");
  }

  get profile(){
    return( {
      xPositions: [ 0.00, 0.25, 0.50, 0.75, 1.00 ],
      oDiameters: [ 0.01, 0.02, 0.03, 0.01, 0.05 ]
    });
    
  }

  drawProfile() {
    const canvas = this.canvas;
    const profile = this.profile;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgb(220, 242, 255)';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const extents = {
      minX: Math.min(...profile.xPositions),
      maxX: Math.max(...profile.xPositions),
      minY: Math.min(...profile.oDiameters),
      maxY: Math.max(...profile.oDiameters),
    };
    let rngX = extents.maxX - extents.minX;
    let rngY = extents.maxY - extents.minY;
    const border = 80;
    const offsetX = border;
    const offsetY = canvas.height / 2;
    let scaleX = (canvas.width - 2 * border) / rngX;
    let scaleY = (canvas.height - 2 * border) / rngY;

    scaleY = Math.min(scaleX, scaleY);
    scaleX = scaleY;

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
    context.lineTo(curX, 0 * scaleY + offsetY);
    context.moveTo(curX, curYMirror);
    context.lineTo(curX, 0 * scaleY + offsetY);

    context.stroke();
  }

}

customElements.define("profile-canvas", ProfileCanvas);