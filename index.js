// @ts-check

import { router } from "./js/router.mjs";
import { configureDatabase } from "./js/database-config.mjs";

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
    Set up a menu button to hide/show the navigation pane
  */
    let menuIcon = document.getElementById("hamburger-icon");
    let navPane = document.getElementById("left-nav");
    if (menuIcon != undefined ) {
      menuIcon.addEventListener("click", (event) => {
        if (navPane.style.display == "none") {
          navPane.style.display = "";
        } else {
          navPane.style.display = "none";
        }
        return false;
      });
    }

    /*
      Set up a menu button to login/logout 
    */
    menuIcon = document.getElementById("login-icon");
    if (menuIcon != undefined ) {
      menuIcon.addEventListener("click", (event) => {
       alert("Someday this may be a login or logout dialog.");
       return false;
      });
    }
};

document.addEventListener("DOMContentLoaded", app);
