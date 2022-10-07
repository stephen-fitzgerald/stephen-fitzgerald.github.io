/* usage:
        import { Enum } from '../js/pci/util/enum.mjs';

        const DAYS = new Enum(
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        );

        let monday = DAYS.Monday;
        console.log("monday = " + monday); // monday = 0

        let daysArray = [...DAYS];
        console.log("[...DAYS] = ");
        console.log(daysArray); // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        console.log("DAYS.forEach(day) = ");
        DAYS.forEach((day) => { console.log(day); }); // Monday, Tuesday...

        let keys = DAYS.getKeys();
        console.log("DAYS.getKeys() = ");
        console.log(keys); // ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        let values = DAYS.getValues();
        console.log("DAYS.getValues() = ");
        console.log(values); // [0, 1, 2, 3, 4, 5, 6]

        let keyValues = DAYS.getKeyValues();
        console.log("getKeyValues() = ");
        console.log(keyValues); // [{Monday: 0}, {Tuesday: 1}, {Wednesday: 2} ... ]

*/

export class Enum {
    /**
     * Keep the numeric values increasing to avoid things 
     * like Color.Red === Species.Fish 
     * @type {number} 
     * @static
     * @memberOf Enum
     */
    static _nextValue = 0;
    
    /**
     * Creates an instance of Enum.
     * const daysEnum = new Enum(
     *   'monday',
     *   'tuesday',
     *   'wednesday',
     *   'thursday',
     *   'friday',
     *   'saturday',
     *  'sunday'
     * );
     * @param {*} keys
     * @memberof Enum
     */

    constructor(...keys) {

        //this._clazz = this.constructor.name;

        keys.forEach((key, i) => {
            this[key] = Enum._nextValue;
            Enum._nextValue += 1;
        });

        Object.defineProperty(this, '_keysArray', {
            value: [],
            enumerable: false
        });

        Object.defineProperty(this, '_valuesArray', {
            value: [],
            enumerable: false
        });

        Object.defineProperty(this, '_keyValuesArray', {
            value: [],
            enumerable: false
        });

        Object.defineProperty(this, '_keyOrdinalsArray', {
            value: [],
            enumerable: false
        });

        let minValue;
        for (let key of Object.keys(this)) {

            this._keysArray.push(key);

            this._valuesArray.push(this[key]);

            let obj = {};
            obj[key] = this[key];
            this._keyValuesArray.push(obj);

            if( minValue == undefined ){
                minValue = this[key];
            }
            obj = {};
            obj[key] = this[key]-minValue;
            this._keyOrdinalsArray.push(obj);
        }

        Object.freeze(this);
    }

    /**
     * Iterate through the keys of the enum
     * @param {function(*,number):void} callBack
     * @memberof Enum
     */
    forEach(callBack) {
        let i = 0;
        for (let key of Object.keys(this)) {
            callBack(key, i);
            i++;
        }
    }

    /**
     * 
     * @returns {[string]} an array of strings
     */
    getKeys() {
        return this._keysArray;
    }

    getValues() {
        return this._valuesArray;
    }

    getKeyValues() {
        return this._keyValuesArray;
    }

    getKeyOrdinals() {
        return this._keyOrdinalsArray;
    }

    *[Symbol.iterator]() {
        for (let key of Object.keys(this)) yield key;
    }

}

