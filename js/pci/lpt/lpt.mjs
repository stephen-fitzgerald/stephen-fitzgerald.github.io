//@ts-check
/*jshint esversion: 6 */
// moved matrix into local folder

import { Material, Mat_FRP } from './material.mjs';
import { ORIENTATION } from './orientation.mjs';
import { matrixCreate, matrixCopy, matrixInvert, matrixMultiply, matrixAdd, matrixScale } from './matrix.mjs';
import { isNumeric } from '../util/isNumeric.mjs';

let _laminaNumber = 1;

export class AbstractLamina {

    /**
     * Creates an instance of AbstractLamina, which is an abstract super class for specific lamina types.  
     * 
     * All units are basic kg / m / sec / degC. IE moduli are in (kg-m/s^2)/m^2 = N/m^2 = Pa. 
     * 
     * @param {object} [options] optional inialization data
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {boolean} [options.isRandom]
     * 
     * @memberof AbstractLamina
     */
    constructor(options) {
        if (new.target === AbstractLamina) {
            throw new TypeError("Cannot construct abstract class " + new.target.name + " instances directly");
        }
        //this._clazz is used to find the constructor when deserializing
        this._clazz = this.constructor.name;  // will be sub-class name, not AbstractLamina
        this._name = "Lamina # " + _laminaNumber++;
        this._description = "";
        this._isRandom = false;
        if (options) {
            //@ts-ignore
            this._name = options._name || options.name || this._name;
            //@ts-ignore
            this._description = options._description || options.description || this._description;
            //@ts-ignore
            if (options._isRandom != undefined) {
                //@ts-ignore
                this._isRandom = options._isRandom;
            } else if (options.isRandom != undefined) {
                this._isRandom = options.isRandom;
            }
        }
    }

    /**
     * Lamina may be composed of other lamina.  In order to ensure that lamina
     * are not composed of themselves checks may be required.  Basic lamina do not
     * contain any others.  Override this for multi-layered lamina.
     *
     * @param {AbstractLamina} target
     * @return {boolean} 
     * @memberof AbstractLamina
     */
    contains(target) {
        if (!(target instanceof AbstractLamina)) {
            throw new Error("Illegal argument: target must be a AbstractLamina.");
        }
        return false;
    }

    /**
     * A human-friendly name for a Lamina.
     * @type {string}
     * @memberof AbstractLamina
     */
    get name() { return this._name; }
    set name(value) { this._name = String(value); }

    /**
     * A human-friendly description of a Lamina.
     * @type {string}
     * @memberof AbstractLamina
     */
    get description() { return this._description; }
    set description(value) { this._description = value; }

    /**
     * Randomize properties in 1-2 plane?
     * @type {boolean}
     * @memberof AbstractLamina
     */
    get isRandom() { return this._isRandom; }
    set isRandom(value) { this._isRandom = value ? true : false; }

    /**
     * Total areal weight, in kg/sq.m
     * Total AW = Solid AW + Fiber AW + Resin AW
     * @type {number}
     * @memberof AbstractLamina
     */
    get taw() { return this.saw + this.faw + this.raw; }

    // these should never need to be overridden
    get PR21() { return this.PR12 * this.E1 / this.E2; }
    get PR31() { return this.PR13 * this.E3 / this.E1; }
    get PR32() { return this.PR23 * this.E2 / this.E3; }

    /**
     * The properties of this Lamina collected in a plain object.
     * @type {Object}
     * @readonly
     * @memberof AbstractLamina
     */
    get properties() {
        let ABD = this.stiffnessMatrix;
        let abdi = matrixInvert(ABD);
        let thickness = this.thickness;
        let t3 = thickness * thickness * thickness;
        return ({
            thickness: thickness,
            Ex: 1.0 / (abdi[0][0] * thickness),
            Ey: 1.0 / (abdi[1][1] * thickness),
            Gxy: 1.0 / (abdi[2][2] * thickness),
            PRxy: -abdi[0][1] / abdi[0][0],
            PRyx: -abdi[0][1] / abdi[1][1],
            Exf: 12.0 / (abdi[3][3] * t3),
            Eyf: 12.0 / (abdi[4][4] * t3),
            Gxyf: 12.0 / (abdi[5][5] * t3),
            NAx: ABD[0][3] / ABD[0][0],
            NAy: ABD[1][4] / ABD[1][1],
            vf: this.vf,
            density: this.density,
            taw: this.taw,
            saw: this.saw,
            faw: this.faw,
            raw: this.raw,
            plyCount: this.plyCount,
            stiffnessMatrix: ABD,
            complianceMatrix: abdi,
        });
    }

