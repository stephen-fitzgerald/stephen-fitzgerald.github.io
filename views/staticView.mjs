//@ts-check

import { AbstractView } from "./abstractViewx.mjs";
import {cleanHTML} from "../js/ext/vjs-toolkit/cleanHTML.mjs"

export class StaticView extends AbstractView {
  constructor(args) {
    super(args);
    this.html = undefined;
    this.path = args ? args.path : undefined;
  }

  async buildHTML() {
    if (this.html == undefined) {
      let response = await fetch(this.path);
      let html = await response.text();
      this.html = cleanHTML(html);
    }
    return this.html;
  }
}