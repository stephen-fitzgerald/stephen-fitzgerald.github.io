// @ts-check
/* jshint esversion: 6 */

import { parseRequestURL } from "../js/router.mjs";

export class AbstractView {

  /**
  * Creates an instance of AbstractView.
  * @param {Object} [args]
  * @param {string | undefined} [args.title]
  * @param {string | undefined} [args.html]
  * @memberof AbstractView
  */
  constructor(args = {}) {
    this.title = args.title;
    this.html = args.html;
    //console.log("Constructor called: " + new.target.name);
  }

  /**
   * buildHTML() - build the static html for a view
   *
   * @return {Promise<string | undefined>} the html for the view
   * @memberof AbstractView
   */
  async buildHTML() {
    this.request = parseRequestURL();
    return this.html;
  }

  /**
   * addListeners() - called after buildHTML to install any required listeners
   *
   * @memberof AbstractView
   */
  addListeners() {
    document.title = this.title || document.title;
  }

  /**
   * modelToView( time ) - updates the view when required
   *
   * @param time {number} - the current time in ms
   * @memberof AbstractView
   */
  modelToView(time) {
  }
  /**
   * destroy() is called just before a new view replaces this view
   * tear down anything that won't automatically get cleaned up.
   */
  destroy() {
  }
}
