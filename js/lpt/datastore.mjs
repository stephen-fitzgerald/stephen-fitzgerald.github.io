//@ts-check
/*jshint esversion: 6 */

import { hasProperty } from "./util.mjs";
import { isString } from "./util.mjs";

/**
 * Object storage by name(id), multiple categories, and clazz/constructor name.
 */
export class DataStore {

    constructor() {
        this._clazz = new.target.name;
        //Object with no prototype is a simple HashMap
        this._items = {}; //Object.create(null);  // ends up as Object after serialization
        this._itemsByCategory = {}; //Object.create(null);
        this._itemsByClazz = {}; //Object.create(null);
    }

    /**
     * Add an item to the data store with 'name' as its id.
     *
     * @param {string} name a unique id
     * @param {Object} theItem the object to save
     * @param {string[]} categories an array of string categories
     *
     * @returns {Object} object previously stored using same name, or undefined
     */
    addItem(name, theItem, categories) {

        let itemName = DataStore.cleanName(name);

        let existingObject = this._items[itemName];

        this._items[itemName] = theItem;

        if (Array.isArray(categories)) {
            // add the item to the categorized lists
            for (let i = 0; i < categories.length; i++) {

                if (isString(categories[i])) {

                    let legalCategory = DataStore.cleanName(categories[i]);

                    // if a list doesn't exist for a category, create it
                    if (hasProperty(this._itemsByCategory, legalCategory) === false) {
                        this._itemsByCategory[legalCategory] = {};
                    }
                    // add theItem to the category list
                    this._itemsByCategory[legalCategory][itemName] = theItem;
                }
            }
        }

        // save the item by 'clazz' name
        let clazz = DataStore.getClazzName(theItem);

        // if a list doesn't exist for the class, create it
        if (!(hasProperty(this._itemsByClazz, clazz))) {
            this._itemsByClazz[clazz] = {}; //Object.create(null);
        }
        this._itemsByClazz[clazz][itemName] = theItem;

        // return any object that was stored using the same name
        return existingObject;
    }

    /**
     * Remove an item from the data store
     *
     * @param {string} name the id of the item to remove
     * @returns {object} the item, or undefined if it did not exist
     */
    removeItem(name) {
        let itemName = DataStore.cleanName(name);
        let theItem = this._items[itemName];
        delete this._items[itemName];
        // delete any objects stored in per-category lists under same name
        for (let catName in this._itemsByCategory) {
            delete this._itemsByCategory[catName][itemName];
        }
        // delete any objects stored by clazz under same name
        for (let clazz in this._itemsByClazz) {
            delete this._itemsByClazz[clazz][itemName];
        }
        return theItem;
    }

    /**
     * @returns {number} the # of items in the data store
     */
    getItemsCount() {
        return (Object.keys(this._items).length);
    }

    /**
     * @returns {string[]} array of existing item names / ids
     */
    getItemNames() {
        return (Object.keys(this._items));
    }

    /**
     * Find an item by name
     *
     * @param {string} name the name used to save the item
     * @returns {object} the item, or null if it doesn't exist
     */
    getItemByName(name) {
        return this._items[DataStore.cleanName(name)];
    }

    /**
     * Get an array containing all items stored under a single category
     *
     * @param {string} category
     * @returns {Object[]} an array of the items, or an empty array if there are none
     */
    getItemsInCategory(category) {
        let legalCategory = DataStore.cleanName(category);
        let ret = [];
        if (hasProperty(this._itemsByCategory, legalCategory)) {
            let catList = this._itemsByCategory[legalCategory];
            for (let name in catList) {
                ret.push(catList[name]);
            }
        }
        return ret;
    }

    /**
     * Get a list of objects with a given constructor name
     *
     * @param {string} clazz the constructor name of the objects desired
     * @returns an Array of objects with constructor.name == clazz,
     * or an empty Array if none found
     * @throws Illegal argument Error if clazz is not string
     */
    getItemsOfClazz(clazz) {
        if (!isString(clazz) || clazz == '') {
            throw new Error("Class name (clazz) must be a string.");
        }
        let ret = [];
        if (hasProperty(this._itemsByClazz, clazz)) {
            let clazzList = this._itemsByClazz[clazz];
            if (clazzList !== undefined) {
                for (let name in clazzList) {
                    ret.push(clazzList[name]);
                }
            }
        }
        return ret;
    }

    /**
     * cleanName( name )
     * Returns a trimmed string
     * @param {string} name the original property name
     * @return {string} the name, cleaned-up
     * @throws {Error} if the string is invalid (null, undefined or '')
     */
    static cleanName(name) {
        if (!isString(name) || name == null || name == undefined || name == '') {
            throw new Error("Illegal Argument - name must be a valid string.");
        }
        return name.trim();
    }

    /**
     * Get the name of the clazz for this object, similar to Class in Java.  
     * 
     * @param {*} obj
     * @returns {string} the name of the _clazz
     */
    static getClazzName(obj) {
        if (obj && obj._clazz) {
            return obj._clazz;
        } else if (obj && obj.constructor) {
            return obj.constructor.name;
        } else if (obj && obj.prototype && obj.prototype.constructor) {
            return obj.prototype.constructor.name;
        }
        return undefined;
    }
}









