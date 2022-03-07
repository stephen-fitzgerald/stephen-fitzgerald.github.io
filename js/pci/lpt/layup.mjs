//@ts-check
/* jshint esversion: 6 */

import { Material } from "./material.mjs";
import { SolidLamina, CompositeLamina, Laminate } from "./lpt.mjs";
import { ORIENTATION } from "./orientation.mjs";

function isNumeric(obj) {
    return !!(!isNaN(parseFloat(obj)) && isFinite(obj));
}

let _nextLayerNumber = 1;

/**
 * A superclass for layers in a layup.  A layup is the conection bewteen the layup
 * created in the shop and the molded laminate that comes from it. It's a stack of
 * layers that, when combined with a context, generates a molded laminate that we
 * can use laminated plate theory on to determine mechanical properties.
 *
 * Properties / methods are:
 * name,
 * description,
 * isCompressible,
 * fiberDensity,
 * resinDensity,
 * solidDensity,
 * getTotalArealWt(ctx),
 * getResinArealWt(ctx),
 * getSolidArealWt(ctx),
 * getFiberArealWt(ctx),
 * getVf(ctx),
 * getThickness(ctx),
 * contains(AbstractLayer),
 * getLaminate(ctx),
 *
 * ctx is a LayupContext that provides parameters like compaction presssure, the reisn to use, etc..
 *
 * Known subclasses are:
 * PrepregLayer,
 * ReleaseLayer,
 * SolidLayer,
 * FiberLayer,
 * FabricLayer,
 * BraidedLayer
 */
export class AbstractLayer {
    /**
     * Check for a valid AbstractLayer argument.  Used by sub-classes that contain sub-layers.
     * @param layer {AbstractLayer} the argument being checked
     * @param name {string} used in error message
     * @returns {AbstractLayer} the argument, if valid, undefined otherwise
     */
    static _checkLayerArg(layer, name) {
        if (!(layer instanceof AbstractLayer)) {
            throw new TypeError(name + " must be an instance of AbstractLayer.");
        }
        return layer;
    }

    /**
     * Check for a valid material argument.  Used by sub-classes.
     * @param arg {Material}
     * @param name {string}
     * @returns {Material} the argument, if valid, undefined otherwise
     */
    static _checkMaterialArg(arg, name) {
        if (!(arg instanceof Material)) {
            throw new TypeError(name + " must be an instance of Material.");
        }
        return arg;
    }

    /**
     * Check for a valid resin argument.  Used by sub-classes.
     * @param resin {Material}
     * @param name {string}
     * @returns {Material} the argument, if valid, undefined otherwise
     */
    static _checkResinArg(resin, name) {
        if (!(resin instanceof Material)) {
            throw new TypeError(name + " must be an instance of Material.");
        }
        return resin;
    }

    /**
     * Checks that an argument is numeric and in the range 0.0 - 1.0 inclusive
     * @param arg the argument to check
     * @param name the name of the argument, for error messages
     * @returns {number} the argument, if valid, undefined otherwise
     */
    static _checkZeroToOneArg(arg, name) {
        if (!isNumeric(arg)) {
            throw new TypeError(name + " must be numeric.");
        }
        if (arg < 0.0 || arg > 1.0) {
            throw new Error(name + " must be in the range 0-1, found: " + arg);
        }
        return arg;
    }

    /**
     * Checks that an argument is numeric and greater than or equal to zero
     * @param arg the argument to check
     * @param name the name of the argument, for error messages
     * @returns {number} the argument, if valid, undefined otherwise
     */
    static _checkThicknessArg(arg, name) {
        if (!isNumeric(arg)) {
            throw new TypeError(name + " must be numeric.");
        }
        if (arg < 0.0) {
            throw new Error(name + " must be greater than zero, found: " + arg);
        }
        return arg;
    }

    /**
     * Do not call this constructor directly.  It's only used by sub-classes
     * Note pattern for property initializations from options:
     *
     *  this._prop =  options._prop || options.prop || {default value}
     * @param {object} [options] can call with no options, but must be valid if present
     * @param {string} [options.name]
     * @param {string} [options._name]
     * @param {string} [options.description]
     * @param {string} [options._description]
     */
    constructor(options = {}) {
        if (new.target === AbstractLayer) {
            throw new TypeError(
                "Cannot construct abstract class " +
                new.target.name +
                " instances directly"
            );
        }
        //this._clazz is used to find the constructor when deserializing
        this._clazz = this.constructor.name; // will be sub-class name
        this._name =
            options._name || options.name || "Layer # " + _nextLayerNumber++;
        this._description = options._description || options.description || "";
    }

    get clazz() {
        return this._clazz;
    }

    get name() {
        return this._name;
    }
    set name(value) {
        this._name = String(value);
    }

    get description() {
        return this._description;
    }
    set description(value) {
        this._description = String(value);
    }

    /**
     * Does this layer compress under molding pressure? Subclasses must override.
     * @type boolean
     * @memberof AbstractLayer
     */
    get isCompressible() {
        throw new Error("Sub classes must override getter for isCompressible.");
    }

    /**
     * The average density of the fibers in this layer, in kg/cu.m.
     * @readonly
     * @memberof AbstractLayer
     * @type {number}
     * @returns {number}
     */
    get fiberDensity() {
        throw new Error("Sub classes must override getter for fiberDensity.");
    }

    /**
     * The average density of the resin in this layer, in kg/cu.m.
     * @readonly
     * @memberof AbstractLayer
     * @type {number}
     */
    get resinDensity() {
        throw new Error("Sub classes must override getter for fiberDensity.");
    }

    /**
     * The average density of the solids in this layer, in kg/cu.m.
     * @readonly
     * @memberof AbstractLayer
     * @type {number}
     */
    get solidDensity() {
        throw new Error("Sub classes must override getter for fiberDensity.");
    }

