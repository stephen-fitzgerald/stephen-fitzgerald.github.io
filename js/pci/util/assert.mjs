// @ts-check
/*jshint esversion: 6 */

import { printToHTML } from './print-to-html.mjs';

// for sync tests
export function assert(condition, message) {

    try {
        let msg = typeof message === 'string' ? message : '';
        if (condition) {
            console.log('✔ ' + msg);
            printToHTML('✔ ' + msg, "green");
        } else {
            console.error('✖ ' + 'FAILED: ' + msg);
            printToHTML('✖ ' + msg, "red");
        }
    } catch (error) {
        //assert.exitCode = 1;
        console.error('✖ ' + error);
        printToHTML('✖ ' + error);
    }
}
/**
 * 
 * @param {number} a 
 * @param {number} b 
 * @returns {number} Abs(a - b) / a
 */
export function diff(a, b) {
    return Math.abs((a - b) / a);
}
