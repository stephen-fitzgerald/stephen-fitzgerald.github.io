// @ts-check
/* jshint esversion: 6 */

import { AbstractView } from "./abstract-view.mjs";
import * as L from "../js/ext/leaflet/leaflet-src.esm.js";

export class MapView extends AbstractView {

    constructor(args = {}) {
        super(args);
        this.title = args.title || "Open Street Map via Leaflet";
    }

    /**
     *
     * @return {Promise<string>} the html for the view
     */
    async buildHTML() {
        this.html = `
        <div style="height:100%;  display:flex; flex-direction:column;">
            <h1> Here's a map.</h1>
            <div style="height: 100%" id="map" ></div>
        </div>
        `;

        return this.html;
    }

    addListeners() {
        document.title = this.title;
    }

    modelToView() {
        let myMap = L.map('map');
        myMap.setView([44.629924, -64.055627], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap",
        }).addTo(myMap);
    }


}

export class MapViewComponent extends HTMLElement {
    constructor(){
        super();
    }
}