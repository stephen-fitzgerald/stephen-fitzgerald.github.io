// @ts-check

import { router } from "./js/router.mjs";
import { configureDatabase } from "./js/database-config.mjs";
import { addListenerToNavItems, toggleNavPane } from "./js/leftNav.mjs";

/**
 * Main application entry point
 */
const app = async () => {

  // Listen on hash change:
  window.addEventListener("hashchange", router);

  // Listen on page load:
  window.addEventListener("load", router);

  // set up service worker for caching
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  // open up the database & bootstrap or update, if needed
  let idb = await configureDatabase();

  /*
    Set up a hamburger button to hide/show the navigation pane
  */
  let menuIcon = document.getElementById("hamburger-icon");
  if (menuIcon !== null) {
    menuIcon.addEventListener("click", toggleNavPane );
  }

  /*
    Left nav is a menu, set class='active' when clicked
  */
  addListenerToNavItems();

  /*
    Set up a menu button to login/logout 
  */
  menuIcon = document.getElementById("login-icon");
  if (menuIcon != undefined) {
    menuIcon.addEventListener("click", (event) => {
      alert("Someday this may be a login or logout dialog.");
      return false;
    });
  }

  //--nav-hilite-clr: rgb(181, 255, 230);--body-bg-clr
  //document.documentElement.style.setProperty('--nav-hilite-clr', 'white');
};

document.addEventListener("DOMContentLoaded", app);