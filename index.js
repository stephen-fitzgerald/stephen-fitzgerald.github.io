// @ts-check
/*jshint esversion: 6 */

import { router } from "./js/router.mjs";

/**
 * Main application element, simply registers the web components
 */
const app = async () => {

    // Listen on hash change:
    window.addEventListener('hashchange', router);
    // Listen on page load:
    window.addEventListener('load', router);
};

document.addEventListener("DOMContentLoaded", app);