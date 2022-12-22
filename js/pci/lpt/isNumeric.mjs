/**
 * 
 * @param {any} obj 
 * @returns {boolean} true if the argument represents a valid number
 */
export function isNumeric(obj) {
    return !!(!isNaN(parseFloat(obj)) && isFinite(obj));
}
