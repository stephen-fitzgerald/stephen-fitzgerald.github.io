//@ts-check

import { Database } from "./database.mjs";
import { Material } from "./pci/lpt/material.mjs";
import { Laminate } from "./pci/lpt/lpt.mjs";
import { getBatLaminates } from "../data/bat-laminates.mjs";
import { getMaterials } from "../data/materials-data.mjs";

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

  let stateStore = db.createObjectStore("state", {
    keyPath: "id",
    autoIncrement: false,
  });

  // load bootstrap data
  stateStore.transaction.oncomplete = function (event) {

    let stateTransaction = db.transaction("state", "readwrite");
    let stateObjectStore = stateTransaction.objectStore("state");
    stateObjectStore.add({
      id: 1,
      materials: materialsList,
      laminates: batLaminates,
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
