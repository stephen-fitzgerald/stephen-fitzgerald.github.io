// @ts-check
/* jshint esversion: 6 */

import { printToHTML } from "../js/pci/util/print-to-html.mjs";
import { AbstractView } from "./abstract-view.mjs";

export class UuidView extends AbstractView {
    constructor(args = {}) {
        super(args);
    }

    async buildHTML() {
        this.html = `
            <div id="uuid" style="padding:2rem"></div>
        `;
        return this.html;
    }

    addListeners() {
    }

    modelToView() {

        let bodyStyles = window.getComputedStyle(document.body);
        let textColor = bodyStyles.getPropertyValue('--text-clr');
        let myDiv = document.getElementById("uuid");

        if (myDiv) {
            let max = 24000;

            printToHTML(`Here are ${max} UUIDs:`, 'black', myDiv);
            printToHTML(` `, 'black', myDiv);

            let uuid;
            for (let i = 1; i <= max; i++) {
                uuid = window.crypto.randomUUID();
                printToHTML(`${i < 10 ? ' ' + i : i}) ${uuid}`, textColor, myDiv);
            }
        }
    }
}
