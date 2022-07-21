// @ts-check
/* jshint esversion: 6 */

import { AbstractView } from "./abstract-view.mjs";

export class MapView extends AbstractView {

    constructor(args = {}) {
        super(args);
        this.title = args.title || "Open Street Map via Leaflet";
    }

    buildHTML() {
        this.html = `   
        <h1> Here's a map.</h1>
        <div style="height: 1024px" id="map" ></div>
        `;

        return this.html;
    }

    addListeners() {
        document.title = this.title;
    }

    modelToView() {
        let myMap = L.map('map');
        myMap.setView([44.629924, -64.055627], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(myMap);
    }


}