// @ts-check

import { router } from "./js/router.mjs";
import { configureDatabase } from "./js/database-config.mjs";

const MENU_ID = "left-nav";

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
  let navPane = document.getElementById(MENU_ID);
  if (menuIcon != undefined) {
    menuIcon.addEventListener("click", (event) => {
      if (navPane) {
        if (navPane.style.display == "none") {
          navPane.style.display = "";
        } else {
          navPane.style.display = "none";
        }
      }
      return false;
    });
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
};

document.addEventListener("DOMContentLoaded", app);

function addListenerToNavItems() {
  let aElements = getLeftNavItems();
  aElements.forEach((el) => {
    el.addEventListener("click", setActiveNavElement);
  });
}

function setActiveNavElement(el) {
  clearActiveNavElement();
  el.target.classList.add('active');
}

function clearActiveNavElement() {
  let navElements = getLeftNavItems();
  navElements.forEach((el) => {
    el.classList.remove('active');
    if (el.classList.length === 0) {
      el.removeAttribute("class");
    }
  });
}

function getLeftNavItems() {
  return document.getElementById(MENU_ID)?.querySelectorAll('a');
}

export function getDomRefsById() {
  let $refs = {};
  document.querySelectorAll('[id]').forEach($el => {
    let key = $el.id.replace(/-(.)/g, (_, s) => s.toUpperCase());
    $refs[key] = $el;
  });
  console.log($refs);
  return $refs;
}

/**
 *
 * @param {*} data
 * @param {string} filename
 * @param {string} type
 */
export function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  var a = document.createElement("a"),
    url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
