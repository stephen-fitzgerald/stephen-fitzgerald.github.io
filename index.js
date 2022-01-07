// @ts-check
/* jshint esversion: 6 */

import { router } from "./js/router.mjs";

/**
 * Main application element, simply adds listeners for the router.
 */
const app = async () => {
  // Listen on hash change:
  window.addEventListener("hashchange", router);
  // Listen on page load:
  window.addEventListener("load", router);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./js/sw.js");
  }
};

document.addEventListener("DOMContentLoaded", app);
