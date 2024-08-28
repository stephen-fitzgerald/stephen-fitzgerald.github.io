// @ts-check
/*js hint esversion: 6 */
/*js hint evil: true */

let globalClazzMap = new Map();

function isString(str) {
    return !!(typeof str === 'string' || str instanceof String);
}

function getConstructor(obj) {
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

/**
 * Add an object's constructor to the global class map so the class can be
 * properly deserialized.  Only add it if it is not already registered.
 * This means that constructors registered via registerClazzConstructor()
 * take priority and are not over-ridden.  Returns true if the class is 
 * registered, false if it is already registered, or has no constructor.
 *
 * @param {object} theObject an object of the class we want to register
 * @returns {boolean} true if the object's constructor is registered
 */
function registerObjectClazz(theObject) {
    let classname = getClazzName(theObject);
    if (classname && globalClazzMap.has(classname) == false) {
        let konstructor = getConstructor(theObject);
        if (typeof konstructor === 'function') {
            registerClazzConstructor(classname, konstructor);
            return true;
        }
    }
    return false; // constructor was not registered
}

/**
 * Add a constructor to the global class map so the class can be
 * properly deserialized.
 *
 * @param {string} clazzName  name of the class/constructor
 * @param {function} Konstructor the constructor function
 * @returns {function} existing constructor for name, or undefined
 */
export function registerClazzConstructor(clazzName, Konstructor) {
    let ret = globalClazzMap.get(clazzName);
    globalClazzMap.set(clazzName, Konstructor);
    return ret;
}

/**
 * Calls JSON.stringify(decycle(obj), replacer, space)
 * 
 * @param {*} obj the object to stringify
 * @param {*} replacer - defaults to null
 * @param {string | number} [space] seperator chars, or # of spaces bewteen elements
 * @returns {string} serialized & decycled string representation of obj
 */
export function decycleAndStringify(obj, replacer = null, space = 4) {
    return JSON.stringify(decycle(obj), replacer, space);
}

/**
 * Creates a class map for the object and stringifys an object containing the 
 * classMap as property 'classMap' and the object as property 'data'.
 *
 * @param {*} obj
 * @param {string|number} [space] seperator chars, or # of spaces bewteen elements
 * @returns {string} decycled JSON string representation of { classMap: classMap, data: root }, 
 */
export function serialize(obj, space = 4) {
    let cm = Array.from(buildClassMap(obj));
    let o = {
        data: obj,
        classMap: cm,
    };
    let str = decycleAndStringify(o, null, space);
    return str;
}

/**
 * Parses a JSON string, which must have 'classMap' & 'data' properties.
 * Returns the fully reconstituted 'data' object. 
 *
 * @param {object} jsonStr must have 'classMap' & 'data' properties
 * @returns {object} fully reconstituted 'data' object
 */
export function deserialize(jsonStr) {
    // parse from string to objects
    let parsed = JSON.parse(jsonStr);
    // re-build references from decycling
    let recycled = retrocycle(parsed);
    // re-istantiate non-JSON objects
    let reconstituted = reconstitute(recycled);
    return reconstituted.data;
}


export function deepCloneObject(root) {
    let str = serialize(root);
    let ret = deserialize(str);
    return ret;
}

/**
 * 
 *  Walks recursively through an object tree looking for objects 
 *  that are not native to JSON.  Each is replaced with one instantiated 
 *  using a constructor registered in the globalClazzMap. 
 * 
 *  Strings of ISO date format are also reconstituted as Date objects.
 *
 *  To be reconstituted the object must: 
 *  1) have a property called 'classMap' = Map<object, class name>,  see
 *     serialize() for an example of classMap construction.
 *  2) have a constructor registered in the globalClazzMap for each class 
 *     globalClazzMap = Map<class name, constructor>
 *
 * @param {Object} root  the root of the the object tree to reconstitute
 * @returns object tree, mutated by replacing plain/json objects with 'real' 
 * javascript objects
 */
function reconstitute(root) {

    // Map< Object, Class >, attached to root when saved as JSON
    let classMap = root.classMap;
    if (Array.isArray(classMap)) {
        classMap = new Map(classMap);
    }
    if (!(classMap instanceof Map)) {
        throw new Error('No valid classMap found');
    }

    // Map< originalObject, reconstitutedObject >
    let visited = new Map();

    return reconst(root);

    function reconst(origObj) {

        let obj = visited.get(origObj);
        if (obj != undefined) {
            return obj;
        }
        obj = origObj;

        // reconstitute child objects
        if (obj && typeof obj === 'object') {
            // Reconstitute object's children recursively
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                    obj[i] = reconst(obj[i]);
                }
            } else {
                Object.keys(obj).forEach(function (name) {
                    obj[name] = reconst(obj[name]);
                });
            }
        }

        // convert strings to Date objects if they are in ISO date format
        if (isString(obj)) {
            // @ts-ignore
            obj = isIsoDateString(obj) ? new Date(obj) : obj;
        }

        // instantiate a proper object from class information
        let clazz = classMap.get(obj);
        if (clazz) {
            // use a registered function, if available
            let Konstructor = globalClazzMap.get(clazz);
            if (typeof Konstructor == 'function') {
                let temp = new Konstructor();
                obj = Object.assign(temp, obj);
            } else {
                throw new Error("No constructor found for serialized object of type: " + clazz);
            }
        }

        if (obj !== origObj) {
            visited.set(origObj, obj);
        }
        return obj;
    }
}

