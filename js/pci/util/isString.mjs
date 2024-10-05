
/**
 * Returns true if the object is a String
 *
 * @export
 * @param {*} obj
 * @returns {boolean} - true if obj is a string
 */
export function isString(obj) {
    return !!(typeof obj === 'string' || obj instanceof String);
}
