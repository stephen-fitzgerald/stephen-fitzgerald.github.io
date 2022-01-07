// @ts-check
/*jshint esversion: 6 */

/**
 * Estimates barrel compression in lf per 0.050" deflection, given the od and the laminate 
 * properties
 *
 * @param {number} od (m)
 * @param {object} lamProps lamProps as returned by LPT.Laminate.getProperties
 * @param {number} lamProps.thickness (m)
 * @param {number} lamProps.NAy (m)
 * @param {number[][]} lamProps.stiffnessMatrix; (Pa-m)
 * @returns {number} the barrel compression (lbf/0.050")
 */
 export function barrelCompression(od, lamProps) {

    let nToLbf = 0.22480894;
    let mToInch = 1 / 0.0254;

    let k = [0.755, 0.600, 0.162, 0.000, 0.000, 0.596];
    let n = [0.858, 1.401, 1.051, 0.000, 0.978, 0.298];

    let Dxx = lamProps.stiffnessMatrix[3][3] * nToLbf * mToInch; // lbf-in
    let Dxy = lamProps.stiffnessMatrix[3][4] * nToLbf * mToInch;
    let Dyy = lamProps.stiffnessMatrix[4][4] * nToLbf * mToInch;
    let Dss = lamProps.stiffnessMatrix[5][5] * nToLbf * mToInch;

    let t = lamProps.thickness; // m
    let R = (od / 2.0 - t + lamProps.NAy); // m
    t = t * mToInch;
    R = R * mToInch;

    let ret = 1.0;
    ret = ret + k[2] * Math.pow(Dxx / Dyy, n[2]);
    ret = ret + k[3] * Math.pow(Dss / Dyy, n[3]);
    ret = ret + k[4] * Math.pow(Dxy / Dyy, n[4]);
    ret = ret + k[5] * Math.pow((R * Dss) / (t * Dyy), n[5]);
    ret = ret * (k[0] * Math.pow(Dyy, n[0]) / (k[1] * Math.pow(R, n[1]))); // lbf per 0.050 inch
    return ret;
}