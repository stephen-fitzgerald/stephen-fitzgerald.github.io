// @ts-check
/* jshint esversion: 6 */

const COMPONENT_NAME = 'wc-w-fetch';

async function fetchFile(path) {
  const response = await fetch(path);
  const text = await response.text();
  return text;
}

export default class WCWithFetch extends HTMLElement {

  constructor() {
    super();
    // can't fetch files here because constructors
    // can not be async
  }

  async connectedCallback() {

    this.attachShadow({ mode: "open" });

    const style = new CSSStyleSheet();
    this.css = await fetchFile("./" + COMPONENT_NAME + ".css");
    style.replaceSync(this.css);
    if (this.shadowRoot)
      this.shadowRoot.adoptedStyleSheets = [style];

    const template = document.createElement("template");
    this.html = await fetchFile("./" + COMPONENT_NAME + ".html");
    template.innerHTML = this.html;
    if (this.shadowRoot)
      this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.onclick = this.onClick.bind(this);
  }

  onClick(e){
    console.log('click');
  }
}

customElements.define(COMPONENT_NAME, WCWithFetch);
