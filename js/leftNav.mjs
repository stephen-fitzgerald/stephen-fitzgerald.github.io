const MENU_ID = "left-nav";

export function addListenerToNavItems() {
    let navElements = getLeftNavItems();
    if (!navElements) {
        console.log("No menu items found in left-nav");
        return;
    }
    navElements.forEach((el) => {
        el.addEventListener("click", setActiveNavElement);
    });
}

export function setActiveNavElement(el) {
    clearActiveNavElement();
    el.target.classList.add('active');
}

function clearActiveNavElement() {
    let navElements = getLeftNavItems();
    if (!navElements) {
        console.log("No menu items found in left-nav");
        return;
    }
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

export function toggleNavPane() {
    let navPane = document.getElementById(MENU_ID);
    if (navPane !== null) {
      if (navPane.style.display == "none") {
        navPane.style.display = "";
      } else {
        navPane.style.display = "none";
      }
      return false;
    }
  }