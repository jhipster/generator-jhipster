"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get either localStorage or sessionStorage
 * @param type storage type
 */
exports.getStorage = function (type) {
    if (type === 0 /* SESSION */) {
        return window.sessionStorage;
    }
    return window.localStorage;
};
/**
 * Set an item into storage
 * @param type storage type
 * @param key key to set
 * @param value value to set
 */
var setItem = function (type) { return function (key, value) {
    exports.getStorage(type).setItem(key, JSON.stringify(value));
}; };
/**
 * Get an item from storage
 * @param type storage type
 * @param key key to get
 * @param defaultVal value to return if key doesnt exist
 */
var getItem = function (type) { return function (key, defaultVal) {
    var val = exports.getStorage(type).getItem(key);
    if (!val || val === 'undefined')
        return defaultVal;
    try {
        return JSON.parse(val);
    }
    catch (e) {
        return val;
    }
}; };
/**
 * Remove item from storage
 * @param type storage type
 * @param key key to remove
 */
var removeItem = function (type) { return function (key) {
    exports.getStorage(type).removeItem(key);
}; };
exports.Storage = {
    session: {
        get: getItem(0 /* SESSION */),
        set: setItem(0 /* SESSION */),
        remove: removeItem(0 /* SESSION */)
    },
    local: {
        get: getItem(1 /* LOCAL */),
        set: setItem(1 /* LOCAL */),
        remove: removeItem(1 /* LOCAL */)
    }
};
//# sourceMappingURL=storage-util.js.map