/**
 * Visit every child of an object and determine if it is an object type that is
 * included in JSON.  If not, create a Map<Object, string> that associates each 
 * object with it's class/constructor name.  This information can be used after 
 * parsing the JSON form of the object to reconstitute the objects as instances 
 * of their original class.  Native Javascript Objects and Arrays are not 
 * recorded, as they are known to JSON. 
 * 
 * See serialize() for an example of use.  A parent object is created containing
 * the object to be serialized, along with its classMap.  This combined object
 * is stringified, so the class information is saved within the JSON string.
 * After parsing the JSON the objects are re-instantiated to the correct
 * object types using the constructor names saved in the classMap.
 * 
 * This function is recursive.  Leave the classMap argument undefined for the 
 * initial call on the root object.
 * 
 * This function also adds all object classes found to the global class Map, if 
 * not there already. This makes it possible to clone, serialize/deserialize 
 * objects without worrying if their classes have been registered.
 *
 * @param {Object} obj  the root object
 * @param {Map<Object, string>} [classMap] Map of known objects, leave undefined
 * @returns {Map<Object, string>} Map<object,string> associating object & class
 */
function buildClassMap(obj, classMap) {
    if (classMap == undefined) {
        // create an initial classMap if required
        classMap = new Map();
    } else if (classMap.get(obj) != undefined) {
        // return existing classMap if obj is already in it 
        return classMap;
    }
    // if obj is an object, but not one of the built in objects
    if (obj !== null && typeof obj === "object" &&
        !(obj instanceof Boolean) && !(obj instanceof Date) &&
        !(obj instanceof Number) && !(obj instanceof RegExp) &&
        !(obj instanceof String)
    ) {
        let clazz = getClazzName(obj);
        // if it's not an Array or plain javascript Object
        if (clazz && clazz != 'Object' && clazz != 'Array') {
            classMap.set(obj, clazz);
            // also add the object's constructor to the global class 
            // map, if not there already.
            registerObjectClazz(obj);
        }
        // visit object's children recursively
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                buildClassMap(obj[i], classMap);
            }
        } else if (obj instanceof Map || obj instanceof Set) {
            let items = Array.from(obj);
            for (let i = 0; i < items.length; i++) {
                buildClassMap(items[i], classMap);
            }
        } else {
            Object.keys(obj).forEach(function (name) {
                buildClassMap(obj[name], classMap);
            });
        }
    }
    return classMap;
}

