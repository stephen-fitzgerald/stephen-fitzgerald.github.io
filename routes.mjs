// @ts-check
/*jshint esversion: 6 */

import { MaterialView } from "./views/material-view.mjs";
import { MaterialEditView } from "./views/material-edit-view.mjs";
import { MaterialsListView } from "./views/materials-list-view.mjs";
import { MaterialsCreateView } from "./views/materials-create-view.mjs";
import { StaticView } from "./views/static-view.mjs";
import { BCView } from "./views/barrel-compression.mjs";
import { Cube3dView } from "./views/cube3d-view.mjs";
import { UuidView } from "./views/uuid-view.mjs";
import { ChartView } from "./views/chart-view.mjs";

// these routes never get re-initialized
let staticRoutes = {

  "/": new StaticView({ title: "Stratus LPT", path: "/views/home.html" }),
  "/about": new StaticView({ title: "Stratus LPT: About", path: "/views/about.html", }),
  "/barrel-comp": new BCView({ title: "Stratus LPT:Barrel Compression", path: "/views/barrel-compression.html", }),

  "/material/:id": new MaterialView({ title: "Stratus LPT:Material", html: "Material View", }),
  "/material/:id/edit": new MaterialEditView({ title: "Stratus LPT: Material Edit", html: "Material Edit", }),

  "/materials": new MaterialsListView({ title: "Stratus LPT: Materials List" }),
  "/materials-create": new MaterialsCreateView({ title: "Stratus LPT: New Material" }),

  "/cube": new Cube3dView({ title: "Stratus LPT: 3D Cube" }),
  "/uuid": new UuidView({ title: "Stratus LPT: UUID Test" }),
  "/chart": new ChartView({ title: "Stratus LPT: Chart.js Test" }),

  Error404: new StaticView({ title: "Stratus LPT: File Not Found", path: "/views/404.html" }),
};

// add any routes that need to be instantiated on a per-call basis.
function buildRoutes(routes = {}) {
  // does nothing yet
  return (routes);
}

/**
 * 
 * @returns {Object} routes - a path & corrisponding AbstractView
 */
export function getRoutes() {
  return (buildRoutes(staticRoutes));
}