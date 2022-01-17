// @ts-check
/* jshint esversion: 6 */

import { parseRequestURL } from "../js/router.mjs";

export class AbstractView {
  constructor(args = {}) {
    this.title = args.title || "Page Title";
    this.html = args.html || "<h1> This template is empty.</h1>";
  }

  buildHTML() {
    this.request = parseRequestURL();
    return this.html;
  }

  addListeners() {
    document.title = this.title;
  }

  modelToView() {
    let parent = document.getElementById('main-container');
    let e = document.createElement("DIV");
    e.innerHTML = `Resolution is: ${window.screen.width} x ${window.screen.height}`
    parent.appendChild(e);
  }
}
