// @ts-check
/* jshint esversion: 6 */

import { AbstractView } from "./abstract-view.mjs";
import { parseRequestURL } from "../js/router.mjs";
import { randRng } from "../js/pci/util/randRng.mjs";
import { interp } from "../js/pci/util/interp.mjs";

let pi = Math.PI;

export class AnimationView extends AbstractView {
  constructor(args = {}) {
    super(args);
    this.title = args.title || "Animation View";
    this.canvasId = "the-canvas";
    this.width = 350;
    this.height = 150;
    this.canvas = undefined;
    this.agents = [];
    this.numAgents = 45;
  }

  buildHTML() {
    this.html = `<canvas id="${this.canvasId}"></canvas>`;
    return this.html;
  }

  addListeners() {
    document.title = this.title;
    this.canvas = document.getElementById(this.canvasId);
    //@ts-expect-error
    this.context = this.canvas.getContext('2d');
    // document.getElementById('btn-save').addEventListener("click", this.savePNG.bind(this));
    this.resize();
    this.createAgents();
    window.addEventListener("resize", this.resize.bind(this));
  }

  createAgents() {
    this.agents = [];
    for (let i = 0; i < this.numAgents; i++) {
      const r = randRng(8, 22);
      const x = randRng(r, this.width - r);
      const y = randRng(r, this.height - r);
      this.agents.push(new Agent(x, y, r));
    }
  }

  resize() {
    //@ts-expect-error
    var rect = this.canvas.parentNode.getBoundingClientRect();
    this.width = rect.width - 12;
    this.height = rect.height - 12;
    //@ts-expect-error
    this.canvas.width = this.width;
    //@ts-expect-error
    this.canvas.height = this.height;
    this.agents.forEach(agent => {
      agent.c.x = Math.min(agent.c.x, this.width - agent.r - 1);
      agent.c.y = Math.min(agent.c.y, this.height - agent.r - 1);
      agent.c.x = Math.max(agent.r + 1, agent.c.x);
      agent.c.y = Math.max(agent.r + 1, agent.c.y);
    });
  }

  modelToView() {
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
      agent.update();
      agent.draw(context);
    });

    requestAnimationFrame(this.modelToView.bind(this));
  }

  savePNG() {
    //@ts-expect-error
    let dataURL = this.canvas.toDataURL("image/png", 1.0);
    let fileName = 'my-canvas.png';
    var a = document.createElement('a');
    a.href = dataURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
  }
}

//-----------------------------------------------------------
// support classes

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Agent {
  constructor(x, y, r = 10) {
    this.lineWidth = 1;
    this.c = new Vector(x, y);
    this.vel = new Vector(randRng(-4, 4), randRng(-4, 4));
    this.r = r;
  }

  distanceTo(other) {
    return (
      Math.sqrt(
        (this.c.x - other.c.x) * (this.c.x - other.c.x) +
        (this.c.y - other.c.y) * (this.c.y - other.c.y)
      )
    );
  }

  bounce(width, height) {
    if (this.c.x < this.r - 1 || this.c.x > (width - this.r) + 1) {
      this.vel.x = -this.vel.x ;
    }
    if (this.c.y < this.r - 1 || this.c.y > (height - this.r) + 1) {
      this.vel.y = -this.vel.y ;
    }
  }

  update() {
    this.c.x += this.vel.x;
    this.c.y += this.vel.y;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.c.x, this.c.y);

    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    ctx.arc(0, 0, this.r - this.lineWidth, 0, 2 * pi);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