    /**
     * Total areal weight in kg/sq.m. Usually TAW = FAW + RAW + SAW
     * @argument {object} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getTotalArealWt(layupContext) {
        return (
            this.getFiberArealWt(layupContext) +
            this.getResinArealWt(layupContext) +
            this.getSolidArealWt(layupContext)
        );
    }

    /**
     * Resin areal weight - subclasses must override.
     * @argument {object} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getResinArealWt(layupContext) {
        throw new Error("Sub classes must override getter for resinArealWt.");
    }

    /**
     * Fiber areal weight - subclasses must override.
     * @argument {object} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getFiberArealWt(layupContext) {
        throw new Error("Sub classes must override getFiberArealWt.");
    }

    /**
     * Solid areal weight - subclasses must override.
     * @argument {LayupContext} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getSolidArealWt(layupContext) {
        throw new Error("Sub classes must override getter for solidArealWt.");
    }

    /**
     * Calculate the layup's fiber volume fraction at a specified compaction pressure.
     * Vf is for the non-solids portion of the laminate.  For example, if there is a core in a
     * sandwich layup it is ignored, and the Vf of the skins is returned.
     * @argument {object} layupContext - pressure, resin & other info on the layup
     * @returns {number}  fiber volume fraction - ( 0.0 - 1.0 )
     */
    getVf(layupContext) {
        throw new Error("Sub classes must override getVf(pressure).");
    }

    /**
     * Calculate the layup's thickness under the layupContext conditions.
     * @argument {object} layupContext - info on the layup, IE pressure, resin, tool diameter...
     * @returns {number}  thickness in meters
     */
    getThickness(layupContext) {
        throw new Error("Sub classes must override getThickness(pressure).");
    }

    /**
     * LayupLayers may be composed of other LayupLayers.  In order to ensure that they
     * are not composed of themselves, checks may be required. Override this for multi-
     * layered LayupLayers. Note: a layer does 'contain' itself.
     * @param {AbstractLayer} target
     * @return {boolean}
     * @memberof AbstractLayer
     */
    contains(target) {
        if (!(target instanceof AbstractLayer)) {
            throw new TypeError("Target must be a AbstractLayer.");
        }
        return target === this;
    }

    /**
     * Build a laminate representing this Layup.
     * @param {object} layupContext data required to build laminate, resin, diameter etc.
     * @returns {Laminate} representing this Layup
     */
    getLaminate(layupContext) {
        throw new Error("Sub classes must override getLaminate(layupContext).");
    }
} // AbstractLayer

//========================================================================================

/**
 * A PrepregLayer combines a 'wrapped' AbstractLayer, with a resin at a resin content, with
 * a resin flow.  Final resin content = resinContent - resinFlow.
 * @extends AbstractLayer
 */
export class PrepregLayer extends AbstractLayer {
    /**
     * A PrepregLayer has a 'wrapped' layupLayer, an as-purchased resin content,
     * and resin flow.  Final resin content = resinContent - resinFlow.
     *
     * @param {object} [options] can call with no options, but must be valid if present
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {AbstractLayer} [options.layer] the fiber layer, can be any AbstractLayer
     * @param {Material} [options.resin] the prepreg resin
     * @param {number} [options.resinContent] resin fraction (0-1) of total as-purchased wt
     * @param {number} [options.resinFlow] resin flow, as % of total wt
     */
    constructor(options) {
        super(options);
        this._layer = null;
        this._resin = null;
        this._resinContent = 0.0;
        this._resinFlow = 0.0;

        if (options) {
            //@ts-ignore
            let arg = options._layer || options.layer;
            this._layer = PrepregLayer._checkLayerArg(arg, "layer") || this._layer;

            //@ts-ignore
            arg = options._resin || options.resin;
            this._resin = PrepregLayer._checkResinArg(arg, "resin");

            // as-purchased resin content - IE what we pay for
            //@ts-ignore
            arg = options._resinContent || options.resinContent;
            this._resinContent = PrepregLayer._checkZeroToOneArg(arg, "resinContent");

            // what leaks out during molding
            //@ts-ignore
            arg = options._resinFlow || options.resinFlow;
            this._resinFlow = PrepregLayer._checkZeroToOneArg(arg, "resinFlow");
            if (this._resinFlow >= this._resinContent) {
                throw new Error("Resin flow must be less than resin content.");
            }
        }
    }

    get resinContent() {
        return this._resinContent;
    }
    set resinContent(value) {
        this._resinContent = PrepregLayer._checkZeroToOneArg(value, "resinContent");
    }

    get resinFlow() {
        return this._resinFlow;
    }
    set resinFlow(value) {
        this._resinFlow = PrepregLayer._checkZeroToOneArg(value, "resinContent");
    }

    get layer() {
        return this._layer;
    }
    set layer(value) {
        this._layer = PrepregLayer._checkLayerArg(value, "layer");
    }

    get resin() {
        return this._resin;
    }
    set resin(value) {
        this._resin = PrepregLayer._checkResinArg(value, "resin");
    }

    get fiberDensity() {
        return this.layer.fiberDensity;
    }
    get solidDensity() {
        return this.layer.solidDensity;
    }
    get resinDensity() {
        return this.resin.density;
    }

    get isCompressible() {
        return false;
    }

    /**
     * Resin areal wt is is determined by fiber areal wt, resin content & flow.
     * @override
     */
    getResinArealWt(layupContext) {
        const faw = this.getFiberArealWt(layupContext);
        const rc = this.resinContent - this.resinFlow;
        return (rc * faw) / (1 - rc);
    }

    /**
     * Fiber areal wt is is determined by the wrapped layer.
     * @override
     */
    getFiberArealWt(layupContext) {
        return this.layer.getFiberArealWt(layupContext);
    }

