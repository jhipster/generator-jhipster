"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var lodash_1 = require("lodash");
var sanitizeHtml = require("sanitize-html");
var translator_context_1 = require("./translator-context");
var REACT_ELEMENT = Symbol.for('react.element');
var isFlattenable = function (value) {
    var type = typeof value;
    return type === 'string' || type === 'number';
};
var flatten = function (array) {
    if (array.every(isFlattenable)) {
        return array.join('');
    }
    return array;
};
var toTemplate = function (string) {
    var expressionRe = /{{\s?\w+\s?}}/g;
    var match = string.match(expressionRe) || [];
    return [string.split(expressionRe)].concat(match);
};
var normalizeValue = function (value, key) {
    if (value == null || ['boolean', 'string', 'number'].includes(typeof value)) {
        return value;
    }
    if (value.$$typeof === REACT_ELEMENT) {
        return React.cloneElement(value, { key: key });
    }
};
/**
 * Adapted from https://github.com/bloodyowl/react-translate
 * licenced under The MIT License (MIT) Copyright (c) 2014 Matthias Le Brun
 */
var render = function (string, values) {
    if (!values || !string)
        return string;
    var _a = toTemplate(string), parts = _a[0], expressions = _a.slice(1);
    return flatten(parts.reduce(function (acc, item, index, array) {
        if (index === array.length - 1) {
            return acc.concat([item]);
        }
        var match = expressions[index] && expressions[index].match(/{{\s?(\w+)\s?}}/);
        var value = match != null ? values[match[1]] : null;
        return acc.concat([item, normalizeValue(value, index)]);
    }, []));
};
/**
 * A dirty find to split non standard keys and find data from json
 * @param obj json object
 * @param path path to find
 * @param placeholder is placeholder
 */
var deepFindDirty = function (obj, path, placeholder) {
    var paths = path.split('.');
    var current = obj;
    if (placeholder) {
        // dirty fix for placeholders, the json files needs to be corrected
        paths[paths.length - 2] = paths[paths.length - 2] + "." + paths[paths.length - 1];
        paths.pop();
    }
    // tslint:disable-next-line:prefer-for-of
    for (var i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
            return undefined;
        }
        current = current[paths[i]];
    }
    return current;
};
var showMissingOrDefault = function (key, children) {
    var renderInnerTextForMissingKeys = translator_context_1.default.context.renderInnerTextForMissingKeys;
    if (renderInnerTextForMissingKeys && children && typeof children === 'string') {
        return children;
    }
    return translator_context_1.default.context.missingTranslationMsg + "[" + key + "]";
};
var doTranslate = function (key, interpolate, children) {
    var translationData = translator_context_1.default.context.translations;
    var currentLocale = translator_context_1.default.context.locale || translator_context_1.default.context.defaultLocale;
    var data = translationData[currentLocale];
    var preRender = data ? lodash_1.get(data, key) || deepFindDirty(data, key, true) : null;
    var preSanitize = render(preRender, interpolate) || showMissingOrDefault(key, children);
    if (/<[a-z][\s\S]*>/i.test(preSanitize)) {
        // String contains HTML tags. Allow only a super restricted set of tags and attributes
        var content = sanitizeHtml(preSanitize, {
            allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br', 'hr'],
            allowedAttributes: {
                a: ['href', 'target']
            }
        });
        return {
            content: content,
            html: true
        };
    }
    return {
        content: preSanitize,
        html: false
    };
};
/**
 * Translates the given key using provided i18n values
 */
var Translate = /** @class */ (function (_super) {
    __extends(Translate, _super);
    function Translate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Translate.prototype.shouldComponentUpdate = function () {
        var currentLocale = translator_context_1.default.context.locale || translator_context_1.default.context.defaultLocale;
        var prevLocale = translator_context_1.default.context.previousLocale;
        return currentLocale !== prevLocale;
    };
    Translate.prototype.render = function () {
        var _a = this.props, contentKey = _a.contentKey, interpolate = _a.interpolate, component = _a.component, children = _a.children;
        var processed = doTranslate(contentKey, interpolate, children);
        if (processed.html) {
            return React.createElement(component, { dangerouslySetInnerHTML: { __html: processed.content } });
        }
        return React.createElement(component, null, processed.content);
    };
    Translate.defaultProps = {
        component: 'span'
    };
    return Translate;
}(React.Component));
exports.translate = function (contentKey, interpolate, children) {
    return doTranslate(contentKey, interpolate, children).content;
};
exports.default = Translate;
//# sourceMappingURL=translate.js.map