// regex to determine if a string is a valid ISO 8601 (JSON) formatted date
const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

export function isIsoDateString(str) {
    // @ts-ignore
    return (isString(str) && reISO.exec(str));
}

/**
 * Convert string that is in ISO 8601 / JSON date format to javascript Date object
 *
 * @param {object} obj
 * @returns {Date} a Date object if obj is an ISO 8601 formatted string, the original object otherwise
 */
export function parseIsoDate(obj) {
    return isIsoDateString(obj) ? new Date(obj) : obj;
}

// Make a deep copy of an object or array, assuring that there is at most
// one instance of each object or array in the resulting structure. The
// duplicate references (which might be forming cycles) are replaced with
// an object of the form
//      {"$ref": PATH}
// where the PATH is a JSONPath string that locates the first occurance.
// So,
//      var a = [];
//      a[0] = a;
//      return JSON.stringify(JSON.decycle(a));
// produces the string '[{"$ref":"$"}]'.
// If a replacer function is provided, then it will be called for each obj.
// A replacer function receives a obj and returns a replacement obj.
// JSONPath is used to locate the unique object. $ indicates the top level of
// the object or array. [NUMBER] or [STRING] indicates a child element or
// property.
//
export function decycle(object, replacer) {

    var objects = new WeakMap(); // object to path mappings

    return (function derez(obj, path) {

        // The derez function recurses through the object, producing the deep copy.
        var old_path; // The path of an earlier occurance of obj
        var nu; // The new object or array

        // If a replacer function was provided, then call it to get a replacement obj.
        if (replacer !== undefined) {
            obj = replacer(obj);
        }

        if (obj instanceof Map) {
            obj = {
                _clazz: 'Map',
                items: Array.from(obj),
            };
        }
        if (obj instanceof Set) {
            obj = {
                _clazz: 'Set',
                items: Array.from(obj),
            };
        }

        // typeof null === "object", so go on if this obj is really an object but not
        // one of the weird builtin objects.
        if (typeof obj === "object" &&
            obj !== null &&
            !(obj instanceof Boolean) &&
            !(obj instanceof Date) &&
            !(obj instanceof Number) &&
            !(obj instanceof RegExp) &&
            !(obj instanceof String)) {

            // If the obj is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.
            old_path = objects.get(obj);
            if (old_path !== undefined) {
                return {
                    $ref: old_path
                };
            }

            // Otherwise, accumulate the unique obj and its path.
            objects.set(obj, path);

            // If it is an array, replicate the array.
            if (Array.isArray(obj)) {
                nu = [];
                obj.forEach(function (element, i) {
                    nu[i] = derez(element, path + "[" + i + "]");
                });
            } else {
                // If it is an object, replicate the object.
                nu = {};
                Object.keys(obj).forEach(function (name) {
                    nu[name] = derez(
                        obj[name],
                        path + "[" + JSON.stringify(name) + "]"
                    );
                });
            }
            return nu;
        }
        return obj;
    }(object, "$"));
}

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.
export function retrocycle($) {

    var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

    // The rez function walks recursively through the object looking for $ref
    // properties. When it finds one that has a value that is a path, then it
    // replaces the $ref object with a reference to the value that is found by
    // the path.

    (function rez(value) {

        if (value && typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(function (element, i) {
                    if (typeof element === "object" && element !== null) {
                        var path = element.$ref;
                        if (typeof path === "string" && px.test(path)) {
                            value[i] = eval(path);
                        } else {
                            rez(element);
                        }
                    }
                });
            } else {
                Object.keys(value).forEach(function (name) {
                    var item = value[name];
                    if (typeof item === "object" && item !== null) {
                        var path = item.$ref;
                        if (typeof path === "string" && px.test(path)) {
                            value[name] = eval(path);
                        } else {
                            rez(item);
                        }
                    }
                });
            }
        }
    }($));
    return $;
}