    /**
     * Average mass fraction of fiber, excluding any solid portions.
     * mf = faw / ( faw + raw )
     * @type {number}
     * @memberof AbstractLamina
     */
    get mf() {
        if (this.faw === 0.0) { return 0.0; }
        return this.faw / (this.faw + this.raw);
    }

    /**
     * The number of plies in this Lamina
     * 
     * @type {number}
     * @memberof AbstractLamina
     */
    get plyCount() { return 1.0; }

    /**
     * Calculates the plane stress stiffness matrix for a single-layered lamina.
     * Multi-layered lamina sub-classes will need to override this.
     *
     * @returns {number[][]} 6x6 stiffness matrix, units are N/m, N & N-m for [A], [B] & [D]
     */
    get stiffnessMatrix() {

        let zt = this.thickness / 2.0;
        let zb = -zt;
        let rand = this.isRandom;

        // reduced stiffness constants ( N/m^2 )
        let q11 = this.E1 / (1 - this.PR12 * this.PR12);
        let q12 = this.PR12 * this.E2;
        let q22 = this.E2 / (1 - this.PR12 * this.PR12);
        let q66 = this.G12;

        // angle is zero, IE material principle axis = ply principle axis.
        // Apecial constants adjust sin() & cos() calcs for random plies.
        let ssss = rand ? 0.375 : 0.0;
        let cccc = rand ? 0.375 : 1.0;
        let sscc = rand ? 0.125 : 0.0;

        // reduced stiffness constants, adjusted for random-ness
        let Q11 = q11 * cccc + 2 * (q12 + 2 * q66) * sscc + q22 * ssss;
        let Q22 = q11 * ssss + 2 * (q12 + 2 * q66) * sscc + q22 * cccc;
        let Q12 = (q11 + q22 - 4 * q66) * sscc + q12 * (ssss + cccc);
        let Q66 = (q11 + q22 - 2 * q12 - 2 * q66) * sscc + q66 * (ssss + cccc);

        // Aij = Qij * ( z,top - z,bot ) ( units = N/m^2 x m = N/m )
        let ka = zt - zb;
        // Bij = Qij * ( z,top^2 - z,bot^2 )/2 ( units = N/m^2 x m^2 = N )
        let kb = (zt * zt - zb * zb) / 2;
        // Dij = Qij * ( z,top^3 - z,bot^3 )/3 ( units = N/m^2 x m^3 = N m )
        let kc = (zt * zt * zt - zb * zb * zb) / 3;

        // build [A][B] matrix, ie stiffness matrix
        //       [B][D]  4 x (3x3) = (6x6)
        let ret = [
            [Q11 * ka, Q12 * ka, 0, Q11 * kb, Q12 * kb, 0],
            [Q12 * ka, Q22 * ka, 0, Q12 * kb, Q22 * kb, 0],
            [0, 0, Q66 * ka, 0, 0, Q66 * kb],
            [Q11 * kb, Q12 * kb, 0, Q11 * kc, Q12 * kc, 0],
            [Q12 * kb, Q22 * kb, 0, Q12 * kc, Q22 * kc, 0],
            [0, 0, Q66 * kb, 0, 0, Q66 * kc]
        ];

        return ret;
    }

    //---------------- required getter overrides ---------------------

    /**
     * Throw an error explaining that an abstract property needs to be overridden.
     * @returns {number}
     * @param {string} argName
     * @memberof AbstractLamina
     */
    static throwArgNeedsImplementationError(argName) {
        throw new Error("Sub classes of AbstractLamina must define getter for " + argName + ".");
    }

    /**
     * The thickness of this Lamina
     * 
     * @type {number}
     * @memberof AbstractLamina
     */
    get thickness() { return AbstractLamina.throwArgNeedsImplementationError("thickness"); }

    /**
     * Density of the lamina in kg/cu.m
     * @type {number}
     * @memberof AbstractLamina
     */
    get density() { return AbstractLamina.throwArgNeedsImplementationError("density"); }

