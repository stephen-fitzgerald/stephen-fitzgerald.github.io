// @ts-check
/*jshint esversion: 6 */

import { interpolateY, interpolateX } from './functions.mjs';
import { registerClazzConstructor } from './serialize.mjs';


export class Profile {
    /**
     * A Profile is a set of x positions and corrisponding outer diameters.
     * The Profile object handles interpolation of OD vs x position.
     *
     * @param {object} [options]
     * @param {number[]} options.xPositions x positions, in meters
     * @param {number[]} options.oDiameters corrisponding outer diameters, in meters
     */
    constructor(options) {
        this._clazz = 'Profile';
        this.xPositions = null;
        this.oDiameters = null;
        if (options && Array.isArray(options.xPositions) && Array.isArray(options.oDiameters)) {
            if (options.xPositions.length == options.oDiameters.length) {
                this.xPositions = options.xPositions;
                this.oDiameters = options.oDiameters;
            } else {
                throw new Error('Bad profile data.  Different number of values in x, OD arrays.');
            }
        }
    }

    getXMin() {
        return this.xPositions[0];
    }

    getXMax() {
        return this.xPositions[this.xPositions.length - 1];
    }
    /**
     * Interpolate the OD of this profile for a given x position
     *
     * @param {number} x position in meters from origin
     * @returns {number} the outer diameter of the part at x, in meters
     */
    getOdForPos(x) {
        return interpolateY(x, this.xPositions, this.oDiameters, undefined);
    }
    /**
     *  Finds the position in range (xMin-xMax) with the desired diameter
     *
     * @param {number} od the desired OD (m)
     * @param {number} [xMin] the lower end of the range to search (m)
     * @param {number} [xMax] the upper end of the range to search (m)
     * @returns {number} smallest x (m) with matching OD, or undefined if not found
     */
    getPosForOd(od, xMin, xMax) {
        let xArray = [];
        let yArray = [];
        let len = this.xPositions.length;
        for (let i = 0; i < len; i++) {
            if ((xMin == undefined || xMin <= this.xPositions[i]) &&
                (xMax == undefined || xMax >= this.xPositions[i])) {
                xArray.push(this.xPositions[i]);
                yArray.push(this.oDiameters[i]);
            }
        }
        let ret;
        if (xArray.length > 1) {
            ret = interpolateX(od, xArray, yArray);
        }
        return ret;
    }
}

registerClazzConstructor('Profile', Profile);