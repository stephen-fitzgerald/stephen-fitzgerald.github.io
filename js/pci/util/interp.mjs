/**
* Interpolate / extrapolate based on two points (x1,y1) & (x2,y2)
* @param {number} x  input value
* @param {number} x1 x1 must not equal x2
* @param {number} x2 x2 must not equal x1
* @param {number} y1 y value coresponding to x1
* @param {number} y2 y value coresponding to x2
* @param {boolean} [clamp] if false return will always be in range y1-y2
* 
* @returns {number} value of y that corresponds to x
*/
export function interp(x, x1, x2, y1, y2, clamp = true) {

    if (isNaN(x1) || isNaN(x2) || x1 == x2) {
        throw new Error(`Illegal xMin/xMax arguments: x1= ${x1}, x2= ${x2}`);
    }

    if (isNaN(y1) || isNaN(y2)) {
        throw new Error(`Illegal yMin/yMax arguments: y1= ${y1}, y2= ${y2}`);
    }

    let ret = y1 + (y2 - y1) * (x - x1) / (x2 - x1);

    if (!!(clamp)) {
        let yMin = y1 <= y2 ? y1 : y2;
        let yMax = y1 >= y2 ? y1 : y2;
        ret = ret < yMin ? yMin : ret;
        ret = ret > yMax ? yMax : ret;
    }

    return (ret);
}