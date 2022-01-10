// @ts-check
/*jshint esversion: 6 */

let _nextMaterialNumber = 1;

function isNumeric(obj) {
    return !!(!isNaN(parseFloat(obj)) && isFinite(obj));
}

/**
 * Material is an abstract super class for specific material types.
 * 
 * The writable properties for different sub-types are:    
 * Mat_Isotropic: density, E1, PR12;   
 * Mat_Orthotropic: density, E1, E2, E3, G12, G13, G23, PR12, PR13, PR23;    
 * Mat_PlanarIso12: density, E1, E3, G13, PR12, PR13;    
 * Mat_PlanarIso13: density, E1, E2, G12, PR12, PR13;    
 * Mat_PlanarIso23: density, E1, E2, G12, PR12, PR23;    
 * Mat_FRP: fiber, resin, vf.     
 * All units are basic kg/m/s/degC, ie moduli are in (kg-m/s^2)/m^2 = N/m^2 = Pa). 
 * @abstract
 */
export class Material {

    /**
     * Material constructor.  * Do Not Call new Material() Directly !! This is an abstract super class for 
     * specific material types.  
     * 
     * To initialize a Material subclass via a no-args constructor, during deserialization for example, 
     * use a no-args constructor and then use Object.assign() to assign the state from the srialized data.
     * 
     * Example:
     * 
     * jsonObj = JSON.parse(jsonStr); // creates object w. private props (ie _name, _E1, ...) but no methods
     * materialObj = new Mat_Isotropic();  // creates an instance with methods but uninitialized properties
     * Object.assign( materialObj, jsonObj); // sets properties: _name, _description, _E1 etc..
     * 
     * materialObj = new Mat_Isotropic(jsonObj) will also work as of 3/30/2021
     * 
     * Material properties units are basic kg/m/s/degC. 
     * IE moduli are in (kg-m/s^2)/m^2 = N/m^2 = Pa).
     * @param {object} [options] optional inialization data
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @memberof Material
     */
    constructor(options) {
        if (new.target === Material) {
            throw new TypeError("Cannot construct abstract class " + new.target.name + " instances directly");
        }
        //this._clazz is used to find the constructor when deserializing
        this._clazz = this.constructor.name;  // will be sub-class name, not Material
        this._name = "Material # " + _nextMaterialNumber++;
        this._description = "";
        if (options) {
            //@ts-ignore
            this._name = options._name || options.name || this._name;
            //@ts-ignore
            this._description = options._description || options.description || this._description;
        }
    }

    /**
     * Checks for valid modulus arguments
     * @param {number} arg
     * @param {string} argName
     */
    static checkModulusArg(arg, argName = "Modulus") {
        if (!(isNumeric(arg))) { throw new Error(argName + " missing or not numeric."); }
        if (isNumeric(arg) && arg <= 0.0) { throw new Error(argName + " must be greater than zero."); }
        return arg;
    }

    /**
     * Checks for valid density arguments
     * @param {number} arg
     * @param {string} argName
     */
    static checkDensityArg(arg, argName = "Density") {
        if (!(isNumeric(arg))) { throw new Error(argName + " missing or not numeric."); }
        if (isNumeric(arg) && arg <= 0.0) { throw new Error(argName + " must be greater than zero."); }
        return arg;
    }

    /**
     * Checks for valid Poisson Ratio arguments - for Isotropic TODO: orthotropic limits
     * @param {number} arg
     * @param {string} argName
     */
    static checkPRArg(arg, argName = "poisson Ratio") {
        if (!(isNumeric(arg))) { throw new Error(argName + " missing or not numeric."); }
        if (isNumeric(arg) && arg < 0.0) { throw new Error(argName + " must be greater than zero."); }
        if (isNumeric(arg) && arg > 0.5) { throw new Error(argName + " can not be greater than 0.50."); }
        return arg;
    }

