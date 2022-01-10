//@ts-check

import { Database } from "../js/database.mjs";
import { Material } from "../js/pci/lpt/material.mjs";
import { Laminate } from "../js/pci/lpt/lpt.mjs";
import { getBatLaminates } from "./batLaminates.mjs";
import { getMaterials } from "./materialsData.mjs";

export async function configureDatabase() {
  let idb = await new Database(
    "stratusdb",
    1,
    async (db, oldVersion, newVersion) => {
      switch (oldVersion) {
        //  v0 = no data in db yet, add a some materials & laminates
        case 0: {
          setupObjectStores(db, oldVersion, newVersion);
        }
      }
    }
  );
  return idb;
}

function setupObjectStores(db, oldVersion, newVersion) {
  // get materials before transactions start
  let materialsList = getBootstrapMaterials();
  let batLaminates = getBootstrapLaminates();

  let materialsStore = db.createObjectStore("materials", {
    keyPath: "id",
    autoIncrement: true,
  });
  materialsStore.createIndex("name", "_name", { unique: false });

  let laminatesStore = db.createObjectStore("laminates", {
    keyPath: "id",
    autoIncrement: true,
  });
  laminatesStore.createIndex("name", "_name", { unique: false });

  // load bootstrap data
  laminatesStore.transaction.oncomplete = function (event) {
    let laminateObjectStore = db
      .transaction("laminates", "readwrite")
      .objectStore("laminates");
    batLaminates.forEach((laminate) => {
      laminateObjectStore.add(laminate);
    });

    let materialObjectStore = db
      .transaction("materials", "readwrite")
      .objectStore("materials");
    materialsList.forEach((material) => {
      materialObjectStore.add(material);
    });
  };
}

/**
 *
 * @returns {Material[]} Materials to seed the database
 */
function getBootstrapMaterials() {
  let materialsList = getMaterials();
  let batMaterials = Array.from(getBatLaminates().materials.values());
  batMaterials.forEach((m) => {
    materialsList.push(m);
  });
  return materialsList;
}

/**
 *
 * @returns {Laminate[]} Laminates to seed the database
 */
function getBootstrapLaminates() {
  return Array.from(getBatLaminates().laminates.values());
}
