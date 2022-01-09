// @ts-check
/* jshint esversion: 6 */

import { router } from "./js/router.mjs";
import { Database } from "./js/database.mjs";
import { getMaterials } from "./data/materialsData.mjs";

/**
 * Main application element, simply adds listeners for the router.
 */
const app = async () => {
  // Listen on hash change:
  window.addEventListener("hashchange", router);
  // Listen on page load:
  window.addEventListener("load", router);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  let idb = await new Database("stratusdb", 1, (db, oldVersion, newVersion) => {
    // upgrade database
    switch (oldVersion) {
      case 0: {
        db.createObjectStore("data");
      }
    }
  });

  let materials = await idb.get("data", "materials");
  if (!(materials instanceof Array)) {
    materials = getMaterials();
    let r = await idb.set("data", "materials", materials);
  }
};

document.addEventListener("DOMContentLoaded", app);
