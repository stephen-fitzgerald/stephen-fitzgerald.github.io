import {hslStrToObj} from './color.mjs';

/*
  <dropdown-checklist>
    #shadow-root (open)
      <style id='styleEl'></style>
      <div id='rootEl'>
        <span id='anchorEl'>label<span><::after>
        <ul id='itemsEl'>
          <li id='item-0'>
          <li id='item-1'>
          <li id='item-2'>
          <li id='item-3'>
        </ul>
      </div>
  </dropdown-checklist>

  items = [
    { name: 'My first item', checked: true },
    { name: 'My second item', checked: true },
    { name: 'My unchecked item', checked: false },
  ];
*/

const html = String.raw;

class DropdownChecklist extends HTMLElement {

  static count = 0;

  constructor() {
    super();

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({ mode: 'open' });

    // attach styles
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = this.styleText;
    this.styleEl.setAttribute('id', 'styleEl');

    // create a div as a top-level container
    this.rootEl = document.createElement('div');
    this.rootEl.setAttribute('id', 'rootEl');

    // create a span for the anchor/button element
    this.anchorEl = document.createElement("span");
    this.anchorEl.textContent = this.label;
    this.anchorEl.setAttribute('id', 'anchorEl');

    // create a list for items. Items get added
    // when this.items is set
    this.itemsEl = document.createElement("ul");
    this.itemsEl.setAttribute('id', 'itemsEl');

    // anchor and list are children of the root div
    this.rootEl.appendChild(this.anchorEl);
    this.rootEl.appendChild(this.itemsEl);

    // add style and root div to shadow dom
    shadowRoot.appendChild(this.styleEl);
    shadowRoot.appendChild(this.rootEl);

    this.items = this.dummyData;
  }

  get items() {
    let listItems = this.rootEl.querySelectorAll('li input[type=checkbox]');
    let ret = [];
    listItems.forEach((item) => {
      ret.push(
        { name: item.name, checked: item.checked }
      );
    });
    return ret;
  }

  set items(itemsArray) {
    this._clearItemsList();
    const ul = this.itemsEl;
    itemsArray.forEach((item, index, arr) => {
      ul.appendChild(
        this.createListItem(
          { name: item.name, checked: item.checked, id: `item-${index}` }
        )
      );
    });
    this.updateStyle();
  }

  createListItem(obj) {
    let cb = document.createElement("input");
    cb.setAttribute("type", "checkbox");
    cb.name = obj.name;
    cb.checked = obj.checked ? true : false;
    cb.setAttribute("id", obj.id);
    cb.addEventListener("click", this._cbListener.bind(this));

    let lbl = document.createElement("label");
    lbl.htmlFor = obj.id;
    lbl.textContent = obj.name;

    let li = document.createElement('li');
    li.appendChild(cb);
    li.appendChild(lbl);
    return (li);
  }

