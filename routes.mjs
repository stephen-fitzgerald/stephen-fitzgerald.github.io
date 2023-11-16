// @ts-check
/*jshint esversion: 6 */

import { AnimationView } from "./views/animation-view.mjs";
import { BCView } from "./views/barrel-compression.mjs";
import { ChartView } from "./views/chart-view.mjs";
import { Cube3dView } from "./views/cube3d-view.mjs";
import { GlassView } from "./views/glass-view.mjs";
import { LayupTableView } from "./views/layup-table.mjs";
import { MapView } from "./views/map-view.mjs";
import { MaterialView } from "./views/material-view.mjs";
import { MaterialEditView } from "./views/material-edit-view.mjs";
import { MaterialsListView } from "./views/materials-list-view.mjs";
import { MaterialsCreateView } from "./views/materials-create-view.mjs";
import { StaticView } from "./views/static-view.mjs";
import { UuidView } from "./views/uuid-view.mjs";

// these routes never get re-initialized
const staticRoutes = {

  "/":                  new StaticView({ title: "Stratus LPT", path: "/views/home.html" }),
  "/about":             new StaticView({ title: "Stratus LPT: About", path: "/views/about.html", }),
  "/barrel-comp":       new BCView({ title: "Stratus LPT:Barrel Compression", path: "/views/barrel-compression.html", }),

  "/material/:id":      new MaterialView({ title: "Stratus LPT:Material", html: "Material View", }),
  "/material/:id/edit": new MaterialEditView({ title: "Stratus LPT: Material Edit", html: "Material Edit", }),
  
  "/materials":         new MaterialsListView({ title: "Stratus LPT: Materials List" }),
  "/materials-create":  new MaterialsCreateView({ title: "Stratus LPT: New Material" }),

  "/cube":              new Cube3dView({ title: "Stratus LPT: 3D Cube" }),
  "/uuid":              new UuidView({ title: "Stratus LPT: UUID Test" }),
  "/chart":             new ChartView({ title: "Stratus LPT: Chart.js Test" }),
  "/animation":         new AnimationView({ title: "Stratus LPT: Animation!" }),
  "/layup":             new LayupTableView({ title: "Stratus LPT: Layup Table" }),

  "/3d-glass":          new GlassView({ title: "Stratus LPT:3D Glass Configurator", path: "/views/glass-view.html" }),

  "/map":               new MapView({ title: "Stratus LPT: A Map!" }),

  Error404:             new StaticView({ title: "Stratus LPT: File Not Found", path: "/views/404.html" }),
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