    /**
     * Materials may be composed of other materials.  In order to ensure that materials
     * are not composed of themselves checks may be required.  Basic materials do not
     * contain any others.  Override this for composite materials.
     *
     * @param {Material} target
     * @return {boolean} 
     * @memberof Material
     */
    contains(target) {
        if (!(target instanceof Material)) {
            throw new Error("Illegal argument: target must be a Material.");
        }
        return false;
    }

    /**
     * A plain object {} containing the properties of this material.
     * Should be overridden if new properties are added to a subclass.   
     * For example, a composite material may return the fiber, resin & vf. 
     *
     * @type {object}
     * @readonly
     * @memberof Material
     */
    get properties() {
        let o = {};
        o._clazz = this._clazz;

        o.name = this.name;
        o.description = this.description;

        o.density = this.density;

        o.E1 = this.E1;
        o.E2 = this.E2;
        o.E3 = this.E3;

        o.G12 = this.G12;
        o.G13 = this.G13;
        o.G23 = this.G23;

        o.PR12 = this.PR12;
        o.PR13 = this.PR13;
        o.PR23 = this.PR23;

        o.PR21 = this.PR21;
        o.PR31 = this.PR31;
        o.PR32 = this.PR32;

        return o;
    }

    /**
     * A human-friendly name for a Material.
     * @type {string}
     * @memberof Material
     */
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = String(value);
    }

    /**
     * A human-friendly description of a Material.
     * @type {string}
     * @memberof Material
     */
    get description() {
        return this._description;
    }
    /**
     * Setter for a human-friendly description of a Material.
     */
    set description(value) {
        this._description = value;
    }

    /**
     * PR21 is the strain in the '1' direction due to stress in the '2' direction.   
     * Normally not over-riden.
     * @type {number}
     * @memberof Material
     */
    get PR21() { return (this.PR12 * this.E2 / this.E1); }

    /**
     * PR31 is the strain in the '1' direction due to stress in the '3' direction.
     * Normally not over-riden.
     * @type {number}
     * @memberof Material
     */
    get PR31() { return (this.PR13 * this.E3 / this.E1); }

    /**
     * PR32 is the strain in the '2' direction due to stress in the '3' direction.
     * Normally not over-riden.
     * @type {number}
     * @memberof Material
     */
    get PR32() { return (this.PR23 * this.E3 / this.E2); }

    //---------------- 10 required getter overrides ---------------------

    /**
     * Density of the material in kg/cu.m
     * @type {number}
     * @memberof Material
     */
    get density() {
        let arg = "density";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * Modulus in the principle (ie '1') direction in N/sq.m (Pa)
     * @type {number}
     * @memberof Material
     */
    get E1() {
        let arg = "E1";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * Modulus in the transverse (ie '2') direction in N/sq.m (Pa)
     * @type {number}
     * @memberof Material
     */
    get E2() {
        let arg = "E2";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * Modulus in the through-the-thickness (ie '3') direction in N/sq.m (Pa)
     * @type {number}
     * @memberof Material
     */
    get E3() {
        let arg = "E3";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * In-plane shear modulus in N/sq.m (Pa)
     * @type {number}
     * @memberof Material
     */
    get G12() {
        let arg = "G12";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * Interlaminar shear modulus 1-3 in N/sq.m (Pa)
     * Shear is in the '3' direction, on the plane normal to the '1' direction
     * @type {number}
     * @memberof Material
     */
    get G13() {
        let arg = "G13";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * Interlaminar shear modulus 2-3 in N/sq.m (Pa)
     * Shear is in the '3' direction, on the plane normal to the '2' direction
     * @type {number}
     * @memberof Material
     */
    get G23() {
        let arg = "G23";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * PR12 is the strain in the '2' direction due to stress in the '1' direction.
     * @type {number}
     * @memberof Material
     */
    get PR12() {
        let arg = "density";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * PR13 is the strain in the '3' direction due to stress in the '1' direction.
     * @type {number}
     * @memberof Material
     */
    get PR13() {
        let arg = "PR12";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    /**
     * PR23 is the strain in the '3' direction due to stress in the '2' direction.
     * @type {number}
     * @memberof Material
     */
    get PR23() {
        let arg = "density";
        throw new Error("Sub classes of Material must define getter for " + arg + ".");
    }

    static duplicate(src) {
        let ret = undefined;
        switch (src.constructor) {
            case Mat_Isotropic:
                ret = new Mat_Isotropic(src);
                break;
            case Mat_Orthotropic:
                ret = new Mat_Orthotropic(src);
                break;
            case Mat_PlanarIso12:
                ret = new Mat_PlanarIso12(src);
                break;
            case Mat_PlanarIso13:
                ret = new Mat_PlanarIso13(src);
                break;
            case Mat_PlanarIso23:
                ret = new Mat_PlanarIso23(src);
                break;
            case Mat_FRP:
                ret = new Mat_FRP(src);
                break;
        }
        return ret;
    }
}

/**
 * A subclass of Material for an isotropic material.
 * Independent (writable) properties are: density, E1, PR12.
 */
export class Mat_Isotropic extends Material {

    /**
     * Creates an instance of Mat_Isotropic.
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {number} [options.density]
     * @param {number} [options.E1]
     * @param {number} [options.PR12]
     * @memberof Mat_Isotropic
     */
    constructor(options) {

        super(options);

        this._E1 = 207000e6; // Pa
        this._PR12 = 0.3;
        this._density = 1000.0;

        if (options) {
            // prefer 'private' _args as they come from deserialized objects (IE JSON.stringify)

            // @ts-ignore _density not in options jsDoc
            let arg = options._density || options.density;
            this._density = Mat_Isotropic.checkDensityArg(arg, "density") || this._density;

            // @ts-ignore _E1 not in options jsDoc
            arg = options._E1 || options.E1;
            this._E1 = Mat_Isotropic.checkModulusArg(arg, "E1") || this._E1;

            // @ts-ignore _PR12 not in options jsDoc
            arg = options._PR12 || options.PR12;
            this._PR12 = Mat_Isotropic.checkPRArg(arg, "PR12") || this._PR12;
        }
    }

    /**
     * @param {number} value density, in kg/cu.m
     */
    set density(value) { this._density = Mat_Isotropic.checkDensityArg(value, "density"); }

    /**
     * @param {number} value modulus, in N/sq.m (Pa)
     */
    set E1(value) { this._E1 = Mat_Isotropic.checkModulusArg(value, "E1"); }

    /**
     * @param {number} value p dimensionless Poisson ratio 0-0.5
     */
    set PR12(value) { this._PR12 = Mat_Isotropic.checkPRArg(value, "PR12"); }

    //---------------- 10 required getter overrides ---------------------

    get density() { return this._density; }

    get E1() { return this._E1; }
    get E2() { return this.E1; }
    get E3() { return this.E1; }

    get G12() { return this.E1 / (2 * (1 + this.PR12)); }
    get G13() { return this.G12; }
    get G23() { return this.G12; }

    get PR12() { return this._PR12; }
    get PR13() { return this.PR12; }
    get PR23() { return this.PR12; }

}


/**
 * A subclass of Material.
 * 
 * Independent (writable) properties are:
 *   
 * density, E1, E3, G13, PR12, PR13;    
 */
export class Mat_PlanarIso12 extends Material {
    /**
     *Creates an instance of Mat_Planar_Iso_12.
     *
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {number} [options.density]
     * @param {number} [options.E1]
     * @param {number} [options.PR12]
     * @param {number} [options.E3]
     * @param {number} [options.PR13]
     * @param {number} [options.G13]
     * @memberof Mat_PlanarIso12
     */
    constructor(options) {
        super(options);
        this._E1 = 207000e6; // Pa
        this._E3 = 207000e6; // Pa
        this._PR12 = 0.3;
        this._PR13 = 0.3;
        this._G13 = this.E1 / (2 * (1 + this.PR13)); // Pa
        this._density = 1000.0;

        if (options) {

            // prefer 'private' _args as they come from deserialized objects (IE JSON.stringify)

            // @ts-ignore _density not in options jsDoc
            let arg = options._density || options.density;
            this._density = Mat_PlanarIso12.checkDensityArg(arg, "density") || this._density;

            // @ts-ignore _E1 not in options jsDoc
            arg = options._E1 || options.E1;
            this._E1 = Mat_PlanarIso12.checkModulusArg(arg, "E1") || this._E1;

            // @ts-ignore _E3 not in options jsDoc
            arg = options._E3 || options.E3;
            this._E3 = Mat_PlanarIso12.checkModulusArg(arg, "E3") || this._E3;

            // @ts-ignore _PR12 not in options jsDoc
            arg = options._PR12 || options.PR12;
            this._PR12 = Mat_PlanarIso12.checkPRArg(arg, "PR12") || this._PR12;

            // @ts-ignore _PR13 not in options jsDoc
            arg = options._PR13 || options.PR13;
            this._PR13 = Mat_PlanarIso12.checkPRArg(arg, "PR13") || this._PR13;

            // @ts-ignore _G13 not in options jsDoc
            arg = options._G13 || options.G13;
            this._G13 = Mat_PlanarIso12.checkModulusArg(arg, "G13") || this._G13;
        }
    }

    /**
     * @param {number} value density, in kg/cu.m
     */
    set density(value) { this._density = Mat_PlanarIso12.checkDensityArg(value, "density"); }

    /**
     * @param {number} value modulus, in N/sq.m (Pa)
     */
    set E1(value) { this._E1 = Mat_PlanarIso12.checkModulusArg(value, "E1"); }
    set E3(value) { this._E3 = Mat_PlanarIso12.checkModulusArg(value, "E3"); }

    /**
     * @param {number} value dimensionless Poisson ratio 0-0.5
     */
    set PR12(value) { this._PR12 = Mat_PlanarIso12.checkPRArg(value, "PR12"); }
    set PR13(value) { this._PR13 = Mat_PlanarIso12.checkPRArg(value, "PR13"); }
    set G13(value) { this._G13 = Mat_PlanarIso12.checkModulusArg(value, "G13"); }

    //---------------- 10 required getter overrides ---------------------

    get density() { return this._density; }

    get E1() { return this._E1; }
    get E2() { return this._E1; }
    get E3() { return this._E3; }

    get G12() { return this._E1 / (2 * (1 + this._PR12)); }
    get G13() { return this._G13; }
    get G23() { return this._G13; }

    get PR12() { return this._PR12; }
    get PR13() { return this._PR13; }
    get PR23() { return this._PR13; }

}


/**
 * A subclass of Material.
 * 
 * Independent (writable) properties are: density, E1, E2, G12, PR12, PR13;    
 */
export class Mat_PlanarIso13 extends Material {

    /**
     *Creates an instance of Mat_Planar_Iso_13.
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {number} [options.density]
     * @param {number} [options.E1]
     * @param {number} [options.E2]
     * @param {number} [options.PR12]
     * @param {number} [options.PR13]
     * @param {number} [options.G12]
     * @memberof Mat_Planar_Iso_13
     */
    constructor(options) {
        super(options);
        this._density = 1000.0;
        this._E1 = 207000e6; // Pa
        this._E2 = 207000e6;
        this._PR12 = 0.3;
        this._PR13 = 0.3;
        this._G12 = this._E1 / (2 * (1 + this._PR12));

        if (options) {
            // prefer 'private' _args as they come from deserialized objects (IE JSON.stringify)

            // @ts-ignore _density not in options jsDoc
            let arg = options._density || options.density;
            this._density = Mat_PlanarIso13.checkDensityArg(arg, "density") || this._density;

            // @ts-ignore _E1 not in options jsDoc
            arg = options._E1 || options.E1;
            this._E1 = Mat_PlanarIso13.checkModulusArg(arg, "E1") || this._E1;

            // @ts-ignore _E2 not in options jsDoc
            arg = options._E2 || options.E2;
            this._E2 = Mat_PlanarIso13.checkModulusArg(arg, "E2") || this._E2;

            // @ts-ignore _PR12 not in options jsDoc
            arg = options._PR12 || options.PR12;
            this._PR12 = Mat_PlanarIso13.checkPRArg(arg, "PR12") || this._PR12;

            // @ts-ignore _PR13 not in options jsDoc
            arg = options._PR13 || options.PR13;
            this._PR13 = Mat_PlanarIso13.checkPRArg(arg, "PR13") || this._PR13;

            // @ts-ignore _G12 not in options jsDoc
            arg = options._G12 || options.G12;
            this._G12 = Mat_PlanarIso13.checkModulusArg(arg, "G12") || this._G12;
        }
    }

    /**
     * @param {number} value density, in kg/cu.m
     */
    set density(value) { this._density = Mat_PlanarIso13.checkDensityArg(value, "density"); }

    /**
     * @param {number} value modulus, in N/sq.m (Pa)
     */
    set E1(value) { this._E1 = Mat_PlanarIso13.checkModulusArg(value, "E1"); }
    set E2(value) { this._E2 = Mat_PlanarIso13.checkModulusArg(value, "E2"); }

    /**
     * @param {number} value p dimensionless Poisson ratio 0-0.5
     */
    set PR12(value) { this._PR12 = Mat_PlanarIso13.checkPRArg(value, "PR12"); }
    set PR13(value) { this._PR13 = Mat_PlanarIso13.checkPRArg(value, "PR13"); }
    set G12(value) { this._G12 = Mat_PlanarIso13.checkModulusArg(value, "G12"); }

    // ------------ 10 required getter overrides -------------------

    get density() { return this._density; }

    get E1() { return this._E1; }
    get E2() { return this._E2; }
    get E3() { return this._E1; }

    get G12() { return this._G12; }
    get G13() { return this._E1 / (2 * (1 + this._PR13)); }
    get G23() { return this._G12; }

    get PR12() { return this._PR12; }
    get PR13() { return this._PR13; }
    get PR23() { return this._PR12; }
}


/**
 * A subclass of Material.
 * 
 * Independent (writable) properties are:
 *   
 * density, E1, E2, G12, PR12, PR23;    
 */
export class Mat_PlanarIso23 extends Material {

    /**
     * @param {object} [options] 
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {number} [options.density]
     * @param {number} [options.E1]
     * @param {number} [options.E2]
     * @param {number} [options.PR12]
     * @param {number} [options.PR23]
     * @param {number} [options.G12]
     * @memberof Mat_Planar_Iso_23
     */
    constructor(options) {
        super(options);
        this._density = 1000; //kg/cu.m
        this._E1 = 207000e6; // Pa
        this._E2 = 0.3;
        this._PR12 = 0.3;
        this._PR23 = 0.3;
        this._G12 = this.E1 / (2 * (1 + this._PR12));

        if (options) {
            // prefer 'private' _args as they come from deserialized objects (IE JSON.stringify)

            // @ts-ignore _density not in options jsDoc
            let arg = options._density || options.density;
            this._density = Mat_PlanarIso23.checkDensityArg(arg, "density") || this._density;

            // @ts-ignore _E1 not in options jsDoc
            arg = options._E1 || options.E1;
            this._E1 = Mat_PlanarIso23.checkModulusArg(arg, "E1") || this._E1;

            // @ts-ignore _E2 not in options jsDoc
            arg = options._E2 || options.E2;
            this._E2 = Mat_PlanarIso23.checkModulusArg(arg, "E2") || this._E2;

            // @ts-ignore _PR12 not in options jsDoc
            arg = options._PR12 || options.PR12;
            this._PR12 = Mat_PlanarIso23.checkPRArg(arg, "PR12") || this._PR12;

            // @ts-ignore _PR23 not in options jsDoc
            arg = options._PR23 || options.PR23;
            this._PR23 = Mat_PlanarIso23.checkPRArg(arg, "PR23") || this._PR23;

            // @ts-ignore _G12 not in options jsDoc
            arg = options._G12 || options.G12;
            this._G12 = Mat_PlanarIso23.checkModulusArg(arg, "G12") || this._G12;
        }
    }

    set density(value) { this._density = Mat_PlanarIso23.checkDensityArg(value, "density"); }

    set E1(value) { this._E1 = Mat_PlanarIso23.checkModulusArg(value, "E1"); }
    set E2(value) { this._E2 = Mat_PlanarIso23.checkModulusArg(value, "E2"); }

    set PR12(value) { this._PR12 = Mat_PlanarIso23.checkPRArg(value, "PR12"); }
    set PR23(value) { this._PR23 = Mat_PlanarIso23.checkPRArg(value, "PR13"); }

    set G12(value) { this._G12 = Mat_PlanarIso23.checkModulusArg(value, "G12"); }

    // ------------ 10 required getter overrides -------------------

    get density() { return this._density; }

    get E1() { return this._E1; }
    get E2() { return this._E2; }
    get E3() { return this._E2; }

    get G12() { return this._G12; }
    get G13() { return this._G12; }
    get G23() { return this._E2 / (2 * (1 + this._PR23)); }

    get PR12() { return this._PR12; }
    get PR13() { return this._PR12; }
    get PR23() { return this._PR23; }
}


/**
 * A subclass of Material.
 * 
 * Independent (writable) properties are:
 *     
 * density, E1, E2, E3, G12, G13, G23, PR12, PR13, PR23;  
 */
export class Mat_Orthotropic extends Material {

    /**
     *Creates an instance of Mat_Orthotropic.
     * @param {object} [options] 
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {number} [options.density]
     * @param {number} [options.E1]
     * @param {number} [options.E2]
     * @param {number} [options.E3]
     * @param {number} [options.PR12]
     * @param {number} [options.PR13]
     * @param {number} [options.PR23]
     * @param {number} [options.G12]
     * @param {number} [options.G13]
     * @param {number} [options.G23]
     * @memberof Mat_Orthotropic
     */
    constructor(options) {
        super(options);

        this._density = 1000; //kg/cu.m

        this._E1 = 207e9; // Pa
        this._E2 = 207e9;
        this._E3 = 207e9;

        this._PR12 = 0.3;
        this._PR13 = 0.3;
        this._PR23 = 0.3;

        this._G12 = this._E1 / (2 * (1 + this._PR12));
        this._G13 = this._E1 / (2 * (1 + this._PR13));
        this._G23 = this._E2 / (2 * (1 + this._PR23));

        if (options) {
            // prefer 'private' _args as they come from deserialized objects (IE JSON.stringify)

            // @ts-ignore _density not in options jsDoc
            let arg = options._density || options.density;
            this._density = Mat_Orthotropic.checkDensityArg(arg, "density") || this._density;

            // @ts-ignore _E1 not in options jsDoc
            arg = options._E1 || options.E1;
            this._E1 = Mat_Orthotropic.checkModulusArg(arg, "E1") || this._E1;

            // @ts-ignore _E2 not in options jsDoc
            arg = options._E2 || options.E2;
            this._E2 = Mat_Orthotropic.checkModulusArg(arg, "E2") || this._E2;

            // @ts-ignore _E3 not in options jsDoc
            arg = options._E3 || options.E3;
            this._E3 = Mat_Orthotropic.checkModulusArg(arg, "E3") || this._E3;

            // @ts-ignore _PR12 not in options jsDoc
            arg = options._PR12 || options.PR12;
            this._PR12 = Mat_Orthotropic.checkPRArg(arg, "PR12") || this._PR12;

            // @ts-ignore _PR13 not in options jsDoc
            arg = options._PR13 || options.PR13;
            this._PR13 = Mat_Orthotropic.checkPRArg(arg, "PR13") || this._PR13;

            // @ts-ignore _PR23 not in options jsDoc
            arg = options._PR23 || options.PR23;
            this._PR23 = Mat_Orthotropic.checkPRArg(arg, "PR23") || this._PR23;

            // @ts-ignore _G12 not in options jsDoc
            arg = options._G12 || options.G12;
            this._G12 = Mat_Orthotropic.checkModulusArg(arg, "G12") || this._G12;

            // @ts-ignore _G13 not in options jsDoc
            arg = options._G13 || options.G13;
            this._G13 = Mat_Orthotropic.checkModulusArg(arg, "G13") || this._G13;

            // @ts-ignore _G23 not in options jsDoc
            arg = options._G23 || options.G23;
            this._G23 = Mat_Orthotropic.checkModulusArg(arg, "G23") || this._G23;
        }
    }

    set density(value) { this._density = value; }

    set E1(value) { this._E1 = Mat_Orthotropic.checkModulusArg(value, "E1"); }
    set E2(value) { this._E2 = Mat_Orthotropic.checkModulusArg(value, "E2"); }
    set E3(value) { this._E3 = Mat_Orthotropic.checkModulusArg(value, "E3"); }

    set PR12(value) { this._PR12 = Mat_Orthotropic.checkPRArg(value, "PR12"); }
    set PR13(value) { this._PR13 = Mat_Orthotropic.checkPRArg(value, "PR13"); }
    set PR23(value) { this._PR23 = Mat_Orthotropic.checkPRArg(value, "PR23"); }

    set G12(value) { this._G12 = Mat_Orthotropic.checkModulusArg(value, "G12"); }
    set G13(value) { this._G13 = Mat_Orthotropic.checkModulusArg(value, "G13"); }
    set G23(value) { this._G23 = Mat_Orthotropic.checkModulusArg(value, "G23"); }

    // ------------ 10 required getter overrides -------------------

    get density() { return this._density; }

    get E1() { return this._E1; }
    get E2() { return this._E2; }
    get E3() { return this._E3; }

    get PR12() { return this._PR12; }
    get PR13() { return this._PR13; }
    get PR23() { return this._PR23; }

    get G12() { return this._G12; }
    get G13() { return this._G13; }
    get G23() { return this._G23; }
}


/**
 * A subclass of Material.
 * 
 * Independent (writable) properties are:
 * 
 * fiber, resin, vf.     
 */
export class Mat_FRP extends Material {

    /**
     * Creates a material that uses composite micromechanics to provide properties.
     * 
     * @param {object} [options] optional, but must have valid fiber, resin and vf if used
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {Material} [options.fiber]
     * @param {Material} [options.resin]
     * @param {number} [options.vf] volume fraction [0.0 - 1.0]
     * @memberof Mat_FRP
     */
    constructor(options) {
        super(options);
        this._fiber = undefined;
        this._resin = undefined;
        this._vf = 0.0;

        if (options) {

            //@ts-ignore _resin not in options jsDocs
            let resinArg = options._resin || options.resin;
            //@ts-ignore _fiber not in options jsDocs
            let fiberArg = options._fiber || options.fiber;
            //@ts-ignore _vf not in options jsDocs
            let vfArg = options._vf || options.vf;

            if (resinArg == undefined) {
                throw new Error("Invalid argument: missing Material for resin.");
            }
            else if (!(resinArg instanceof Material)) {
                throw new Error("Invalid argument: resin is not a Material.");
            }
            else if (fiberArg == undefined) {
                throw new Error("Invalid argument: missing Material for fiber.");
            }
            else if (!(fiberArg instanceof Material)) {
                throw new Error("Invalid argument: fiber is not a Material.");
            }
            else if (vfArg == undefined) {
                throw new Error("Invalid argument: missing vf for Mat_FRP().");
            }
            else {
                this._resin = options.resin;
                this._fiber = options.fiber;
                this._vf = Mat_FRP.checkVfArg(options.vf);
            }
        }
    }

    /**
     * Checks for valid volume fraction arguments
     *
     * @param {number} arg
     * @param {string} argName
     */
    static checkVfArg(arg, argName = "Vf") {
        if (isNumeric(arg) && arg < 0.0) { throw new Error(argName + " can not be less than 0.0."); }
        if (isNumeric(arg) && arg > 1.0) { throw new Error(argName + " can not be greater than 1.0."); }
        return arg;
    }

    /**
     * Override contains() so we can check that fiber and resin do not contain this Material.
     * @override
     * @param {Material} target
     * @returns {boolean}
     */
    contains(target) {
        if (!(target instanceof Material)) {
            throw new Error("Illegal argument: target must be a Material.");
        }
        if (this.fiber instanceof Material) {
            if (this.fiber === target) { return true; }
            if (this.fiber.contains(target)) { return true; }
        }
        if (this.resin instanceof Material) {
            if (this.resin === target) { return true; }
            if (this.resin.contains(target)) { return true; }
        }
        return false;
    }

    /**
     * Override of Material.properties to add composite-specific properties
     * @type {object}
     * @override
     * @readonly
     * @memberof Mat_FRP
     */
    get properties() {
        let props = super.properties;
        props.fiber = this.fiber.properties;
        props.resin = this.resin.properties;
        props.vf = this.vf;
        return props;
    }

    /**
     * Fiber part of a composite material
     * @type Material
     * @memberof Mat_FRP
     */
    get fiber() {
        return this._fiber;
    }
    set fiber(theMaterial) {
        if (theMaterial.contains(this)) {
            throw new Error("A material cannot be composed itself.");
        }
        this._fiber = theMaterial;
    }

    /**
     * Resin part of a composite material
     * @type Material
     * @memberof Mat_FRP
     */
    get resin() {
        return this._resin;
    }
    set resin(theMaterial) {
        if (theMaterial.contains(this)) {
            throw new Error("A material cannot be composed itself.");
        }
        this._resin = theMaterial;
    }

    /**
     * Volume fraction of fiber [0.0 - 1.0]
     * @type number
     * @memberof Mat_FRP
     */
    get vf() { return this._vf; }
    set vf(value) { this._vf = Mat_FRP.checkVfArg(value); }

    // ------------ 10 required getter overrides -------------------

    get density() { return this._vf * this.fiber.density + (1 - this.vf) * this.resin.density; }

    get E1() { return this.vf * this.fiber.E1 + (1 - this.vf) * this.resin.E1; }

    get E2() {
        let vf = this.vf;
        let fE2 = this.fiber.E2;
        let rE2 = this.resin.E2;
        if (vf === 1.0) {
            return fE2;
        } else if (vf === 0.0) {
            return rE2;
        } else {
            return rE2 / (1.0 - Math.sqrt(vf) * (1 - rE2 / fE2));
        }
    }

    get E3() {
        let vf = this.vf;
        let fE3 = this.fiber.E3;
        let rE3 = this.resin.E3;
        if (vf === 1.0) {
            return fE3;
        } else if (vf === 0.0) {
            return rE3;
        } else {
            return rE3 / (1.0 - Math.sqrt(vf) * (1 - rE3 / fE3));
        }
    }

    get G12() {
        let vf = this.vf;
        let fprop = this.fiber.G12;
        let rprop = this.resin.G12;
        if (vf === 1.0) {
            return fprop;
        } else if (vf === 0.0) {
            return rprop;
        } else {
            return rprop / (1.0 - Math.sqrt(vf) * (1 - rprop / fprop));
        }
    }

    get G13() {
        let vf = this.vf;
        let fprop = this.fiber.G13;
        let rprop = this.resin.G13;
        if (vf === 1.0) {
            return fprop;
        } else if (vf === 0.0) {
            return rprop;
        } else {
            return rprop / (1.0 - Math.sqrt(vf) * (1 - rprop / fprop));
        }
    }

    get G23() {
        let vf = this.vf;
        let fprop = this.fiber.G23;
        let rprop = this.resin.G23;
        if (vf === 1.0) {
            return fprop;
        } else if (vf === 0.0) {
            return rprop;
        } else {
            return rprop / (1.0 - Math.sqrt(vf) * (1 - rprop / fprop));
        }
    }

    get PR12() {
        return this.vf * this.fiber.PR12 + (1 - this.vf) * this.resin.PR12;
    }

    get PR13() {
        return this.vf * this.fiber.PR13 + (1 - this.vf) * this.resin.PR13;
    }

    get PR23() {
        return this.vf * this.fiber.PR23 + (1 - this.vf) * this.resin.PR23;
    }

}
