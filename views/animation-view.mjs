// @ts-check
/* jshint esversion: 6 */

import { AbstractView } from "./abstract-view.mjs";
import { parseRequestURL } from "../js/router.mjs";
import { randRng } from "../js/pci/util/randRng.mjs";
import { interp } from "../js/pci/util/interp.mjs";
import { getDomRefsById } from "../js/pci/util/dom.mjs";

let pi = Math.PI;

export class AnimationView extends AbstractView {

  /**
   * 
   * @param {object} args
   * @param {string} [args.title]
   * @param {number} [args.numAgents]
   * @param {number} [args.width]
   * @param {number} [args.height]
   */
  constructor(args = {}) {
    super(args);
    this.title = args.title || "Animation View";
    this.numAgents = args.numAgents || 45;
    this.width = args.width || 350;
    this.height = args.height || 150;
    this.canvas = undefined;
    this.agents = [];
    this.animationFrameId = undefined;
  }
  /**
   *
   *
   * @return {Promise<string>} the html for the view
   * @memberof AnimationView
   */
  async buildHTML() {
    this.mainContainer = document.getElementById("main-container");
    if (this.mainContainer == undefined) {
      throw new Error(`Error, no element with id="main-container" found.`);
    }
    this.savedOverflow = this.mainContainer?.style.overflow;
    this.mainContainer.style.overflow = "hidden";
    this.html = /* html */`
        <canvas id="the-canvas"></canvas>
    `;
    //  <button id="btn-save">Save Png</button>
    return this.html;
  }

  addListeners() {
    this.domRefs = getDomRefsById();
    document.title = this.title;
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
    this.canvas = this.domRefs.theCanvas;
    this.context = this.canvas.getContext('2d');
    //this.domRefs.btnSave.addEventListener("click", this.savePNG.bind(this));
    this.resize();
    this.createAgents();

    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        this.resize(entry.contentRect);
      }
    });

    // Observe one or multiple elements
    this.resizeObserver.observe(this.domRefs.mainContainer);
  }

  createAgents() {

    if (!this.agents || this.agents.length == 0) {
      for (let i = 0; i < this.numAgents; i++) {
        const r = randRng(8, 22);
        const x = randRng(r, this.width - r);
        const y = randRng(r, this.height - r);
        this.agents.push(new Agent(x, y, r));
      }
    }
  }

  /**
   * Resize the canvas to a rectangle or the parent element.
   * Move agents so all are still in the canvas
   * @param {object} [rect] 
   * @param {number} rect.width 
   * @param {number} rect.height 
   */
  resize(rect) {

    rect = rect || this.canvas.parentNode.getBoundingClientRect();

    if (rect == undefined) {
      throw new Error("No parent rectangleto resize canvas");
    }

    this.canvas.width = this.width = rect.width;
    this.canvas.height = this.height = rect.height;

    this.agents.forEach(agent => {
      agent.c.x = Math.min(agent.c.x, this.width - agent.r - 1);
      agent.c.y = Math.min(agent.c.y, this.height - agent.r - 1);
      agent.c.x = Math.max(agent.r + 1, agent.c.x);
      agent.c.y = Math.max(agent.r + 1, agent.c.y);
    });
  }

  /**
   * 
   * @param {number} time elapsed time in milliseconds
   */
  modelToView(time) {
    // erase / fill background
    let context = this.context;
    let width = this.width;
    let height = this.height;
    let agents = this.agents;

    context.fillStyle = 'rgb(220, 242, 255)';

    context.fillRect(0, 0, width, height);
    context.fillStyle = 'white';

    const maxDist = 150;
    const maxLineWidth = 12;

    // draw lines between dots
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      for (let j = i + 1; j < agents.length; j++) {
        const other = agents[j];
        let r = (agent.r + other.r);
        let dist = agent.distanceTo(other);
        if (dist < maxDist) {
          context.lineWidth = interp(dist, 0, maxDist, maxLineWidth, 1);
          context.beginPath();
          context.moveTo(agent.c.x, agent.c.y);
          context.lineTo(other.c.x, other.c.y);
          context.stroke();
        }
      }
    }

    this.agents.forEach(agent => {
      agent.bounce(width, height);
      agent.wrap(width, height);
      agent.update();
      agent.draw(context);
    });

    this.animationFrameId = requestAnimationFrame(this.modelToView.bind(this));
  }

  /**
   * clean up when we are about to be replaced in the view
   * @override
   * @memberof AnimationView
   */
  destroy() {
    if (this.animationFrameId != undefined) {
      window.cancelAnimationFrame(this.animationFrameId);
    }
    this.resizeObserver?.unobserve(this.domRefs?.mainContainer);
    this.resizeObserver?.disconnect();
    if (this.mainContainer == undefined) {
      throw new Error(`Error, no element with id="main-container" found.`);
    }
    this.mainContainer.style.overflow = "" + this.savedOverflow;
  }

  async savePNG() {
    let dataURL = this.canvas.toDataURL("image/png", 1.0);
    let fileName = 'my-canvas.png';
    var a = document.createElement('a');
    a.href = dataURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

//-----------------------------------------------------------
// support classes

class Vector {
  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Agent {

  static num = 0;

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   * @param {number} r 
   */
  constructor(x, y, r = 10) {
    Agent.num += 1;
    this.name = "" + Agent.num;
    this.lineWidth = 1;
    this.c = new Vector(x, y);
    this.vel = new Vector(randRng(-4, 4), randRng(-4, 4));
    this.r = r;
  }

  /**
   * 
   * @param {Agent} other 
   * @returns {number} distance between two agents
   */
  distanceTo(other) {
    return (
      Math.sqrt(
        (this.c.x - other.c.x) * (this.c.x - other.c.x) +
        (this.c.y - other.c.y) * (this.c.y - other.c.y)
      )
    );
  }

  /**
   * Make agents bounce of the edges of the canvas
   * @param {number} width 
   * @param {number} height 
   */
  bounce(width, height) {
    if (this.c.x < this.r - 1 || this.c.x > (width - this.r) + 1) {
      this.vel.x = -this.vel.x;
    }
    if (this.c.y < this.r - 1 || this.c.y > (height - this.r) + 1) {
      this.vel.y = -this.vel.y;
    }
  }

  /**
   * Wrap agents so the reappear on the opposite side of the canvas.
   * @param {number} width 
   * @param {number} height 
   */
  wrap(width, height) {
    if (this.c.x < (0 - this.r)) {
      this.c.x = width + this.r;
    }

    if (this.c.x > (width + this.r)) {
      this.c.x = (0 - this.r);
    }

    if (this.c.y < (0 - this.r)) {
      this.c.y = height + this.r;
    }

    if (this.c.y > (height + this.r)) {
      this.c.y = (0 - this.r);
    }
  }

  /**
   * updates the current position
   */
  update() {
    this.c.x += this.vel.x;
    this.c.y += this.vel.y;
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.c.x, this.c.y);

    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.arc(0, 0, this.r - this.lineWidth, 0, 2 * pi);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(this.name, 0, 0);
    ctx.restore();
  }
}
