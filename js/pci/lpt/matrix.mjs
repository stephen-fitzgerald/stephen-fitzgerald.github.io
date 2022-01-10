//=============================================================================
// matrix functions

/* jshint esversion: 6 */
// @ts-check

/**
 * Create a new 2D array initialized to 0's
 *
 * @param {number} rows
 * @param {number} cols
 * @returns an initialized array of size [rows][cols]
 */
 export function matrixCreate(rows, cols) {
    let m = new Array(rows);
    for (let r = 0; r < rows; ++r) {
        m[r] = new Array(cols); // initialize the current row
        for (let c = 0; c < cols; ++c) {
            m[r][c] = 0.0; // initialize the current cell
        }
    }
    return m;
}

/**
 * Copy a rectangular sub-array from an existing array
 *
 * @param {number[][]} a
 * @param {number} startRow top row of submatrix to copy : (0 - a.length)
 * @param {number} startCol left column of submatrix to copy : (0 - a[0].length)
 * @param {number} nRows # of rows to copy (1 to a.length - startRow)
 * @param {number} nCols # of columns to copy (1 to a[0].length - startCol)
 * @returns {number[][]} an array[nRows][nCols] copied from a
 */
export function matrixCopy(a, startRow, startCol, nRows, nCols) {
    let m = new Array(nRows);
    for (let r = 0; r < nRows; ++r) {
        m[r] = new Array(nCols); // initialize the current row
        for (let c = 0; c < nCols; ++c) {
            m[r][c] = a[startRow + r][startCol + c]; // initialize the current cell
        }
    }
    return m;
}

/**
 * Scale a matrix by a scalar value
 *
 * @param {number[][]} a the array
 * @param {number} scale the scale factor
 * @returns {number[][]} new array m, with m[i][j] = a[i][j] * scale;
 */
export function matrixScale(a, scale) {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    let m = new Array(aNumRows); // initialize array of rows
    for (let r = 0; r < aNumRows; ++r) {
        m[r] = new Array(aNumCols); // initialize the current row
        for (let c = 0; c < aNumCols; ++c) {
            m[r][c] = a[r][c] * scale; // initialize the current cell
        }
    }
    return m;
}

/**
 * Add a scalar value to each element of an array
 *
 * @param {number[][]} a the array
 * @param {number} scale the value to add to each element in a
 * @returns {number[][]} new array m, with m[i][j] = a[i][j] + scale;
 */
export function matrixAddScalar(a, scale) {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    let m = new Array(aNumRows); // initialize array of rows
    for (let r = 0; r < aNumRows; ++r) {
        m[r] = new Array(aNumCols); // initialize the current row
        for (let c = 0; c < aNumCols; ++c) {
            m[r][c] = a[r][c] * scale; // initialize the current cell
        }
    }
    return m;
}

/**
 * Transpose a matrix
 *
 * @param {number[][]} a an mxn array
 * @returns {number[][]} new nxm array, b, with b[i][j] = a[j][i] * scale;
 */
export function matrixTranspose(a) {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    let m = new Array(aNumCols); // initialize array of rows
    for (let r = 0; r < aNumCols; ++r) {
        m[r] = new Array(aNumRows); // initialize the current row
        for (let c = 0; c < aNumRows; ++c) {
            m[r][c] = a[c][r]; // initialize the current cell
        }
    }
    return m;
}

/**
 * Add two matrices
 *
 * @param {number[][]} a an mxn matrix
 * @param {number[][]} b matrix of same size
 * @returns {number[][]} new array m, with m[r][c] = a[r][c] + b[r][c];
 */
export function matrixAdd(a, b) {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    let bNumRows = b.length;
    let bNumCols = b[0].length;
    let m = new Array(aNumRows); // initialize array of rows
    for (let r = 0; r < aNumRows; ++r) {
        m[r] = new Array(aNumCols); // initialize the current row
        for (let c = 0; c < aNumCols; ++c) {
            m[r][c] = a[r][c] + b[r][c]; // initialize the current cell
        }
    }
    return m;
}

/**
 * Multiply two matrices
 *
 * @param {number[][]} a
 * @param {number[][]} b
 * @returns {number[][]} a new array
 */
export function matrixMultiply(a, b) {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    let bNumRows = b.length;
    let bNumCols = b[0].length;
    let m = new Array(aNumRows); // initialize array of rows
    for (let r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (let c = 0; c < bNumCols; ++c) {
            m[r][c] = 0; // initialize the current cell
            for (let i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}

/**
 *  Matrix inversion
 *
 * @param {number[][]} M a square matrix of numbers
 * @returns {number[][]} the inverse matrix
 */
export function matrixInvert(M) {
    // Uses Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows

    //if the matrix isn't square: exit (error)
    if (M.length !== M[0].length) {
        throw new Error('Can not invert a non-square matrix');
    }

    //create the identity matrix (I), and a copy (C) of the original
    let i = 0,
        ii = 0,
        j = 0,
        dim = M.length,
        e = 0,
        t = 0;
    let I = [],
        C = [];
    for (i = 0; i < dim; i += 1) {
        // Create the row
        I[I.length] = [];
        C[C.length] = [];
        for (j = 0; j < dim; j += 1) {

            //if we're on the diagonal, put a 1 (for identity)
            if (i == j) {
                I[i][j] = 1;
            } else {
                I[i][j] = 0;
            }

            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }

    // Perform elementary row operations
    for (i = 0; i < dim; i += 1) {
        // get the element e on the diagonal
        e = C[i][i];

        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if (e == 0) {
            //look through every row below the i'th row
            for (ii = i + 1; ii < dim; ii += 1) {
                //if the ii'th row has a non-0 in the i'th col
                if (C[ii][i] != 0) {
                    //it would make the diagonal have a non-0 so swap it
                    for (j = 0; j < dim; j++) {
                        e = C[i][j]; //temp store i'th row
                        C[i][j] = C[ii][j]; //replace i'th row by ii'th
                        C[ii][j] = e; //repace ii'th by temp
                        e = I[i][j]; //temp store i'th row
                        I[i][j] = I[ii][j]; //replace i'th row by ii'th
                        I[ii][j] = e; //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if (e == 0) {
                return;
            }
        }

        // Scale this row down by e (so we have a 1 on the diagonal)
        for (j = 0; j < dim; j++) {
            // @ts-ignore
            C[i][j] = C[i][j] / e; //apply to original matrix
            // @ts-ignore
            I[i][j] = I[i][j] / e; //apply to identity
        }

        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for (ii = 0; ii < dim; ii++) {
            // Only apply to other rows (we want a 1 on the diagonal)
            if (ii == i) {
                continue;
            }

            // We want to change this element to 0
            e = C[ii][i];

            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column. All the cells
            // to the left of diagonal should be 0 if we did this correctly
            for (j = 0; j < dim; j++) {
                // @ts-ignore
                C[ii][j] -= e * C[i][j]; //apply to original matrix
                // @ts-ignore
                I[ii][j] -= e * I[i][j]; //apply to identity
            }
        }
    }

    //we're done, C should be the identity matrix I should be the inverse:
    return I;
}