    /**
     * Total areal weight, in kg/sq.m
     * Total AW = Solid AW + Fiber AW + Resin AW
     * @type {number}
     * @memberof AbstractLamina
     */
    get faw() { return AbstractLamina.throwArgNeedsImplementationError("faw"); }

    /**
     * Total areal weight, in kg/sq.m
     * Total AW = Solid AW + Fiber AW + Resin AW
     * @type {number}
     * @memberof AbstractLamina
     */
    get saw() { return AbstractLamina.throwArgNeedsImplementationError("saw"); }

    /**
     * Total areal weight, in kg/sq.m
     * Total AW = Solid AW + Fiber AW + Resin AW
     * @type {number}
     * @memberof AbstractLamina
     */
    get raw() { return AbstractLamina.throwArgNeedsImplementationError("raw"); }

    /**
     * Average volume fraction in composite, excluding any solid portions.
     * 
     * @type {number}
     * @memberof AbstractLamina
     */
    get vf() { return AbstractLamina.throwArgNeedsImplementationError("vf"); }

    /**
     * Principle modulus X or '1" direction.
     * @type {number}
     * @memberof AbstractLamina
     */
    get E1() { return AbstractLamina.throwArgNeedsImplementationError("E1"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get E2() { return AbstractLamina.throwArgNeedsImplementationError("E2"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get E3() { return AbstractLamina.throwArgNeedsImplementationError("E3"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get G12() { return AbstractLamina.throwArgNeedsImplementationError("G12"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get G13() { return AbstractLamina.throwArgNeedsImplementationError("G13"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get G23() { return AbstractLamina.throwArgNeedsImplementationError("G23"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get PR12() { return AbstractLamina.throwArgNeedsImplementationError("PR12"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get PR13() { return AbstractLamina.throwArgNeedsImplementationError("PR13"); }
    /**
     * @type {number}
     * @memberof AbstractLamina
     */
    get PR23() { return AbstractLamina.throwArgNeedsImplementationError("PR23"); }

}

//=============================================================================
/**
 * SolidLamina is a layer of solid material that absorbs no resin.
 * 
 */
export class SolidLamina extends AbstractLamina {

    /**
     * A material ply for a laminate
     *
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {number} [options.thickness]
     * @param {Material} [options.material]
     * @param {boolean} [options.isRandom]
     */
    constructor(options) {
        super(options);

        this._thickness = 0.0;
        this._material = null;

        if (options) {
            //@ts-ignore
            this._material = options._material || options.material || this._material;
            //@ts-ignore
            this._thickness = options._thickness || options.thickness || this._thickness;
        }
    }

    // the material is set by user
    get material() {
        return this._material;
    }
    set material(value) {
        if (!(value instanceof Material)) {
            throw new Error("Illegal argument.  Expected a Material or sub-class.");
        }
        this._material = value;
    }

    // thickness is set by user
    set thickness(value) {
        if (value < 0) {
            throw new Error("Illegal argument. thickness must be >=0.");
        }
        this._thickness = value;
    }

    //---------------- required getter overrides ---------------------

    get thickness() { return this._thickness; }
    get density() { return this.material.density; }

    // solid lamina have no fiber or resin components
    get faw() { return 0.0; }
    get raw() { return 0.0; }
    get saw() { return this.density * this.thickness; }

    get vf() { return 0.0; }

    get E1() { return this.material.E1; }
    get E2() { return this.material.E2; }
    get E3() { return this.material.E3; }
    get G12() { return this.material.G12; }
    get G13() { return this.material.G13; }
    get G23() { return this.material.G23; }
    get PR12() { return this.material.PR12; }
    get PR13() { return this.material.PR13; }
    get PR23() { return this.material.PR23; }

}// SolidLamina


//=============================================================================
// CompositeLamina
export class CompositeLamina extends AbstractLamina {

    /**
     * A composite material ply for a laminate
     *
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {Material} [options.fiber]
     * @param {Material} [options.resin]
     * @param {number} [options.vf]
     * @param {number} [options.faw]
     * @param {boolean} [options.isRandom]
     * @memberof CompositeLamina
     */
    constructor(options) {
        super(options);

        this._fiber = null;
        this._resin = null;
        this._vf = 0.0;
        this._faw = 0.0;
        this._isRandom = false;

        if (options) {
            this._fiber = options.fiber == undefined ? this._fiber : options.fiber;
            this._resin = options.resin == undefined ? this._resin : options.resin;
            this._vf = options.vf == undefined ? this._vf : options.vf;
            this._faw = options.faw == undefined ? this._faw : options.faw;
            this._isRandom = options.isRandom == undefined ? this._isRandom : options.isRandom;
        }
        this._material = undefined; // causes this.material to be reset
    }

    /**
     * Calculate the fiber mass fraction, given the fiber, resin and volume fraction
     * @param {Material | null } theFiber
     * @param {Material} theResin
     * @param {number} vf the fiber volume fraction, vf in 0 - 1.0
     * @returns {number} the fiber mass fraction, mf
     */
    static mfFromVf(theFiber, theResin, vf) {
        if( !(theFiber) || !isNumeric(theFiber.density)){
            throw new Error("No valid fiber or fiber density.");
        }
        if( !(theResin) || !isNumeric(theResin.density)){
            throw new Error("No valid resin or resin density.");
        }
        return vf * theFiber.density / (theFiber.density * vf + theResin.density * (1 - vf));
    }

    /**
     * The fiber
     * @type {null | Material}
     * @memberof CompositeLamina
     */
    get fiber() { return this._fiber; }
    set fiber(value) {
        if (!(value instanceof Material)) { throw new Error("Fiber must be a Material."); }
        this._fiber = value;
        this._material = undefined; // causes this.material to be reset
    }

    /**
     * The resin
     * @type {Material | null}
     * @memberof CompositeLamina
     */
    get resin() { return this._resin; }
    set resin(value) {
        if (!(value instanceof Material)) { throw new Error("Resin must be a Material."); }
        this._resin = value;
        this._material = undefined; // causes this.material to be reset
    }

    /**
     * The fiber volume fraction (0-1.0]
     * @type {number}
     * @memberof CompositeLamina
     */
    set vf(value) {
        if (value <= 0.0) { throw new Error("Fiber volume fraction, vf, must be > 0.0."); }
        if (value > 1.0) { throw new Error("Fiber volume fraction, vf, must be <= 1.0."); }
        this._vf = value;
        this._material = undefined; // causes this.material to be reset
    }

    set faw(value) {
        if (value <= 0) { throw new Error("Fiber areal weight must be > 0.0."); }
        this._faw = value;
    }

    /**
     * Material object that calculates the composite properties.
     * @type Mat_FRP
     * @readonly
     * @memberof CompositeLamina
     */
    get material() {
        this._material = new Mat_FRP({
            name: "<" + this.name + ">",
            description: "<" + this.description + ">",
            fiber: this._fiber,
            resin: this._resin,
            vf: this._vf,
        });
        return this._material;
    }

    //---------------- required getter overrides ---------------------

    get thickness() { 
        if( !(this.fiber) || !(this.fiber.density)){
            throw new Error("No fiber or zero fiber density.");
        }
        return this.faw / (this.fiber.density * this.vf); 
    }
    get density() { return this.material.density; }

    // solid lamina have no fiber or resin components
    get faw() { return this._faw; }
    get raw() {
        if( !(this.resin) || !(this.resin.density)){
            throw new Error("No resin or zero resin density.");
        }
        let mf = CompositeLamina.mfFromVf(this.fiber, this.resin, this.vf);
        return this.faw * (1.0 / mf - 1.0);
    }
    get saw() { return 0.0; }

    get vf() { return this._vf; }

    get E1() { return this.material.E1; }
    get E2() { return this.material.E2; }
    get E3() { return this.material.E3; }
    get G12() { return this.material.G12; }
    get G13() { return this.material.G13; }
    get G23() { return this.material.G23; }
    get PR12() { return this.material.PR12; }
    get PR13() { return this.material.PR13; }
    get PR23() { return this.material.PR23; }

} // CompositeLamina

//=============================================================================
// Laminate


export class Laminate extends AbstractLamina {

    /**
     * Creates a laminate instance, which is a collection of plies and sub-laminates.
     *
     * Each ply has an associated name, angle and orientation.
     *
     * If isWoven=true then the flexural properties are smeared, as  if the plies
     * are all woven together.
     *
     * @param {Object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {Object[]} [options.plies]  array of SolidPlies &/or FiberPlies
     * @param {number[]} [options.angles]  array of angles for each ply
     * @param {string[]} [options.orientations]  array of LPT.ORIENTATIONS
     * @param {boolean} [options.isWoven] if true plies are smeared thru thickness
     * @memberof Laminate
     */
    constructor(options) {
        super(options);

        this._plies = [];
        this._angles = [];
        this._orientations = [];
        this._isWoven = false; // indicates smeared ply properties
        //this.properties = null;
        if (options) {
            this._plies = options.plies == undefined ? this._plies : options.plies;
            this._angles = options.angles == undefined ? this._angles : options.angles;
            this._orientations = options.orientations == undefined ? this._orientations : options.orientations;
            this._isWoven = options.isWoven == undefined ? this._isWoven : options.isWoven;
        }
        // if plies were specified, without angles or orientations
        // then set defaults for angles and orientations
        let numPlies = this._plies.length;
        if (numPlies > 0) {
            if (this._angles.length === 0) {
                for (let i = 0; i < numPlies; i++) {
                    this._angles.push(0.0);
                }
            }
            if (this._orientations.length === 0) {
                for (let i = 0; i < numPlies; i++) {
                    this._orientations.push(ORIENTATION.UPRIGHT);
                }
            }
            if (this._angles.length !== numPlies) {
                throw new Error("The number of angles does not match the number of plies.");
            }
            if (this._orientations.length !== numPlies) {
                throw new Error("The number of orientations does not match the number of plies.");
            }
        }
    }
    get thickness() {
        return this._plies.reduce((sum, ply) => sum + ply.thickness, 0);
    }
    /**
     * If a laminate is woven its layer properties are all smeared through the thickness
     * to average out the stacking sequence effects.
     * @type {boolean}
     * @memberof Laminate
     */
    get isWoven() {
        return this._isWoven;
    }
    set isWoven(value) {
        this._isWoven = value ? true : false;
    }
    /**
     * Fiber volume fraction for the laminate is the average vf
     * of all the composite plies in the laminate.  Solid plies,
     * and others with vf=0 are not included in the average.
     *
     * @returns {number} the average fiber volume fraction
     */
    get vf() {
        let ret = 0.0;
        let compositeThickness = 0.0;
        let len = this._plies.length;
        for (let i = 0; i < len; i++) {
            let ti = this._plies[i].thickness;
            let vfi = this._plies[i].vf;
            if (vfi > 0.0 && vfi < 1.0) {
                ret = ret + ti * vfi;
                compositeThickness += ti;
            }
        }
        return compositeThickness > 0.0 ? ret / compositeThickness : 0.0;
    }
    get density() {
        let txd = this._plies.reduce((sum, ply) => sum + ply.thickness * ply.density, 0);
        return txd / this.thickness;
    }
    get taw() {
        return this._plies.reduce((sum, ply) => sum + ply.taw, 0);
    }
    get saw() {
        return this._plies.reduce((sum, ply) => sum + ply.saw, 0);
    }
    get faw() {
        return this._plies.reduce((sum, ply) => sum + ply.faw, 0);
    }
    get raw() {
        return this._plies.reduce((sum, ply) => sum + ply.raw, 0);
    }

    // in-plane properties
    get E1() { return this.properties.Ex; }
    get E2() { return this.properties.Ey; }
    get G12() { return this.properties.Gxy; }
    get PR12() { return this.properties.PRxy; }

    //TODO improve 3D estimates

    /** @override uses simple weighted averages, for now. */
    get E3() {
        let ret = 0.0;
        let thickness = 0.0;
        for (let i = this._plies.length - 1; i >= 0; i--) {
            let ti = this._plies[i].thickness;
            ret = ret + ti * this._plies[i].E3;
            thickness += ti;
        }
        return ret / thickness;
    }

    /** @override uses simple weighted averages, for now. */
    get G13() {
        let ret = 0.0;
        let thickness = 0.0;
        for (let i = this._plies.length - 1; i >= 0; i--) {
            let ti = this._plies[i].thickness;
            ret = ret + ti * this._plies[i].G13;
            thickness += ti;
        }
        return ret / thickness;
    }

    /** @override uses simple weighted averages, for now. */
    get G23() {
        let ret = 0.0;
        let thickness = 0.0;
        for (let i = this._plies.length - 1; i >= 0; i--) {
            let ti = this._plies[i].thickness;
            ret = ret + ti * this._plies[i].G23;
            thickness += ti;
        }
        return ret / thickness;
    }

    /** @override */
    get PR13() { return this.E1 / (2.0 * this.G13) - 1.0; }

    /** @override */
    get PR23() { return this.E2 / (2.0 * this.G23) - 1.0; }

    get plyCount() {
        return this._plies.length;
    }

    // function to limit angles to +/- 90 degrees
    static makePlusMinus90Deg(angleInDeg) {
        let ret = angleInDeg;
        while (ret > 90.0) { ret -= 180.0; }
        while (ret < -90.0) { ret += 180.0; }
        return ret;
    }

    /**
     *
     * @param {AbstractLamina} thePly must be a Ply or Laminate object
     * @returns {boolean} whether the ply is a valid addition
     */

    canAddPly(thePly) {
        if (!(thePly instanceof AbstractLamina)) {
            return false; // must be a Ply or Laminate
        } else
            if (thePly === this) {
                return false; // can't add ourself to ourself
            } else
                // can't add a laminate that contains ourself to ourself
                if (thePly.contains(this)) {
                    return false;
                }
        return true;
    }

    /**
     * Add a ply to the top of this laminate
     *
     * @param {AbstractLamina} thePly the Ply to add - a Ply or Laminate object
     * @param {number} angle the angle of rotation relative to laminate axis
     * @param {any} orientation LPT.ORIENTATION.UPRIGHT or .FLIPPED
     *
     * @returns {Laminate} this Laminate, for method chaining
     */
    addPly(thePly, angle = 0.0, orientation = ORIENTATION.UPRIGHT) {
        return this.addPlyAt(this._plies.length, thePly, angle, orientation);
    }

    /**
     * Add a ply at a specific index in this laminate
     *
     * @param {number} index the position to add the ply, <= 0 is bottom, >=length is top
     * @param {AbstractLamina} thePly  a Ply or Laminate object to add
     * @returns {Laminate} this Laminate, for method chaining
     */
    addPlyAt(index, thePly, angle = 0.0, orientation = ORIENTATION.UPRIGHT) {
        let i = Math.max(0, index);
        i = Math.min(this._plies.length, i);
        if (this.canAddPly(thePly)) {
            this._plies.splice(index, 0, thePly);
            let a = angle == undefined ? 0.0 : Laminate.makePlusMinus90Deg(angle);
            this._angles.splice(index, 0, a);
            let o = orientation == undefined ? ORIENTATION.UPRIGHT : orientation;
            this._orientations.splice(index, 0, o);
        }
        return this;
    }

    /**
     * Remove the ply at index position in this laminate
     *
     * @param {number} index the position of the ply to remove
     * @returns {Laminate} this Laminate, for method chaining
     */
    removePlyAt(index) {
        if (index >= 0 && index < this._plies.length) {
            this._plies.splice(index, 1);
            this._angles.splice(index, 1);
            this._orientations.splice(index, 1);
        }
        return this;
    }

    /**
     * Is a ply contained in this laminate
     *
     * @param {AbstractLamina} thePly we are checking for  SolidLamina, CompositeLamina or Laminate
     * @returns {boolean} true if ply is in this Laminate
     */
    contains(thePly) {
        if (thePly === this) {
            return true;
        }
        for (let i = 0; i < this._plies.length; i++) {
            let ithPly = this._plies[i];
            if (ithPly === thePly) {
                return true;
            }
            if (typeof ithPly.containsPly === 'function') {
                if (ithPly.containsPly(thePly)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *
     * @returns {number[][]} 6 x 6 stiffness matrix [[A][B]/[B][D]], units are N/m, N & N-m for [A], [B] & [D]
     * @memberof Laminate
     */
    get stiffnessMatrix() {
        // tensorial to engineering shear stress/strain & back
        const R = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 2]
        ];
        const Rinv = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 0.5]
        ];
        let retA = matrixCreate(3, 3);
        let retB = matrixCreate(3, 3);
        let retD = matrixCreate(3, 3);
        let zbI = -this.thickness / 2.0;
        let len = this._plies.length;
        for (let i = 0; i < len; i++) {
            let plyI = this._plies[i];
            // get stiffness matrix for ply
            // at zero degrees of rotation,
            // with upright orientation,
            // about its own mid-plane
            let ABDI = plyI.stiffnessMatrix;
            // rotate the A, B & D matrices for the ply angle
            let angleI = this._angles[i] * Math.PI / 180.0;
            let s = Math.sin(angleI);
            let c = Math.cos(angleI);
            let ss = s * s;
            let cc = c * c;
            let sc = s * c;
            // rotation matrix
            let T = [
                [cc, ss, 2 * sc],
                [ss, cc, -2 * sc],
                [-sc, sc, cc - ss]
            ];
            let Tinv = [
                [cc, ss, -2 * sc],
                [ss, cc, 2 * sc],
                [sc, -sc, cc - ss]
            ];
            let A = matrixCopy(ABDI, 0, 0, 3, 3);
            let B = matrixCopy(ABDI, 0, 3, 3, 3);
            let D = matrixCopy(ABDI, 3, 3, 3, 3);
            // adjust A, B & D matrices if the ply is flipped in this laminate
            if (this._orientations[i] === ORIENTATION.FLIPPED) {
                A = [
                    [A[0][0], A[0][1], -A[0][2]],
                    [A[1][0], A[1][1], -A[1][2]],
                    [-A[2][0], -A[2][1], A[2][2]]
                ];
                D = [
                    [D[0][0], D[0][1], -D[0][2]],
                    [D[1][0], D[1][1], -D[1][2]],
                    [-D[2][0], -D[2][1], D[2][2]]
                ];
                B = [
                    [-B[0][0], -B[0][1], B[0][2]],
                    [-B[1][0], -B[1][1], B[1][2]],
                    [B[2][0], B[2][1], -B[2][2]]
                ];
            }
            // rotate the A, B & D matrices for the ply angle
            let Arot = matrixMultiply(Tinv, matrixMultiply(A, matrixMultiply(R, matrixMultiply(T, Rinv))));
            let Brot = matrixMultiply(Tinv, matrixMultiply(B, matrixMultiply(R, matrixMultiply(T, Rinv))));
            let Drot = matrixMultiply(Tinv, matrixMultiply(D, matrixMultiply(R, matrixMultiply(T, Rinv))));
            // adjust A, B & D matrices for thru-thickness position in this laminate
            let ztI = zbI + plyI.thickness;
            let zI = (zbI + ztI) / 2;
            let zI2 = zI * zI;
            retA = matrixAdd(retA, Arot);
            // B = B + A zi
            retB = matrixAdd(retB, Brot);
            retB = matrixAdd(retB, matrixScale(Arot, zI));
            // D = D + A zi^2, parrallel axis theorem
            retD = matrixAdd(retD, Drot);
            retD = matrixAdd(retD, matrixScale(Arot, zI2));
            zbI = ztI;
        }
        let ret = [
            [retA[0][0], retA[0][1], retA[0][2], retB[0][0], retB[0][1], retB[0][2]],
            [retA[1][0], retA[1][1], retA[1][2], retB[1][0], retB[1][1], retB[1][2]],
            [retA[2][0], retA[2][1], retA[2][2], retB[2][0], retB[2][1], retB[2][2]],
            [retB[0][0], retB[0][1], retB[0][2], retD[0][0], retD[0][1], retD[0][2]],
            [retB[1][0], retB[1][1], retB[1][2], retD[1][0], retD[1][1], retD[1][2]],
            [retB[2][0], retB[2][1], retB[2][2], retD[2][0], retD[2][1], retD[2][2]]
        ];
        // if this laminate is woven, 'smear' the properties thru the thickness
        if (this.isWoven) {
            // A matrix is unchanged
            // zero B matrix, since woven plies are symetric
            for (let i = 3; i < 6; i++) {
                for (let j = 0; j < 3; j++) {
                    ret[i][j] = 0.0;
                    ret[j][i] = 0.0;
                }
            }
            // adjust bending stiffness terms to eliminate stacking effects
            // Dij = Aij x ((zt^3-zb^3)/3) / (zt-zb)
            let zt = this.thickness / 2.0;
            let zb = -zt;
            let k = ((zt * zt * zt - zb * zb * zb) / 3) / (zt - zb);
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    ret[i + 3][j + 3] = ret[i][j] * k;
                }
            }
        }
        return ret;
    }
}