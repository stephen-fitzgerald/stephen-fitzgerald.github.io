// @ts-check
/* jshint esversion: 6 */

import { router } from "./js/router.mjs";
import { Database } from "./js/database.mjs";
import { getMaterials } from "./data/materialsData.mjs";
import { getBatLaminates } from "./data/batLaminates.mjs";

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

  let idb = await new Database(
    "stratusdb",
    1,
    async (db, oldVersion, newVersion) => {
      // upgrade database
      switch (oldVersion) {
        case 0: {
          // no data in db yet, add a list of pre-made materials
          /*
            Materials
          */
          let materialsList = getMaterials();
          let data = getBatLaminates();
          let batMaterials = Array.from(data.materials.values());
          let batLaminates = Array.from(data.laminates.values());

          let materialsStore = db.createObjectStore("materials", {
            keyPath: "id",
            autoIncrement: true,
          });
          materialsStore.createIndex("name", "_name", { unique: false });

          materialsStore.transaction.oncomplete = function (event) {
            let materialObjectStore = db
              .transaction("materials", "readwrite")
              .objectStore("materials");
            materialsList.forEach((material) => {
              materialObjectStore.add(material);
            });
            batMaterials.forEach((material) => {
              materialObjectStore.add(material);
            });
          };

          /*
            Laminates
          */
          let laminatesStore = db.createObjectStore("laminates", {
            keyPath: "id",
            autoIncrement: true,
          });
          laminatesStore.createIndex("name", "_name", { unique: false });

          laminatesStore.transaction.oncomplete = function (event) {
            let laminateObjectStore = db
              .transaction("laminates", "readwrite")
              .objectStore("laminates");
            batLaminates.forEach((laminate) => {
              laminateObjectStore.add(laminate);
            });
          };
        }
      }
    }
  );
};

document.addEventListener("DOMContentLoaded", app);
