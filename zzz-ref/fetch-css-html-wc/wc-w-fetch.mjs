const COMPONENT_NAME = 'wc-w-fetch';

export default class WCWithFetch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const style = new CSSStyleSheet();
    const template = document.createElement("template");

    fetch("./" + COMPONENT_NAME + ".css").then((res) =>
      res.text().then((css) => {
        style.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [style];
      })
    );

    fetch("./" + COMPONENT_NAME + ".html").then((res) =>
      res.text().then((html) => {
        template.innerHTML = html;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
      })
    );
  }
}

customElements.define(COMPONENT_NAME, WCWithFetch);
