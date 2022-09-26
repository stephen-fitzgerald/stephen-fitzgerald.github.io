// @ts-check
/* jshint esversion: 6 */
//========================================================================================

const psiToPa = 6894.7573;

/**
 * A CompactionModel describes the relationship between compaction pressure and fiber
 * volume fraction.  Pressure usually increases with fiber volume fraction according 
 * to a power law. This implementation just interpolates using pressure & vf arrays.
 */
export class CompactionModel {

    /**
     * 
     * @param {Object} [args] equal length args.vfs and args.pressures arrays
     * @param {number[]} [args.vfs] must match length of pressures
     * @param {number[]} [args.pressures] must match length of vfs
     * @returns 
     */
    constructor(args = {}) {

        let p = psiToPa;
        let options = {
            pressures: [0.00, 14.7 * p, 50.0 * p, 120.0 * p, 400.0 * p, 1000.0 * p],
            vfs: [0.52, 0.545, 0.570, 0.60, 0.665, 0.685],
        };
        
        options = Object.assign(options, args);

        this._pressures = options._pressures || options.pressures;
        this._vfs = options._vfs || options.vfs;

        CompactionModel.checkArrays(this._vfs, this._pressures);
        return this;
    }

    /**
     * @returns {number} lowest Vf in this model 0 < Vf <= 1.0
     */
    get minVf() {
        return this._vfs[0];
    }

    /**
     * @returns {number} highest Vf in this model 0 < Vf <= 1.0
     */
    get maxVf() {
        return this._vfs[this._vfs.length - 1];
    }

    /**
     * @returns {number} lowest pressure, in Pa
     */
    get minPressure() {
        return this._pressures[0];
    }

    /**
     * @returns {number} highest pressure, in Pa
     */
    get maxPressure() {
        return this._pressures[this._pressures.length - 1];
    }

    /**
     * Get the Vf for a given compaction pressure
     * @param {number} p pressure in Pa that you want the Vf for
     * @returns vf for p, where 0 < vf <= 1.0
     */
    getVfAtPressure(p) {
        if (p <= this.minPressure) {
            return this.minVf;
        }
        if (p >= this.maxPressure) {
            return this.maxVf;
        }
        let i = 1;
        while (this._pressures[i] < p) {
            i++;
        }
        // p <= this.pressures[i] && i > 0
        let vfa = this._vfs[i - 1];
        let vfb = this._vfs[i];
        let pa = this._pressures[i - 1];
        let pb = this._pressures[i];
        return vfa + (vfb - vfa) * (p - pa) / (pb - pa);
    }

    /**
     * 
     * @param {number} vf fiber volume fraction where 0.0 < vf <= 1.0
     * @returns The compaction pressure, in Pa, required to achieve the given vf
     */
    getPressureForVf(vf) {
        if (vf <= this.minVf) {
            throw new Error(`Vf below possible range ( ${this.minVf} - ${this.maxVf} )`);
        }
        if (vf >= this.maxVf) {
            throw new Error(`Vf above possible range ( ${this.minVf} - ${this.maxVf} )`);
        }
        let i = 1;
        while (this._vfs[i] < vf) {
            i++;
        }
        // vf <= this.vfs[i] && i > 0
        let vfa = this._vfs[i - 1];
        let vfb = this._vfs[i];
        let pa = this._pressures[i - 1];
        let pb = this._pressures[i];
        return pa + (pb - pa) * (vf - vfa) / (vfb - vfa);
    }

    /**
     * Static method to check data arrays for valid compaction model.
     * @param {number[]} vfs 0.0 < vf[i-1] < vf[i] < vf[i+1] <= 1.0
     * @param {number[]} pressures 0.0 < p[i-1] < p[i] < p[i+1]
     * @returns {boolean} true if arrays are valid compaction model
     * @throws {Error} if any issues found
     */
    static checkArrays(vfs, pressures) {
        if (!Array.isArray(vfs)) {
            throw new Error("Vf argument is not an array");
        }
        if (!Array.isArray(pressures)) {
            throw new Error("Pressures argument is not an array");
        }
        if (vfs.length < 1) {
            throw new Error("Vfs array is empty.");
        }
        if (pressures.length < 1) {
            throw new Error("Pressures array is empty.");
        }
        if (vfs.length !== pressures.length) {
            throw new Error("Pressure & vf arrays have different lengths.");
        }
        for (let i = 0; i < vfs.length; i++) {
            if (vfs[i] <= 0.0 || vfs[i] > 1.0) {
                throw new Error(`Argument out of range (0 < vf[i] <= 1.0) : vfs[${i}] = ${vfs[i]}.`);
            }
            if (i > 0 && vfs[i] <= vfs[i - 1]) {
                throw new Error(`Vfs should be an increasing series.`);
            }
            if (i > 0 && pressures[i] <= pressures[i - 1]) {
                throw new Error(`Pressures should be an increasing series.`);
            }
            if (pressures[i] < 0.0) {
                throw new Error(`Pressure must be greater than zero: pressures[${i}] = ${pressures[i]}.`);
            }
        }
        return true;
    }

}