    /**
     * Solid areal wt is is determined by the wrapped layer.
     * @override
     */
    getSolidArealWt(layupContext) {
        return this.layer.getSolidArealWt(layupContext);
    }

    /**
     * Prepreg volume fraction is determined by resin content & flow
     *
     */
    getVf(layupContext) {
        let faw = this.getFiberArealWt(layupContext);
        let raw = this.getResinArealWt(layupContext);
        let mf = faw / (faw + raw);
        let rhof = this.fiberDensity;
        let rhor = this.resinDensity;
        return (mf * rhor) / (rhof * (1 - mf) + rhor * mf);
    }

    /**
     * @override
     */
    getThickness(layupContext) {
        let vf = this.getVf(layupContext);
        let compositeThickness =
            this.getFiberArealWt(layupContext) / (this.fiberDensity * vf);
        let solidThickness = this.getSolidArealWt(layupContext) / this.solidDensity;
        return compositeThickness + solidThickness;
    }

    /**
     * @param {AbstractLayer} target
     * @return {boolean}
     */
    contains(target) {
        return target === this || this.layer.contains(target);
    }

    /**
     * Build a laminate representing this PrepregLayer.
     * @param {LayupContext} layupContext data required to build laminate: resin, diameter etc.
     * @returns {Laminate} Laminate representing this ply with its resin
     */
    getLaminate(layupContext) {
        const prepregContext = new LayupContext(layupContext);
        prepregContext.resin = this.resin;
        let ret = this.layer.getLaminate(prepregContext);
        return ret;
    }
} // PrepregLayer

//========================================================================================

/**
 * A release layer creates a separation between an inner and
 * outer laminate within a single layup.  A ReleaseLayer wraps
 * another 'normal' layer, which defines the physical properties
 * of the layer.  The release layer remains with the outer laminate.
 * A ReleaseLayer can not be added to a FabricLayer.  They must always
 * be at the top-level of the laminate stack.
 */
export class ReleaseLayer extends AbstractLayer {
    /**
     * A release layer creates a separation between an inner and
     * outer laminate within a single layup.  A ReleaseLayer wraps
     * another 'normal' layer, which defines the physical properties
     * of the layer.  The release layer remains with the outer laminate.
     * A ReleaseLayer can not be added to a FabricLayer.  They must always
     * be at the top-level of the laminate stack.
     *
     * @param {object} [options] can call with no options, but must be valid if present
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {AbstractLayer} [options.layer] the 'wrapped' layer, can be any AbstractLayer
     * @param {AbstractLayer} [options._layer] from serialized form
     */
    constructor(options) {
        super(options);
        this._layer = null;

        if (options) {
            //@ts-ignore
            let arg = options._layer || options.layer;
            this._layer = ReleaseLayer._checkLayerArg(arg, "layer") || this._layer;
        }
    }

    get layer() {
        return this._layer;
    }
    set layer(value) {
        this._layer = ReleaseLayer._checkLayerArg(value, "layer");
    }

    get fiberDensity() {
        return this.layer.fiberDensity;
    }
    get solidDensity() {
        return this.layer.solidDensity;
    }
    get resinDensity() {
        return this.layer.resinDensity;
    }

    get isCompressible() {
        return this.layer.isCompressible;
    }

    getResinArealWt(layupContext) {
        return this.layer.getResinArealWt(layupContext);
    }
    getFiberArealWt(layupContext) {
        return this.layer.getFiberArealWt(layupContext);
    }
    getSolidArealWt(layupContext) {
        return this.layer.getSolidArealWt(layupContext);
    }

    getVf(layupContext) {
        return this.layer.getVf(layupContext);
    }
    getThickness(layupContext) {
        return this.layer.getThickness(layupContext);
    }

    contains(target) {
        return target === this || this.layer.contains(target);
    }

    getLaminate(layupContext) {
        return this._layer.getLaminate(layupContext);
    }
} // ReleaseLayer

//========================================================================================

/**
 * A SolidLayer is a material with a thickness
 */
export class SolidLayer extends AbstractLayer {
    /**
     * A SolidLayer is a material with a thickness
     * @param {object} [options] optional, but must be valid if present
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {Material} [options.material]
     * @param {number} [options.thickness] thickness in meters
     */
    constructor(options = {}) {
        super(options);
        this._material = undefined;
        this._thickness = 0.0;
        if (options) {
            // @ts-ignore
            let mat = options._material || options.material;
            mat = SolidLayer._checkMaterialArg(mat, "material");
            this._material = mat || this._material;
            // @ts-ignore
            let th = options._thickness || options.thickness;
            th = SolidLayer._checkThicknessArg(th, "thickness");
            this._thickness = th || this._thickness;
        }
    }

    get material() {
        return this._material;
    }
    set material(value) {
        this._material = SolidLayer._checkMaterialArg(value, "material");
    }

    get thickness() {
        return this._thickness;
    }
    set thickness(value) {
        this._thickness = SolidLayer._checkThicknessArg(value, "thickness");
    }

    get fiberDensity() {
        return NaN;
    }
    get solidDensity() {
        return this.material.density;
    }
    get resinDensity() {
        return NaN;
    }

    get isCompressible() {
        return false;
    }

    getResinArealWt(layupContext) {
        return 0.0;
    }
    getFiberArealWt(layupContext) {
        return 0.0;
    }
    getSolidArealWt(layupContext) {
        return this.material.density * this.thickness;
    }

    getVf(layupContext) {
        return 0.0;
    }
    getThickness(layupContext) {
        return this.thickness;
    }

    contains(target) {
        return target === this;
    }

    /**
     * Build a laminate representing this solid material layer
     * @param {LayupContext} [layupContext] data required to build laminate, resin, diameter etc.
     * @returns {Laminate} representing this ply
     */
    getLaminate(layupContext) {
        let l = new SolidLamina({
            name: this.name,
            description: this.description,
            material: this.material,
            thickness: this.thickness,
        });
        let ret = new Laminate();
        ret.addPly(l, 0.0, ORIENTATION.UPRIGHT);
        return ret;
    }
} // SolidLayer

