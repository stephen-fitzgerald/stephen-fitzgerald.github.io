// @ts-check
/* jshint esversion: 6 */

export class AbstractView {

  /**
  * Creates an instance of AbstractView.
  * @param {Object} [args]
  * @param {string} [args.title]
  * @param {string} [args.html]
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
   * @param {object} [request]
   * @param {string} [request.resource]
   * @param {string} [request.id]
   * @param {string} [request.verb]
   * 
   * @return {Promise<string | undefined>} the html for the view
   * @memberof AbstractView
   * 
   * @memberOf AbstractView
   */
  async buildHTML(request={}) {
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
