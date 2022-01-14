// @ts-check
import { materialTest } from "./materialTest.js";
import { lptTest } from "./lptTest.js";
import { integrateTest } from "./integrateTest.js";

/**
 * Main application entry point
 */
const app = async () => {
    console.log("Starting _unitTests");
    lptTest();
    materialTest();
    integrateTest();
};

document.addEventListener("DOMContentLoaded", app);