//========================================================================================

/**
 * A FiberLayer represents a dry fiber layer.  Resin is provided by the LayupContext.
 */
export class FiberLayer extends AbstractLayer {
    /**
     * A FiberLayer represents a dry fiber layer.  Resin is provided by the part.
     *
     * @param {object}   [options] optional, but must be valid if present
     * @param {string}   [options.name]
     * @param {string}   [options.description]
     * @param {Material} [options.fiber] the fiber
     * @param {Material} [options._fiber] serialized form
     * @param {number}   [options.faw] fiber areal wt in kg/sq.m
     * @param {number}   [options._faw] serialized form
     * @param {number}   [options.vf] fiber volume fraction
     * @param {number}   [options._vf] serialized form
     * @param {boolean}  [options.isRandom] true = isRandom fiber orientation
     * @param {boolean}  [options._isRandom] serialized form
     * @param {object}   [options.compactionModel] fiber volume fraction
     * @param {object}   [options._compactionModel] serialized form
     */
    constructor(options) {
        super(options);
        this._fiber = undefined;
        this._faw = 0.0; // 150 g/sq.m
        this._vf = 0.0;
        this._isRandom = false;
        this._compactionModel = undefined;

        if (options) {
            let arg = options._fiber || options.fiber;
            arg = FiberLayer._checkMaterialArg(arg, "fiber");
            this._fiber = arg || this._fiber;

            this._faw = options._faw || options.faw || this._faw;

            this._vf = options._vf || options.vf || this._vf;
            this._isRandom = options._isRandom || options.isRandom || this._isRandom;

            let name =
                "" + this._faw + " gsm of " + this._fiber.name + "@ vf= " + this._vf;
            this._name = this._name || name;
        }
    }

    get fiber() {
        return this._fiber;
    }
    set fiber(value) {
        this._fiber = value;
    }

    get vf() {
        return this._vf;
    }
    set vf(value) {
        this._vf = value;
    }

    get isRandom() {
        return this._isRandom;
    }
    set isRandom(value) {
        this._isRandom = value;
    }

    get faw() {
        return this._faw;
    }
    set faw(value) {
        this._faw = value;
    }

    get compactionModel() {
        return this._compactionModel;
    }
    set compactionModel(value) {
        this._compactionModel = value;
    }

    get isCompressible() {
        return !!this.compactionModel;
    }

    get fiberDensity() {
        return this.fiber.density;
    }
    get resinDensity() {
        return undefined;
    }
    get solidDensity() {
        return undefined;
    }

    getResinArealWt(layupContext) {
        if (!(layupContext && layupContext.resin)) {
            throw new Error("Fiber layers need a resin to determine resin areal wt.");
        } else {
            let fiberDensity = this.fiberDensity;
            let resinDensity = layupContext.resin.density;
            let vf = this.getVf(layupContext);
            let mf =
                (vf * fiberDensity) / (fiberDensity * vf + resinDensity * (1 - vf));
            let faw = this.getFiberArealWt(layupContext);
            return (faw * (1 - mf)) / mf;
        }
    }

    getFiberArealWt(layupContext) {
        return this.faw;
    }
    getSolidArealWt(layupContext) {
        return 0.0;
    }

    getVf(layupContext) {
        return this.vf;
    }

    /**
     * Calculate the layup's thickness under the layupContext conditions.
     * @argument {object} layupContext - info on the layup, IE pressure, resin, tool diameter...
     * @returns {number}  thickness in meters
     */
    getThickness(layupContext) {
        let vf = this.getVf(layupContext);
        let rhof = this.fiberDensity;
        let faw = this.getFiberArealWt(layupContext);
        return faw / (rhof * vf);
    }

    /**
     * Build a laminate representing this FiberLayer
     *
     * @param {LayupContext} layupContext data required to build laminate, resin, diameter etc.
     * @returns {Laminate} representing this ply
     */
    getLaminate(layupContext) {
        if (!(layupContext && layupContext.resin)) {
            throw new Error(
                "Can not create a Laminate from a Fiber layer without a resin."
            );
        } else {
            let l = new CompositeLamina({
                name: this.name,
                description: this.description,
                fiber: this.fiber,
                resin: layupContext.resin,
                vf: this.getVf(layupContext),
                faw: this.getFiberArealWt(layupContext),
                isRandom: this.isRandom,
            });
            let ret = new Laminate();
            ret.addPly(l, 0.0, ORIENTATION.UPRIGHT);
            return ret;
        }
    }
} // FiberLayer

//========================================================================================

export const WEAVETYPE = Object.freeze({
    NONE: "None", // stack of plies, no weave or knit
    KNIT: "Stitch-Knit", // stitch-knit fabric
    PLAIN: "Plain Weave",
    TWILL: "2x2 Twill",
});

/**
 * A FabricLayer is a collection of other Layers at angles, with a weave type
 */
export class FabricLayer extends AbstractLayer {
    /**
     * FabricLayer is a collection of other Layers at angles, with a weave type
     * @param {object} [options]
     * @param {string} [options.name]
     * @param {string} [options.description]
     * @param {AbstractLayer[]} [options.layers] array of Solid, Uni, Random, Prepreg or Fabric Layers
     * @param {AbstractLayer[]} [options._layers] serialized form is saved with underscores
     * @param {number[]} [options.angles] array of angles for each Layer
     * @param {number[]} [options._angles] serialized form is saved with underscores
     * @param {string[]} [options.orientations] array of angles for each Layer
     * @param {string[]} [options._orientations] serialized form is saved with underscores
     * @param {*} [options.weaveType] WEAVETYPE.NONE (default), KNIT, PLAIN, TWILL ..
     * @param {*} [options._weaveType] serialized form is saved with underscores
     */
    constructor(options) {
        super(options);
        this._layers = [];
        this._angles = [];
        this._orientations = [];
        this._weaveType = WEAVETYPE.NONE;
        if (options != undefined) {
            this._layers = options._layers || options.layers || this._layers;
            this._angles = options._angles || options.angles || this._angles;
            this._orientations = options._orientations || options.orientations || this._orientations;
            this._weaveType = options._weaveType || options.weaveType || this._weaveType;
        }
    }

