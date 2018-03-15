"use strict";
/**
 * Holder for tranlation content and locale
 */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TranslatorContext = /** @class */ (function () {
    function TranslatorContext() {
    }
    TranslatorContext.registerTranslations = function (locale, translation) {
        this.context.translations = __assign({}, this.context.translations, (_a = {}, _a[locale] = translation, _a));
        var _a;
    };
    TranslatorContext.setDefaultLocale = function (locale) {
        this.context.defaultLocale = locale;
    };
    TranslatorContext.setMissingTranslationMsg = function (msg) {
        this.context.missingTranslationMsg = msg;
    };
    TranslatorContext.setRenderInnerTextForMissingKeys = function (flag) {
        this.context.renderInnerTextForMissingKeys = flag;
    };
    TranslatorContext.setLocale = function (locale) {
        this.context.previousLocale = this.context.locale;
        this.context.locale = locale || this.context.defaultLocale;
    };
    TranslatorContext.context = {
        previousLocale: null,
        defaultLocale: null,
        locale: null,
        translations: {},
        renderInnerTextForMissingKeys: true,
        missingTranslationMsg: 'translation-not-found'
    };
    return TranslatorContext;
}());
exports.default = TranslatorContext;
//# sourceMappingURL=translator-context.js.map