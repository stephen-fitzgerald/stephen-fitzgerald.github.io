
const html = String.raw;

class DropdownChecklist extends HTMLElement {

  static count = 0;

  constructor() {
    super();
    // element created

    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({ mode: 'open' });

    // attach styles
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = this.styleText;
    this.styleEl.setAttribute('id', 'styleEl');
    shadowRoot.appendChild(this.styleEl);

    // create a div as a top-level container
    // todo - get rid of this
    this.rootEl = document.createElement('div');
    this.rootEl.setAttribute('id', 'rootEl');

    // create span for anchor
    this.anchorEl = document.createElement("span");
    this.anchorEl.textContent = this.label;
    this.anchorEl.setAttribute('id', 'anchorEl');

    // create div for items
    this.itemsEl = document.createElement("ul");
    this.itemsEl.setAttribute('id', 'itemsEl');

    // create labels & input[type='checkbox'] for each item
    this.setItems(this.dummyData);

    this.rootEl.appendChild(this.anchorEl);
    this.rootEl.appendChild(this.itemsEl);
    shadowRoot.appendChild(this.rootEl);
  }

  createListItem(name, value, id, checked) {
    let cb = document.createElement("input");
    cb.setAttribute("type", "checkbox");
    cb.name = name;
    cb.value = value;
    cb.checked = checked ? true : false;
    cb.setAttribute("id", id);
    let lbl = document.createElement("label");
    lbl.htmlFor = id;
    lbl.textContent = name;
    let li = document.createElement('li');
    li.appendChild(cb);
    li.appendChild(lbl);
    return (li);
  }

  get label() {
    let ret = this.getAttribute('label');
    return (ret ? ret : 'Select');
  }

  set label(str) {
    if (str && str!='') {
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
      { name: `Option ${DropdownChecklist.count++}`, value: `1`, checked: true },
      { name: `Option ${DropdownChecklist.count++}`, value: `2` },
      { name: `Option ${DropdownChecklist.count++}`, value: `3`, checked: 0 },
      { name: `A really long long Option ${DropdownChecklist.count++}`, value: `4`, checked: 'k' },
      { name: `Option ${DropdownChecklist.count++}`, value: `5`, checked: 1 }
    ]);
  }

  clearItems() {
    const ul = this.itemsEl;
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }

  setItems(itemsArray) {
    this.clearItems();
    const ul = this.itemsEl;
    itemsArray.forEach((item, index, arr) => {
      ul.appendChild(this.createListItem(item.name, item.value, `item-${index}`, item.checked));
    });
    this.updateStyle();
  }

  /**
   * Get the list items properties as an array of objects
   * 
   * @returns [{name,value,checked}]
   * 
   * @memberOf DropdownChecklist
   */
  getItems() {
    let listItems = this.rootEl.querySelectorAll('li input[type=checkbox]');
    let ret = [];
    listItems.forEach((item) => {
      ret.push(
        { name: item.name, value: item.value, checked: item.checked }
      );
    });
    return ret;
  }

  /**
   * Get the selected items properties as an array of objects
   * 
   * @returns [{name,value,checked}]
   * 
   * @memberOf DropdownChecklist
   */
  getSelectedItems() {
    let ret = this.getItems();
    ret = ret.filter((value, index, arr) => {
      return (value.checked);
    });
    return ret;
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
    return ['expanded', 'label'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    this.updateStyle();
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

  get styleText() {
    let expanded = this.expanded;
    let rot = expanded ? '45deg' : '-45deg';
    let anchorColor = expanded ? '#0094ff' : 'black';

    let ret = `

      #rootEl { 
        display: inline-block;
        position: relative;
      }

      ul {
        padding: 2px;
        display: none;
        margin: 0;
        border: 1px solid #ccc;
        border-top: none;
      }

      li {
        list-style: none;
      }

      #anchorEl {
        position: relative;
        cursor: pointer;
        display: inline-block;
        padding: 5px 50px 5px 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        color: ${anchorColor};
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
      }
      
      #anchorEl:after {
        position: absolute;
        content: "";
        border-right: 2px solid ${anchorColor};
        border-bottom: 2px solid ${anchorColor};
        padding: 5px;
        right: 10px;
        top: 25%;
        -moz-transform: rotate(${rot});
        -ms-transform: rotate(${rot});
        -o-transform: rotate(${rot});
        -webkit-transform: rotate(${rot});
        transform: rotate(${rot});
        transition-property: transform;
        transition-duration: 0.2s;
      }

      #itemsEl {
        position: absolute;
        display: ${expanded ? 'flex' : 'none'};
        padding: .25rem .5rem .25rem .5rem;
        margin: 0;
        border: 1px solid #ccc;
        border-top: none;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
        flex-direction: column;
        background-color: rgba(255, 249, 241, 1);
        z-index: 2;
      }

      input[type="checkbox"]{
        vertical-align: middle;
        position: relative;
        bottom: 1px;
      }
    `;
    return ret;
  }
  // there can be other element methods and properties
}

customElements.define("dropdown-checklist", DropdownChecklist);