    getThickness(layupContext) {
        let ret = 0.0;
        for (let i = 0, len = this._layers.length; i < len; i++) {
            ret = ret + this._layers[i].getThickness(layupContext);
        }
        return ret;
    }

    getFiberArealWt(layupContext) {
        let ret = 0.0;
        for (let i = 0, len = this._layers.length; i < len; i++) {
            ret = ret + this._layers[i].getFiberArealWt(layupContext);
        }
        return ret;
    }

    /**
     * FabricLayers are compressible if any of their sub-layers are.
     *
     * @returns {boolean}
     */
    get isCompressible() {
        for (let i = this._layers.length - 1; i >= 0; i--) {
            if (this._layers[i].isCompressible()) {
                return true;
            }
        }
        return false;
    }

    getVf(layupContext) {
        let sumVfTh = 0.0;
        let thickness = 0.0;
        for (let i = 0, len = this._layers.length; i < len; i++) {
            let th = this._layers[i].getThickness(layupContext);
            sumVfTh = sumVfTh + this._layers[i].getVf(layupContext) * th;
            thickness = thickness + th;
        }
        return sumVfTh / thickness;
    }

    addLayerAt(index, theLayer, angle) {
        let i = Math.min(this._layers.length, Math.max(0, index));
        if (this.canAddLayer(theLayer)) {
            this._layers.splice(index, 0, theLayer);
            this._angles.splice(index, 0, angle);
        }
        return this;
    }

    canAddLayer(layer) {
        return (
            layer !== this &&
            layer instanceof AbstractLayer &&
            layer.contains(this) === false
        );
    }

    addLayer(layer, angle) {
        return this.addLayerAt(0, layer, angle);
    }

    /**
     *
     *
     * @param {LayupContext} layupContext data required to build laminate, resin, diameter etc.
     * @returns {Laminate} laminate representing this layup
     */
    getLaminate(layupContext) {
        let laminate = new Laminate();
        let d = layupContext.od;
        // work from outside to inside to update OD for each layer
        for (let i = this._layers.length - 1; i >= 0; i--) {
            let l = this._layers[i].getLaminate(layupContext);
            // use addPlyAt(0, ..) to keep inside to outside order
            laminate.addPlyAt(0, l, this._angles[i], this._orientations[i]);
            d = d - 2 * l.thickness;
        }
        if (this._weaveType !== WEAVETYPE.NONE) {
            laminate.isWoven = true;
        }
        return laminate;
    }
}

//========================================================================================

/**
 * A BraidedLayer is a braided tubular material.
 * Braided plys have properties that vary with diameter.
 * If more than one fiber is included they are all at the same vf.
 *
 * name,
 * description,
 * isCompressible,
 * fiberDensity,
 * resinDensity,
 * solidDensity,
 * getTotalArealWt(ctx),
 * getResinArealWt(ctx),
 * getSolidArealWt(ctx),
 * getFiberArealWt(ctx),
 * getVf(ctx),
 * getThickness(ctx),
 * contains(AbstractLayer),
 * getLaminate(ctx),
 */
export class BraidedLayer extends AbstractLayer {
    /**
     * A BraidedLayer is a braided tubular material.
     * Braided plys have properties that vary with diameter.
     * If more than one fiber is included they are all at the same vf.
     *
     * @param {object} args
     * @param {string} [args.name]
     * @param {string} [args.description]
     *
     * @param {Material[]} [args._biaxFibers] an array of fibers
     * @param {Material[]} [args.biaxFibers] an array of fibers
     *
     * @param {number[]} [args._biaxFaws] an array of the fiber areal wts (kg/sq.m) when braided
     * @param {number[]} [args.biaxFaws] an array of the fiber areal wts (kg/sq.m) when braided
     *
     * @param {number} [args._braidDiameter] the diameter (meters) when braided
     * @param {number} [args.braidDiameter] the diameter (meters) when braided
     *
     * @param {number} [args._biaxAngle] the angle (degrees) when braided, default = 45 degrees
     * @param {number} [args.biaxAngle] the angle (degrees) when braided, default = 45 degrees
     *
     * @param {number} [args._braidVf] the vf when braided, default = 0.375
     * @param {number} [args.braidVf] the vf when braided, default = 0.375
     *
     * @param {Material[]} [args._axialFibers] an array of fibers
     * @param {Material[]} [args.axialFibers] an array of fibers
     *
     * @param {number[]} [args._axialFaws] an array of the fiber areal wts (kg/sq.m) when braided
     * @param {number[]} [args.axialFaws] an array of the fiber areal wts (kg/sq.m) when braided
     *
     * @param {number} [args._braidVfj] the vf when braid jams, default = 0.55
     * @param {number} [args.braidVfj] the vf when braid jams, default = 0.55
     *
     * @param {number} [args._braidVfmax] the maximum possible vf, default = 0.67
     * @param {number} [args.braidVfmax] the maximum possible vf, default = 0.67
     *
     * @param {number} [args._braidPackingFactor] parameter to calc vf after jamming, default = 0.375
     * @param {number} [args.braidPackingFactor] parameter to calc vf after jamming, default = 0.375
     *
     * @param {object}   [args.compactionModel] fiber volume fraction
     * @param {object}   [args._compactionModel] serialized form
     */
    constructor(args = {}) {
        super(args);

        let options = {
            name: "Untitled Braid",
            description: "Braided layer.",
            braidDiameter: 1.0,
            braidVf: 0.375,
            biaxFibers: [],
            biaxFaws: [],
            biaxAngle: 45.0,
            axialFibers: [],
            axialFaws: [],
            braidVfj: 0.55,
            braidVfmax: 0.67,
            braidPackingFactor: 0.375,
            compactionModel: undefined,
        };

        options = Object.assign(options, args);

        // underscored properties are the internal state

        this._braidDiameter = options._braidDiameter || options.braidDiameter;
        this._braidVf = options._braidVf || options.braidVf;

        this._biaxFibers = options._biaxFibers || options.biaxFibers;
        this._biaxFaws = options._biaxFaws || options.biaxFaws; // total, IE + and - layers
        this._biaxAngle = options._biaxAngle || options.biaxAngle;

        this._axialFibers = options._axialFibers || options.axialFibers;
        this._axialFaws = options._axialFaws || options.axialFaws; // total, IE + and - layers

        this._braidVfj = options._braidVfj || options.braidVfj;
        this._braidVfmax = options._braidVfmax || options.braidVfmax;
        this._braidPackingFactor = options._braidPackingFactor || options.braidPackingFactor;

        this._compactionModel = options._compactionModel || options.compactionModel;
    }

