// @ts-check
/*jshint esversion: 6 */

import { Material } from '../lpt/material.mjs';
import { Laminate } from '../lpt/lpt.mjs';
import { integrateFunction } from '../util/functions.mjs';
import { registerClazzConstructor } from '../util/serialize.mjs';
import { PlySpec } from '../lpt/plyspec.mjs';
import { Profile } from './profile.mjs';
import { calculateWallCompression } from './bat-calcs.mjs';


/**
 * Tubular part, has geometery (Profile), a ply stack (PlySpec[]) & a Layup Context
 *
 * @param {object} [options]
 * @param {String} [options.name]
 * @param {String} [options.description]
 * @param {Profile | object} [options.profile] OD vs x, along length (x-dir) of part
 * @param {Material} [options.resin] used by all non-prepreg layers
 * @param {PlySpec[]} [options.plySpecs]
 */
export class MoldedTube {
    constructor(options) {
        this.name = "";
        this.description = "";
        this.profile = null;
        this.resin = null;
        this.plySpecs = [];

        if (options) {
            this.name = options.name == undefined ? this.name : options.name;
            this.description = options.description == undefined ? this.description : options.description;

            // Geometry: x positions & corisponding ODs
            if (options.profile instanceof Profile) {
                this.profile = options.profile;
            } else if (options.profile) {
                this.profile = Object.assign(new Profile(), options.profile);
            }

            // resin used for all dry fiber (non-prepreg) layers
            if (options.resin instanceof Material) {
                this.resin = options.resin;
            } else if (options.resin) {
                this.resin = Object.assign(new Material(), options.resin);
            }

            // plies, start, end positions, angles & orientations
            if (Array.isArray(options.plySpecs) && options.plySpecs.length > 0) {
                let me = this;
                options.plySpecs.forEach(function (plySpec, index) {
                    me.addLayer(plySpec);
                });
            }
        }
    }
    getPlySpecs() {
        return this.plySpecs;
    }
    /**
     * Add a layer at a specific index in this laminate
     *
     * @param {number} index position, 0 is inside surface, < 0 == 0, >=length == outside surface
     * @param {PlySpec} plySpec
     * @returns  this MoldedTube, for method chaining
     */
    addLayerAt(index, plySpec) {
        let i = Math.min(this.plySpecs.length, Math.max(0, index));
        if (!(plySpec instanceof PlySpec)) {
            plySpec = new PlySpec(plySpec);
        }
        this.plySpecs.splice(i, 0, plySpec);
        return this;
    }
    /**
     * Adds a layer to the outside of the tubular part
     *
     * @param {PlySpec} plySpec
     * @returns  this MoldedTube, for method chaining
     */
    addLayer(plySpec) {
        return this.addLayerAt(this.plySpecs.length, plySpec);
    }
    getXMin() {
        return (this.profile.xMin);
    }
    getXMax() {
        return (this.profile.xMax);
    }
    /**
     * Positions of interest are start & end of material layers,
     * as well as positions where the profile changes.
     *
     * @returns {number[]} sorted array of positions of interest
     */
    getPositions() {
        // use a set to make each position unique
        let positionsSet = new Set();

        // positions of interest include start & end of each laminate
        // extra pts are added at ends to represent sudden changes better
        const plySpecs = this.plySpecs;
        const profile = this.profile;

        // get extents of profile and plyStack
        let xMax = Number.MIN_VALUE;
        let xMin = Number.MAX_VALUE;
        for (let i = 0; i < plySpecs.length; i++) {
            xMin = Math.min(xMin, plySpecs[i].start, plySpecs[i].end);
            xMax = Math.max(xMax, plySpecs[i].start, plySpecs[i].end);
        }
        for (let i = 0; i < profile.xPositions.length; i++) {
            xMin = Math.min(xMin, profile.xPositions[i]);
            xMax = Math.max(xMax, profile.xPositions[i]);
        }

        // include the ends of every ply, plus pts just before and after
        for (let i = 0; i < plySpecs.length; i++) {
            let eps = Number.EPSILON * 100.0;
            let start = plySpecs[i].start;
            let end = plySpecs[i].end;
            if (start - eps > xMin) {
                positionsSet.add(start - eps);
            }
            positionsSet.add(start);
            positionsSet.add(end);
            if (end + eps < xMax) {
                positionsSet.add(end + eps);
            }
        }

        // positions of interest include all changes in profile
        for (let i = 0; i < profile.xPositions.length; i++) {
            positionsSet.add(profile.xPositions[i]);
        }

        let sortedPositions = Array.from(positionsSet).sort(
            function (a, b) {
                return a - b;
            }
        );
        return sortedPositions;
    }
    /**
     * Build a LPT.Laminate representing the layup at position x.
     *
     * @param {number} x position in meters from origin
     * @returns {Laminate} LPT.Laminate laminate representing layup at x
     */
    getLaminate(x) {
        let theLaminate = new Laminate();

        let od = this.getOD(x);

        // TODO start a new laminate every time we hit a release layer
        // TODO ignore disposable layers, do not include in laminate
        // build laminate from outside in, so OD can be updated
        for (let i = this.plySpecs.length - 1; i >= 0; i--) {
            let layerI = this.plySpecs[i];
            if (x >= layerI.start && x < layerI.end) {
                let subLaminate = layerI.layer.getLaminate({
                    od: od,
                    resin: this.resin
                });
                // insert layers so the order is inside to outside in the laminate
                if (subLaminate) {
                    theLaminate.addPlyAt(0, subLaminate, layerI.angle, layerI.orientation);
                    // update the OD for the next layer
                    od = od - 2 * subLaminate.thickness;
                }
            }
        }
        // @ts-ignore
        return theLaminate;
    }
    /**
     * Calculate the tube section properties at a given position, x.
     *
     * @param {number} x position, in meters
     * @returns {object}  properties of the tube at x, including the LPT.Laminate
     */
    getSectionProperties(x) {

        let theLaminate = this.getLaminate(x);
        // @ts-ignore
        let lamProps = theLaminate.properties;
        let od = this.getOD(x); // m

        let id = od - 2 * lamProps.thickness; // m

        let sign = lamProps.NAx >= 0 ? 1.0 : -1.0; // positive NA is outward from mid-plane

        let A = Math.PI / 4 * (od * od - id * id); // m^2
        let I = Math.PI / 64 * (od * od * od * od - id * id * id * id); // m^4

        return {
            x: x,
            OD: od,
            ID: od - 2 * lamProps.thickness,
            thickness: lamProps.thickness,
            Area: A,
            I: I,
            wtPerLen: A * lamProps.rho,
            barrelCompression: calculateWallCompression(od, lamProps),

            //local flexural stiffness Ef(t^3/12)
            ExfT3Div12: lamProps.Exf * lamProps.thickness * lamProps.thickness * lamProps.thickness / 12.0,
            EyfT3Div12: lamProps.Eyf * lamProps.thickness * lamProps.thickness * lamProps.thickness / 12.0,
            // beam bending stiffness
            ExI: lamProps.Ex * (I + A * lamProps.NAx * lamProps.NAx * sign),
            laminate: theLaminate,
            lamProps: lamProps,
        };
    }
    /**
     * Interpolate the OD of this part for a given x position
     *
     * @param {number} x position in meters from origin
     * @returns {number} the OD at position x, or undefined if no profile set yet
     */
    getOD(x) {
        let ret;
        if (this.profile) {
            ret = this.profile.getOdForPos(x);
        }
        return ret;
    }
    getPropertyValueAtX(propertyName, x) {
        return this.getSectionProperties(x)[propertyName];
    }
    getArea(x) {
        return this.getPropertyValueAtX('Area', x);
    }
    getWtPerLen(x) {
        return this.getPropertyValueAtX('WtPerLen', x);
    }
    /**
     *
     *
     * @param {number} xMin left position in meters
     * @param {number} xMax right position in meters
     * @returns {number} volume of part from xMin to xMax, in cu.m
     */
    getVolume(xMin, xMax) {
        return integrateFunction(this.getArea, xMin, xMax);
    }
    /**
     * @param {number} xMin left position in meters
     * @param {number} xMax right position in meters
     * @returns {number} weight of part from xMin to xMax, in kg
     */
    getWeight(xMin, xMax) {
        return integrateFunction(this.getWtPerLen, xMin, xMax);
    }
    firstMomentOfMass(x) {
        return x * this.getWtPerLen(x);
    }
    getCOG(xMin, xMax) {
        let firstMoment = integrateFunction(this.firstMomentOfMass, xMin, xMax);
        let mass = this.getWeight(xMin, xMax);
        return firstMoment / mass;
    }
    secondMomentOfMass(x) {
        return x * x * this.getWtPerLen(x);
    }
    getMOI(xMin, xMax) {
        let mass = this.getWeight(xMin, xMax);
        let cog = this.getCOG(xMin, xMax);
        let secondMoment = integrateFunction(this.secondMomentOfMass, xMin, xMax);
        return secondMoment - mass * cog * cog;
    }
}

registerClazzConstructor('MoldedTube', MoldedTube);
