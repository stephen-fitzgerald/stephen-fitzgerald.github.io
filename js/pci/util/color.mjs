export function hslStrToObj(hslStr) {
    const [hue, saturation, lightness] = hslStr.match(/\d+/g).map(Number);
    return { hue, saturation, lightness };
};

/**
    Converts an rgb() color string to an object with the values of each color.
    
    Use String.prototype.match() to get an array of 3 string with the numeric 
    values.
    Use Array.prototype.map() in combination with Number to convert them into an 
    array of numeric values.
    Use array destructuring to store the values into named variables and create an 
    appropriate object from them.
*/
export function toRGBObject(rgbStr) {
    const [red, green, blue] = rgbStr.match(/\d+/g).map(Number);
    return { red, green, blue };
};

/**
    Converts a RGB color tuple to HSL format.

    Use the RGB to HSL conversion formula to convert to the appropriate format.
    The range of all input parameters is [0, 255].
    The range of the resulting values is H: [0, 360], S: [0, 100], L: [0, 100].
*/
export function RGBToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
    ];
};

/**
 *   Converts a HSL color tuple to RGB format.
 *   Use the HSL to RGB conversion formula to convert to the appropriate format.
 *   The range of the input parameters is H: [0, 360], S: [0, 100], L: [0, 100].
 *   The range of all output values is [0, 255].
 */
export function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
};


/**
 * Changes the lightness value of an hsl() color string.
 *
 * Use String.prototype.match() to get an array of 3 strings with the numeric values.
 * Use Array.prototype.map() in combination with Number to convert them into an array of numeric values.
 * Make sure the lightness is within the valid range (between 0 and 100), using Math.max() and Math.min().
 * Use a template literal to create a new hsl() string with the updated value.
 *
 * @param {*} delta 
 * @param {*} hslStr 
 * @returns 
 */
export function changeLightness(delta, hslStr) {
    const [hue, saturation, lightness] = hslStr.match(/\d+/g).map(Number);

    const newLightness = Math.max(
        0,
        Math.min(100, lightness + parseFloat(delta))
    );

    return `hsl(${hue}, ${saturation}%, ${newLightness}%)`;
};

/** Converts the values of RGB components to a hexadecimal color code.

Convert given RGB parameters to hexadecimal string using bitwise left-shift operator (<<) and Number.prototype.toString().
Use String.prototype.padStart() to get a 6-digit hexadecimal value.
*/
export function RGBToHex(r, g, b) {
    ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');
}

/**
 * Converts a color code to an rgb() or rgba() string if alpha value is provided.
Use bitwise right-shift operator and mask bits with & (and) operator to convert a hexadecimal color code (with or without prefixed with #) to a string with the RGB values.
If it's 3-digit color code, first convert to 6-digit version.
If an alpha value is provided alongside 6-digit hex, give rgba() string in return.
*/
export function hexToRGB(hex) {
    let alpha = false,
        h = hex.slice(hex.startsWith('#') ? 1 : 0);
    if (h.length === 3) h = [...h].map(x => x + x).join('');
    else if (h.length === 8) alpha = true;
    h = parseInt(h, 16);
    return (
        'rgb' +
        (alpha ? 'a' : '') +
        '(' +
        (h >>> (alpha ? 24 : 16)) +
        ', ' +
        ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
        ', ' +
        ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
        (alpha ? `, ${h & 0x000000ff}` : '') +
        ')'
    );
};

export function randomHexColorCode() {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
};