    /** @override */
    get isCompressible() {
        return !!this.compactionModel;
    }

    get compactionModel() {
        return this._compactionModel;
    }
    set compactionModel(value) {
        this._compactionModel = value;
    }

    /** @override */
    get fiberDensity() {
        const biaxDensity = this.getBiaxialFiberDensity();
        const biaxFaw = this.getBiaxialFawo();
        const biaxThick = biaxFaw / biaxDensity;
        const axialDensity = this.getAxialFiberDensity();
        const axialFaw = this.getAxialFawo();
        const axialThick = axialFaw / axialDensity;
        return (biaxFaw + axialFaw) / (biaxThick + axialThick);
    }

    /** @override */
    get resinDensity() {
        return undefined;
    }

    /** @override */
    get solidDensity() {
        return undefined;
    }

    /**
     * Resin areal weight - subclasses must override.
     * @argument {object} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getResinArealWt(layupContext) {
        if (!(layupContext && layupContext.resin)) {
            throw new Error(
                "Braided layers need a resin to determine resin areal wt."
            );
        } else {
            let fiberDensity = this.fiberDensity;
            let resinDensity = layupContext.resin.density;
            let vf = this.getVf(layupContext);
            let mf =
                (vf * fiberDensity) / (fiberDensity * vf + resinDensity * (1 - vf));
            let faw = this.getFiberArealWt(layupContext);
            return (faw * (1 - mf)) / mf;
        }
    }
    /**
     * Fiber areal weight - subclasses must override.
     * @argument {object} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getFiberArealWt(layupContext) {
        return this.getFaw(layupContext.diameter);
    }

    /**
     * Solid areal weight - subclasses must override.
     * @argument {LayupContext} layupContext - pressure, resin & other info on the layup
     * @returns {number} areal weight in kg/sq.m
     */
    getSolidArealWt(layupContext) {
        return 0.0;
    }

    /**
     * @override
     */
    getVf(layupContext) {
        let diameter = layupContext.diameter;
        // calc Vfc for constant thickness, vf scales with Faw
        let vf = (this.braidVf * this.getFaw(diameter)) / this.getFawo();

        // If the braid is jammed, vf will go up less than Faw,
        // because jamming forces thickness to increase.
        if (vf > this.braidVfj) {
            vf =
                this.braidPackingFactor * vf +
                (1 - this.braidPackingFactor) * this.braidVfj;
        }

        //arbitrary limit at braid max Vf
        if (vf > this.braidVfMax) {
            vf = this.braidVfMax;
        }
        return vf;
    }

    /**
     * Calculate the layup's thickness under the layupContext conditions.
     * @argument {object} layupContext - info on the layup, IE pressure, resin, tool diameter...
     * @returns {number}  thickness in meters
     */
    getThickness(layupContext) {
        let vf = this.getVf(layupContext);
        let rhof = this.fiberDensity;
        let faw = this.getFiberArealWt(layupContext);
        return faw / (rhof * vf);
    }

    /**
     * @override
     */
    contains(target) {
        return target === this;
    }

