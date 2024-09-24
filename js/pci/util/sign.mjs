// @ts-check
/*jshint esversion: 6 */

/**
 * Return +/-1, based on the sign of the argument, or 0 if it's 0.0
 *
 * @param {number} n
 * @returns {(1 | -1 | 0)}
 */
export function sign(n) {
    if (n < 0) return (-1.0);
    if (n > 0) return (1.0);
    return (0.0);
}