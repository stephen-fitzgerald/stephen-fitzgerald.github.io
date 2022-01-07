// @ts-check
/*jshint esversion: 6 */

/**
 * returns true if the argument is a function
 *
 * @param {object} f
 * @returns {boolean} true if f is a function
 */
export function isFunction(f) {
    return !!(f && f.constructor && f.call && f.apply);
}

/**
 * Integrate a function of x using Simpson's rule.
 *
 * @param {function} fx function of x that returns a number
 * @param {number} x1 start of integration interval
 * @param {number} x2 end of integration interval
 * @param {number} [n=101] num pts to integrate, should be 
 * odd, defaults to 101
 * @returns integral of fx(x) from x = x1 to x2
 */
export function integrateFunction(fx, x1, x2, n = 101) {

    if (!isFunction(fx)) {
        throw new Error('f must be a function for simpson rule to work.');
    }
    if (n < 3) {
        throw new Error("Need at least 3 points to evaluate Simpson's Rule.");
    }
    // need an odd number of points (even number of segments)
    n = n % 2 === 0 ? n + 1 : n;
    let h = (x2 - x1) / (n - 1);
    let hDiv3 = h / 3;
    let x = x1;
    let sum = 0;

    for (let i = 0; i < n; i++) {
        sum = sum + hDiv3 * simpsonsMultiplier(i, n) * fx(x);
        x = x + h;
    }

    return sum;
}

/**
 * Returns the simpsons rule multiplier for pt i of n points.
 *
 * @param {number} i point of interest, in {0 to (n-1)}
 * @param {number} n max # of pts, should be odd
 * @returns {number} multiplier for pt i, ie {1,4,2,4,2...2,4,1}
 */
function simpsonsMultiplier(i, n) {
    if (i < 0 || i >= n) {
        throw new Error('i must be between 0 and n-1, found i = ' + i + ', n= ' + n);
    }
    if (i === 0 || i === (n - 1)) {
        return 1.0;
    } else if (i % 2 === 1) {
        return 4.0;
    } else {
        return 2.0;
    }
}

/**
 *
 *
 * @param {number} x
 * @param {number[]} xArray sorted array of x values
 * @param {number[]} yArray corisponding array of y values
 * @param {boolean} extrapolate if true: extrapolate for x out of range, if undefined: return nearest 
 * value for x out of range, if false: x out of range causes an Error
 * @returns interpolated value for y = f(x)
 */
 export function interpolateY(x, xArray, yArray, extrapolate) {

    if (xArray.length !== yArray.length || xArray.length < 2) {
        throw new Error('Bad x-y data.');
    }

    let xPos = 0;
    if (x < xArray[0]) {
        if (extrapolate === undefined) {
            return yArray[0];
        } else if (extrapolate == false) {
            throw new Error('x too low: ' + x.toPrecision(4) + ', min = ' + xArray[0].toPrecision(4));
        }
        // extrapolate to lower values of x
        xPos = 0;
    } else if (x > xArray[xArray.length - 1]) {
        if (extrapolate === undefined) {
            return yArray[xArray.length - 1];
        } else if (extrapolate == false) {
            throw new Error('x too high: ' + x.toPrecision(4) + ', max = ' + xArray[xArray.length - 1].toPrecision(4));
        }
        // extrapolate to higher values of x
        xPos = xArray.length - 2;
    } else {
        // interpolate
        while (xPos < xArray.length - 2 && xArray[xPos] < x) {
            xPos++;
        }
    }

    let xPrevious = xArray[xPos];
    let xAfter = xArray[xPos + 1];
    let yPrevious = yArray[xPos];
    let yAfter = yArray[xPos + 1];

    return yPrevious + (x - xPrevious) / (xAfter - xPrevious) * (yAfter - yPrevious);
}

/**
 * Interpolate or extrapolate to get a value for x, coresponding to the y value given.
 * If y is above the maximum or below the minimum y of the interpolation points then
 * undefined is returned.
 * 
 * @param {number} y the y value we want to interpolate an x value for
 * @param {number[]} xVals x values array
 * @param {number[]} yVals y values array
 * @returns {number} the interpolated x-value
 */

export function interpolateX(y, xVals, yVals) {
    //boolean extrapolationAllowed = true;
    let len = xVals.length;
    if (len != yVals.length) {
        throw new Error(" x and y arrays must be same length.");
    }
    if (len < 2) {
        throw new Error(" x and y arrays must have 2 or more points.");
    }

    //find max/min y values
    let yMin = Math.min(...yVals);
    let yMax = Math.max(...yVals);
    let pos = 0;

    // If y value is out of table's range, can't interpolate
    if (y < yMin || y > yMax) {
        return undefined;
    } else {
        // y value is bounded in table, find 1st pair of bounding points
        // or 1st exact match
        for (pos = 0; pos < len - 1; pos++) {
            // check for exact match
            if (yVals[pos] == y) {
                return xVals[pos];
            }
            if (yVals[pos + 1] == y) {
                return xVals[pos + 1];
            }

            if (yVals[pos] < y && yVals[pos + 1] > y ||
                yVals[pos] > y && yVals[pos + 1] < y) {
                break;
            }
        }
    }

    // at this point x is interpolated using pos & pos+1
    let slope = (xVals[pos + 1] - xVals[pos]) / (yVals[pos + 1] - yVals[pos]);
    let ret = xVals[pos] + (y - yVals[pos]) * slope;

    return ret;
}