    /**
     * Triaxial braids are represented as a three-layer laminate:
     *
     *  1. Top half of biaxial +/- theta fibers, woven, 50% of biaxial Faw
     *  2. Zero degree axial fibers, full Faw in a single layer
     *  3. Bottom half of biaxial +/- theta fibers, woven, 50% of biaxial Faw
     *
     * If there are multiple biax or axial fibers they will be included as
     * multiple layers, which will be woven together into layers 1-3.
     *
     * If thre are no axial fibers the top and bottom halves may be consolidated.
     *
     * @param {LayupContext} layupContext data required to build laminate, resin, diameter etc.
     * @returns {Laminate} a LPT.Laminate for this braided ply
     * @override
     */
    getLaminate(layupContext) {
        const d = this.getDiaFromOd(layupContext.od); // get nominal diameter
        const vf = this.getVf(d);
        const resin = layupContext.resin;
        // individual biaxial Faws scale with overall biaxialFaw as diameter changes
        const biaxialFawRatio = this.getFaw(d) / this.getFawo();
        const biaxAngle = this.getBiaxialFiberAngle(d);

        // build upper and lower laminates from the biaxial fibers
        // +/- layers are added for each biaxial fiber type in the braid
        const upperBiaxLam = new Laminate();
        upperBiaxLam.isWoven = true;
        const lowerBiaxLam = new Laminate();
        lowerBiaxLam.isWoven = true;
        for (let i = 0; i < this.biaxFibers.length; i++) {
            // ply is half of Faw at +angle & half at -angle
            let ply = new CompositeLamina({
                name: "",
                description: "",
                fiber: this.biaxFibers[i],
                resin: resin,
                vf: vf,
                faw: (this.biaxFaws[i] * biaxialFawRatio) / 4.0,
                isRandom: false,
            });
            upperBiaxLam.addPly(ply, biaxAngle, ORIENTATION.UPRIGHT);
            upperBiaxLam.addPly(ply, -biaxAngle, ORIENTATION.UPRIGHT);
            lowerBiaxLam.addPly(ply, biaxAngle, ORIENTATION.UPRIGHT);
            lowerBiaxLam.addPly(ply, -biaxAngle, ORIENTATION.UPRIGHT);
        }

        // axial fibers go in the middle
        // one layer is added for each axial fiber type in the braid
        const axialLam = new Laminate();
        axialLam.isWoven = true;
        for (let i = 0; i < this.axialFibers.length; i++) {
            let ply = new CompositeLamina({
                name: "",
                description: "",
                fiber: this.axialFibers[i],
                resin: resin,
                vf: vf,
                faw: this.axialFaws[i] * (this.braidDiameter / d),
                isRandom: false,
            });
            axialLam.addPly(ply, 0.0, ORIENTATION.UPRIGHT);
        }

        // the braid is the lower biaxials, axials and upper biaxials
        const theLaminate = new Laminate();
        theLaminate.addPly(lowerBiaxLam, 0.0, ORIENTATION.UPRIGHT);
        theLaminate.addPly(axialLam, 0.0, ORIENTATION.UPRIGHT);
        theLaminate.addPly(upperBiaxLam, 0.0, ORIENTATION.UPRIGHT);

        return theLaminate;
    }

    get biaxFibers() {
        return this._biaxFibers;
    }

    get biaxFaws() {
        return this._biaxFaws;
    }

    get braidDiameter() {
        return this._braidDiameter;
    }

    get biaxAngle() {
        return this._biaxAngle;
    }

    get braidVf() {
        return this._braidVf;
    }

    get axialFibers() {
        return this._axialFibers;
    }

    get axialFaws() {
        return this._axialFaws;
    }

    /** The volume fraction when the braid is jammed.  @returns number */
    get braidVfj() {
        return this._braidVfj;
    }

    get braidVfMax() {
        return this._braidVfmax;
    }

    get braidPackingFactor() {
        return this._braidPackingFactor;
    }

    /**
     *
     * @returns {number} the as-braided fiber areal wt in kg/sq.m
     */
    getFawo() {
        return this.getBiaxialFawo() + this.getAxialFawo();
    }
    /**
     *
     * @returns{number} the as-braided biaxial fiber areal wt in kg/sq.m
     */
    getBiaxialFawo() {
        let faw = 0.0;
        for (let i = this.biaxFaws.length - 1; i >= 0; i++) {
            faw = faw + this.biaxFaws[i];
        }
        return faw;
    }
    /**
     *
     * @returns{number} the as-braided axial fiber areal wt in kg/sq.m
     */
    getAxialFawo() {
        let faw = 0.0;
        for (let i = this.axialFaws.length - 1; i >= 0; i++) {
            faw = faw + this.axialFaws[i];
        }
        return faw;
    }

    /**
     *
     * @returns{number} the average biaxial fiber density in kg/cu.m
     */
    getBiaxialFiberDensity() {
        let sumOfThickness = 0.0;
        let sumOfFaw = 0.0;
        for (let i = 0; i < this.biaxFaws.length; i++) {
            sumOfThickness = sumOfThickness + this.biaxFaws[i] / this.biaxFibers[i].density;
            sumOfFaw = sumOfFaw + this.biaxFaws[i];
        }
        return sumOfFaw / sumOfThickness;
    }
    /**
     *
     * @returns{number} the average axial fiber density in kg/cu.m
     */
    getAxialFiberDensity() {
        let sumOfThickness = 0.0;
        let sumOfFaw = 0.0;
        for (let i = 0; i < this.axialFaws.length; i++) {
            sumOfThickness =
                sumOfThickness + this.axialFaws[i] / this.axialFibers[i].density;
            sumOfFaw = sumOfFaw + this.axialFaws[i];
        }
        return sumOfFaw / sumOfThickness;
    }
    /**
     * Fiber angle of biaxial braid varies with diameter
     *
     * @param {number} diameter the diameter in use
     * @returns {number} the biaxial fiber angle at the given diameter
     */
    getBiaxialFiberAngle(diameter) {
        let Do = this.braidDiameter;
        let Ao = this.biaxAngle;
        return radToDeg * Math.asin((diameter / Do) * Math.sin(Ao * degToRad));
    }
    /**
     * Fiber areal wt (Faw) varies with diameter.
     *
     * Biaxial layers:
     *      Faw/Fawo = Cos(Ao)Sin(Ao)/Sin(A)Cos(A)
     *      where:
     *          A = angle at in-use diameter, D
     *          A = ArcSin( D/Do * Sin(Ao) ), and
     *          Do, Ao are the as-braided angle and diameter
     *
     * Axial layers : Faw/Fawo = Do / D
     *
     * @param {number} diameter the diameter of the braid in use
     * @returns {number} Faw at diameter d, in kg/sq.m
     */
    getFaw(diameter) {
        return this.getBiaxialFaw(diameter) + this.getAxialFaw(diameter);
    }
    /**
     * Fiber areal wt (Faw) of biaxial layers varies with diameter.
     *
     *      Faw/Fawo = Cos(Ao)Sin(Ao)/Sin(A)Cos(A)
     *      where:
     *          A = angle at in-use diameter, D
     *          A = ArcSin( D/Do * Sin(Ao) ), and
     *          Do, Ao are the as-braided angle and diameter
     *
     * @param {number} diameter the diameter of the braid in use
     * @returns {number} biaxial fiber Faw at diameter, in kg/sq.m
     */
    getBiaxialFaw(diameter) {
        let A = (this.getBiaxialFiberAngle(diameter) * Math.PI) / 180.0;
        let Ao = (this.biaxAngle * Math.PI) / 180.0;
        return (
            (this.getBiaxialFawo() * (Math.cos(Ao) * Math.sin(Ao))) /
            (Math.cos(A) * Math.sin(A))
        );
    }
    /**
     * Fiber areal wt (Faw) varies with diameter.
     *
     * Axial layers : Faw/Fawo = Do / D
     *
     * @param {number} diameter the diameter of the braid in use
     * @returns {number} axial fiber Faw at the given diameter, in kg/sq.m
     */
    getAxialFaw(diameter) {
        return (this.getAxialFawo() * this.braidDiameter) / diameter;
    }

