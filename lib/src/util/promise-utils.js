"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check if the passed object is a promise
 * @param value the object to check
 */
exports.isPromise = function (value) {
    if (value !== null && typeof value === 'object') {
        return value && typeof value.then === 'function';
    }
    return false;
};
//# sourceMappingURL=promise-utils.js.map