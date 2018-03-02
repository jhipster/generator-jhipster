"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Fetch the specified element by id or return default
 * @param id id of element
 */
exports.containerSize = function (id) {
    if (id === void 0) { id = 'app-view-container'; }
    return document.getElementById(id) || { offsetHeight: 960, offsetWidth: 960 };
};
/**
 * Fetch the current window size
 */
exports.windowSize = function () { return ({ width: window.innerWidth, height: window.innerHeight }); };
/**
 * Get the current browser locale
 */
exports.browserLocale = function () {
    var lang;
    var nav = navigator;
    // tslint:disable-next-line
    if (nav.languages && nav.languages.length) {
        // latest versions of Chrome and Firefox set this correctly
        lang = nav.languages[0];
    }
    else if (nav.userLanguage) {
        // IE only
        lang = nav.userLanguage;
    }
    else {
        // latest versions of Chrome, Firefox, and Safari set this correctly
        lang = nav.language;
    }
    return lang;
};
//# sourceMappingURL=dom-utils.js.map