    /**
     * The braid nominal diameter is (od - thickness), but
     * thickness varies with diameter, so we iterate a few times
     * to get close to the correct diameter.
     *
     * @param {number} outsideDiameter in meters
     * @returns {number} the braid's nominal diameter
     */
    getDiaFromOd(outsideDiameter) {
        let fiberDensity = this.fiberDensity;

        let thickness =
            this.getFaw(outsideDiameter) /
            (this.getVf(outsideDiameter) * fiberDensity);

        let d = outsideDiameter - thickness; // braid diameter is nominal

        thickness = this.getFaw(d) / (this.getVf(d) * fiberDensity);
        d = outsideDiameter - thickness; // braid diameter is nominal

        thickness = this.getFaw(d) / (this.getVf(d) * fiberDensity);
        d = outsideDiameter - thickness; // braid diameter is nominal

        return d;
    }
    /**
     * The braid nominal diameter is (id + thickness), but
     * thickness varies with diameter, so we iterate a few times
     * to get close to the correct diameter.
     *
     * @param {number} insideDiameter in meters
     * @returns {number} the braid's nominal diameter
     */
    getDiaFromId(insideDiameter) {
        let fiberDensity = this.fiberDensity;

        let thickness =
            this.getFaw(insideDiameter) / (this.getVf(insideDiameter) * fiberDensity);

        let d = insideDiameter + thickness; // braid diameter is nominal

        thickness = this.getFaw(d) / (this.getVf(d) * fiberDensity);
        d = insideDiameter + thickness; // braid diameter is nominal

        thickness = this.getFaw(d) / (this.getVf(d) * fiberDensity);
        d = insideDiameter + thickness; // braid diameter is nominal

        return d;
    }
}

const degToRad = Math.PI / 180;
const radToDeg = 180 / Math.PI;

//========================================================================================

/**
 * Calculate the volume fraction of fiber from the mass fraction
 *
 * @param {number} fiberDensity
 * @param {number} resinDensity
 * @param {number} mf the fiber mass fraction, Mf in 0 - 1.0
 * @returns {number} the fiber volume fraction, Mf
 */
function vfFromMf(fiberDensity, resinDensity, mf) {
    return (mf * resinDensity) / (fiberDensity * (1 - mf) + resinDensity * mf);
}

/**
 * Calculate the mass fraction of fiber from the volume fraction
 *
 * @param {number} fiberDensity
 * @param {number} resinDensity
 * @param {number} vf the fiber volume fraction, Vf in 0 - 1.0
 * @returns {number} the fiber mass fraction, Mf
 */
function mfFromVf(fiberDensity, resinDensity, vf) {
    return (vf * fiberDensity) / (fiberDensity * vf + resinDensity * (1 - vf));
}

/**
 * Calculates the resin content to get a desired
 * fiber volume fraction.
 *
 * @param {number} vf desired Vf
 * @param {number} fiberDensity fiber density
 * @param {number} resinDensity resin density
 * @returns resin content to achieve desired Vf
 */
function rcForVf(fiberDensity, resinDensity, vf) {
    return 1 - mfFromVf(fiberDensity, resinDensity, vf);
}

/**
 * Calculates the resin content that gives the same fiber volume
 * fraction as an existing ply, assuming the same resin is used,
 * but a different fiber.
 *
 * @param {number} Rc1 the resin content of the existing ply
 * @param {number} fiber1Density the fiber density of the existing ply
 * @param {number} fiber2Density the fiber density of the new ply
 * @returns resin content to match existing Vf w. different fiber
 */
function rcForEqualVf(Rc1, fiber1Density, fiber2Density) {
    return (
        1 -
        ((1 - Rc1) * (fiber2Density / fiber1Density)) /
        (1 - (1 - Rc1) * (1 - fiber2Density / fiber1Density))
    );
}

/**
 *
 * A LayupContext contains auxilary information about the environment that the
 * Layup is being used in.  LayupContext provides information for Layer's when
 * generating laminates to represent themselves via Layer.getLaminate(layupContext).
 *
 */
export class LayupContext {
    /**
     * A LayupContext contains auxilary information about the environment that the
     * Layup is being used in.  LayupContext provides information for Layer's when
     * generating laminates to represent themselves via Layer.getLaminate(layupContext).
     *
     * Arbitrary properties can be added via the options argument, but will
     * only be used if one or more Layer classes understand their purpose.
     *
     * If a LayupContext is used as the argument then this becomes a copy constructor,
     * which can be modified as the Layup traverses the stack, say for increasing or
     * decreasing the diameter for each subsequent ply.
     *
     * @param {object} options
     * @memberof LayupContext
     */
    constructor(options) {
        this.resin = null;
        this.compactionPressure = 0.0;
        this.width = 1.0; // for flat layups
        this.length = 1.0; // for flat layups
        this.od = 1.0; // for tubular layups
        this.id = 1.0; // for tubular layups
        if (options) {
            Object.assign(this, options);
        }
    }
}
