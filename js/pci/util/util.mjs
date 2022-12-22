//@ts-check
// UNDER CONSTRUCTION - Need to pull these out of other modules

export function escapeHtml(str) {
    str = "" + str;
    return str
        .replace(/&/g, '&amp;') // first!
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;')
        ;
}

export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export function hasProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function isString(str) {
    return !!(typeof str === 'string' || str instanceof String);
}

export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180.0;
}

export function radiansToDegrees(radians) {
    return radians * 180.0 / Math.PI;
}

/**
 * cleanName( name )
 * Returns a trimmed string
 * @param {string} name the original property name
 * @return {string} the name, cleaned-up
 * @throws {Error} if the string is invalid (null, undefined or '')
 */
export function cleanName(name) {
    if (!isString(name) || name == null || name == undefined || name == '') {
        throw new Error("Illegal Argument - name must be a valid string.");
    }
    return name.trim();
}

export function getConstructor(obj) {
    if (obj && obj.constructor) {
        return obj.constructor;
    } else if (obj && obj.prototype) {
        return obj.prototype.constructor;
    }
    return undefined;
}


/**
 * Get the name of the clazz for this object, similar to Class in Java.  
 * 
 * @param {*} obj
 * @returns {string | undefined} the name of the _clazz
 */
export function getClazzName(obj) {
    if (obj && obj._clazz) {
        return obj._clazz;
    } else if (obj && obj.constructor) {
        return obj.constructor.name;
    } else if (obj && obj.prototype && obj.prototype.constructor) {
        return obj.prototype.constructor.name;
    }
    return undefined;
}


// regex to determine if a string is a valid ISO 8601 (JSON) formatted date
const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

export function isIsoDateString(str) {
    return (isString(str) && reISO.exec(str));
}

/**
 * Convert string that is in ISO 8601 / JSON date format to javascript Date object
 *
 * @param {Object} obj
 * @returns {Object} a Date object if obj is an ISO 8601 formatted string, the original object otherwise
 */
export function parseIsoDate(obj) {
    if (isIsoDateString(obj)) {
        obj = new Date(obj);
    }
    return obj;
}

// may need to work on this one
export function applyPrecision(num) {
    return String(Number(num).toPrecision(4));
}