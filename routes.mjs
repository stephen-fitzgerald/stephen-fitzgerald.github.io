// @ts-check
/*jshint esversion: 6 */

import { MaterialView } from "./views/material-view.mjs";
import { MaterialEditView } from "./views/material-edit-view.mjs";
import { MaterialsListView } from "./views/materials-list-view.mjs";
import { MaterialsCreateView } from "./views/materials-create-view.mjs";
import { StaticView } from "./views/static-view.mjs";
import { BCView } from "./views/barrel-compression.mjs";

export function getRoutes() {

  let routes = {

    "/": new StaticView({ title: "Stratus LPT", path: "/views/home.html" }),
    "/about": new StaticView({ title: "Stratus LPT: About", path: "/views/about.html", }),
    "/barrel-comp": new BCView({ title: "Stratus LPT:Barrel Compression", path: "/views/barrel-compression.html", }),

    "/material/:id": new MaterialView({ title: "Stratus LPT:Material", html: "Material View", }),
    "/material/:id/edit": new MaterialEditView({ title: "Stratus LPT: Material Edit", html: "Material Edit", }),

    "/materials": new MaterialsListView({ title: "Stratus LPT: Materials List" }),
    "/materials-create": new MaterialsCreateView({ title: "Stratus LPT: New Material" }),

    Error404: new StaticView({ title: "Stratus LPT: File Not Found", path: "/views/404.html" }),
  };

  return (routes);
}