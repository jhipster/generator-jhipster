"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var initLevels = function () {
    if (process.env.LOG_LEVEL)
        return process.env.LOG_LEVEL;
    return process.env.NODE_ENV === 'development' ? 'info' : 'error';
};
var level = initLevels();
/**
 * Log a debug message when debug level or above is enabled
 * @param msg message
 * @param data data
 */
exports.logDebug = function (msg) {
    var data = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        data[_i - 1] = arguments[_i];
    }
    // tslint:disable-next-line
    if (level === 'debug')
        console.debug(msg, data);
};
/**
 * Log an info message when info level or above is enabled
 * @param msg message
 * @param data data
 */
exports.logInfo = function (msg) {
    var data = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        data[_i - 1] = arguments[_i];
    }
    // tslint:disable-next-line
    if (['debug', 'info'].includes(level))
        console.info(msg, data);
};
/**
 * Log a warn message when warn level or above is enabled
 * @param msg message
 * @param data data
 */
exports.logWarn = function (msg) {
    var data = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        data[_i - 1] = arguments[_i];
    }
    if (['debug', 'info', 'warn'].includes(level))
        console.warn(msg, data);
};
/**
 * Log an error message when error level is enabled
 * @param msg message
 * @param data data
 */
exports.logError = function (msg) {
    var data = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        data[_i - 1] = arguments[_i];
    }
    if (['debug', 'info', 'warn', 'error'].includes(level))
        console.error(msg, data);
};
exports.log = exports.logInfo;
//# sourceMappingURL=log-util.js.map