  _cbListener(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.items,
      }),
    );
  }

  _clearItemsList() {
    const ul = this.itemsEl;
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }

  get label() {
    let ret = this.getAttribute('label');
    return (ret ? ret : 'Select');
  }

  set label(str) {
    if (str && str != '') {
      this.setAttribute('label', '' + str);
    } else {
      this.removeAttribute('label');
    }
  }

  get expanded() {
    return this.hasAttribute('expanded');
  }

  set expanded(val) {
    if (val) {
      this.setAttribute('expanded', '');
    } else {
      this.removeAttribute('expanded');
    }
  }

  get dummyData() {
    return ([
      { name: `Apples`, checked: true },
      { name: `Oranges` },
      { name: `Bananas`, checked: 0 },
      { name: `A fruit to be named later`, checked: 'k' },
      { name: `Kiwi fruit`, checked: 1 }
    ]);
  }

  anchorClicked(e) {
    this.expanded = !this.expanded;
  }

  updateStyle() {
    this.styleEl.textContent = this.styleText;
  }

  connectedCallback() {
    // browser calls this method when the element is added to the document
    // (can be called many times if an element is repeatedly added/removed)
    this.anchorEl.onclick = this.anchorClicked.bind(this);
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
    this.anchor.removeEventListener('click', this.anchorClicked.bind(this));
  }

  static get observedAttributes() {
    /* array of attribute names to monitor for changes */
    return ['expanded', 'label', 'items'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    if (name === 'label') { this.anchorEl.textContent = this.label; }
    if (name === 'items') { this.items = JSON.parse(newValue); }
    this.updateStyle();
    this.wasClicked();
  }

  /**
   * called when the element is moved to a new document
   * (happens in document.adoptNode, very rarely used)
   *
   * @memberof MyElement
   */
  adoptedCallback() {
    // todo - remove listeners?
    console.log('adoptedCallback');
  }

  wasClicked(){
    let styles = getComputedStyle(this);
    let colorPrimary =  getComputedStyle(this).colorPrimary;
    let anchorColor =  getComputedStyle(this.anchorEl).color;
    let colorPrimaryProp = styles.getPropertyValue('--color-primary');
    console.log('Anchor color = '+ anchorColor);
    console.log('Primary color = '+ colorPrimary);
    console.log('Primary color property = '+ colorPrimaryProp);
  }

  get styleText() {
    let rot = this.expanded ? '45deg' : '-45deg';
    let anchorColor = this.expanded ? 'var(--anchor-color-expanded)' : 'var(--anchor-color)';
    let anchorBgColor = this.expanded ?
      'var(--anchor-background-color-expanded)' : 'var(--anchor-background-color)';
    let anchorBorderColor = 'var(--anchor-border-color)';
    let listColor = 'var(--list-color)';
    let listBgColor = 'var(--list-background-color)';
    let listBorderColor = 'var(--list-border-color)';

    let ret = `

      :host {

        --lighten-percentage: 20%;
        --darken-percentage: 15%;

        --color-primary-h: 0;
        --color-primary-s: 50%;
        --color-primary-l: 75%;

        --color-primary: hsl(
            var(--color-primary-h), 
            var(--color-primary-s), 
            var(--color-primary-l)
          );
        --color-primary-light: hsl(
            var(--color-primary-h), 
            var(--color-primary-s), 
            min(100%,calc(var(--color-primary-l) + var(--lighten-percentage)))
          );
        --color-primary-dark: hsl(
            var(--color-primary-h), 
            var(--color-primary-s), 
            max(0%,calc(var(--color-primary-l) - var(--darken-percentage)))
          );

        --anchor-color: inherit;
        --anchor-color-expanded: var(--color-primary-dark);
        --anchor-background-color: inherit;
        --anchor-background-color-expanded: var(--color-primary-light);
        --anchor-border-color: var(--anchor-color);
        --anchor-border-radius: 0.35rem;

        --list-color: ${anchorColor};
        --list-border-color: ${anchorBorderColor};
        --list-background-color: ${anchorBgColor};


      }

      #rootEl { 
        display: inline-block;
        position: relative;
        color: inherit;
        border-radius: var(--anchor-border-radius);
      }

      #anchorEl {
        position: relative;
        cursor: pointer;
        display: inline-block;
        padding: 5px 1.5rem 5px 10px;
        border: 1px solid #ccc;
        border-color: ${anchorBorderColor};
        border-radius: inherit;
        color: ${anchorColor};
        background-color: ${anchorBgColor};
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
      }
      
      #anchorEl:after {
        position: absolute;
        right: 10px;
        top: 35%;
        content: "";
        border-right: 2px solid;
        border-bottom: 2px solid;
        border-color: ${anchorColor};
        padding: 0.2rem 0.2rem 0.2rem 0.2rem;
        -moz-transform: rotate(${rot});
        -ms-transform: rotate(${rot});
        -o-transform: rotate(${rot});
        -webkit-transform: rotate(${rot});
        transform: rotate(${rot});
        transition-property: transform;
        transition-duration: 0.2s;
      }

      #itemsEl {
        width: max-content;
        position: absolute;
        left: var(--anchor-border-radius);
        top: 95%;
        display: ${this.expanded ? 'flex' : 'none'};
        padding: .25rem .5rem .25rem .5rem;
        margin: 0;
        border: 1px solid;
        border-color: ${listBorderColor};
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
        flex-direction: column;
        color: ${listColor};
        background-color: ${listBgColor};
        z-index: 200;
      }

      li {
        list-style: none;
        padding: 0.1rem;
      }

      input[type="checkbox"]{
        display: inline-block;
        vertical-align: middle;
        position: relative;
        bottom: 0.1rem;
        right: 0.2rem;
      }
    `;
    return ret;
  }
  // there can be other element methods and properties
}

customElements.define("dropdown-checklist", DropdownChecklist);