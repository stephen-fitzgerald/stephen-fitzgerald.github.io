// @ts-check
import { materialTest } from "./tests/material-test.js";
import { lptTest } from "./tests/lpt-test.js";
import { integrateTest } from "./tests/integrate-test.js";
import { layupTest } from "./tests/layup-test.js";

/**
 * Main application entry point
 */
const app = async () => {
    console.log("Starting unit tests");
    layupTest();
    lptTest();
    materialTest();
    integrateTest();
};

document.addEventListener("DOMContentLoaded", app);
