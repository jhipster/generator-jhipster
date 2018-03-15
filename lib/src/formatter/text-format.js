"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var numeral = require("numeral");
var moment = require("moment");
/**
 * Formats the given value to specified type like date or number.
 * @param value value to be formatted
 * @param type type of formatting to use ${ITextFormatTypes}
 * @param format optional format to use.
 *    For date type momentJs(http://momentjs.com/docs/#/displaying) format is used
 *    For number type NumeralJS (http://numeraljs.com/#format) format is used
 * @param blankOnInvalid optional to output error or blank on null/invalid values
 */
exports.TextFormat = function (_a) {
    var value = _a.value, type = _a.type, format = _a.format, blankOnInvalid = _a.blankOnInvalid;
    if (blankOnInvalid) {
        if (!value || !type)
            return null;
    }
    if (type === 'date') {
        return React.createElement("span", null, moment(value).format(format));
    }
    else if (type === 'number') {
        return React.createElement("span", null, numeral(value).format(format));
    }
    return React.createElement("span", null, value);
};
//# sourceMappingURL=text-format.js.map