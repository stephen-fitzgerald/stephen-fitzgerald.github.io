/*jshint esversion: 6 */
// @ts-check

import { assert, diff } from "../../js/pci/util/assert.mjs";
import { integrateFunction, isFunction } from "../../js/pci/util/functions.mjs";
import { printToHTML } from "../../js/pci/util/print-to-html.mjs";

export function integrateTest() {

    assert( true, "/*******************   Starting integration test.   ***************************");
    assert( false, "This is just a test to make sure assert() is working.");

    let abs = Math.abs;

    let eps = 1e-9;

    printToHTML("-------------------------Start of tests for integrate.js --------------------------------------\n");

    function fx(x) {
        return x;
    }

    function xSq(x) {
        return x * x;
    }

    function xCubed(x) {
        return x * x * x;
    }

    assert(isFunction(fx), 'fx is a function');
    assert(!isFunction(fx(0)), 'fx(0) is not a function');

    let obj = {
        func: function (x) {
            return x;
        },
        prop: 'this is a string',
    };
    obj.otherFunc = function (x) {
        return x;
    };

    assert(isFunction(obj.func), 'obj.func is a function');
    assert(isFunction(obj.otherFunc), 'obj.otherFunc is a function');
    assert(!isFunction(obj.prop), 'obj.prop is not a function');
    assert(!isFunction(String("a string")), 'a String is not a function');
    assert(isFunction(Object.call), 'Object.call is a function');


    let result = integrateFunction(fx, 0, 4);
    assert(diff(result, 8) < eps, 'integral of f(x)=x from 0 to 4 = 8 (= ' + result + ")");

    result = integrateFunction(fx, 4, 0);
    assert(diff(result, -8) < eps, 'integral of f(x)=x from 4 to 0 = -8 (= ' + result + ")");

    result = integrateFunction(fx, 0, -4);
    assert(diff(result, 8) < eps, 'integral of f(x)=x from 0 to -4 = 8 (= ' + result + ")");

    result = integrateFunction(fx, -4, 0);
    assert(diff(result, -8) < eps, 'integral of f(x)=x from -4 to 0 = -8 (= ' + result + ")");

    result = integrateFunction(xCubed, -4, 4);
    let expected = 0.0;
    let d = result - expected;
    assert( abs(d) < eps, 'integral of f(x)=x^3 from -4 to 4 = 0 (= ' + result + ")");


    printToHTML("\n-------------------------End of tests for integrate.js --------------------------------------\n\n");
}