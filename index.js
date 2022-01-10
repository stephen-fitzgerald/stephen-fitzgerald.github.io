// @ts-check
/* jshint esversion: 6 */

import { router } from "./js/router.mjs";
import { configureDatabase } from "./data/databaseConfig.mjs";

/**
 * Main application entry point
 */
const app = async () => {
  console.log("I'm running");
  // Listen on hash change:
  window.addEventListener("hashchange", router);

  // Listen on page load:
  window.addEventListener("load", router);

  // set up service worker for cahcing
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  // open up the database & bootstrap or update, if needed
  let idb = await configureDatabase();
};

document.addEventListener("DOMContentLoaded", app);
