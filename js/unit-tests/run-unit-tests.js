// @ts-check
import { materialTest } from "./tests/material-test.js";
import { lptTest } from "./tests/lpt-test.js";
import { integrateTest } from "./tests/integrate-test.js";

/**
 * Main application entry point
 */
const app = async () => {
    console.log("Starting unit tests");
    lptTest();
    materialTest();
    integrateTest();
};

document.addEventListener("DOMContentLoaded", app);
