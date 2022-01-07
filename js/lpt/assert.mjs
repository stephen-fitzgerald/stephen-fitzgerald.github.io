// @ts-check
/*jshint esversion: 6 */

import { printToHTML } from './printToHTML.mjs';

// for sync tests
export function assert(condition, message) {

    try {
        let msg = typeof message === 'string' ? message : '';
        if (condition) {
            console.log('✔ ' + msg);
            printToHTML('✔ ' + msg);
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

export function diff(a, b) {
    return Math.abs((a - b) / a);
}
