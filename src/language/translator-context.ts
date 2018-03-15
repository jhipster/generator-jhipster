/**
 * Holder for tranlation content and locale
 */

class TranslatorContext {
  static context = {
    previousLocale: null,
    defaultLocale: null,
    locale: null,
    translations: {},
    renderInnerTextForMissingKeys: true,
    missingTranslationMsg: 'translation-not-found'
  };
  static registerTranslations(locale: string, translation: any) {
    this.context.translations = {
      ...this.context.translations,
      [locale]: translation
    };
  }
  static setDefaultLocale(locale: string) {
    this.context.defaultLocale = locale;
  }

  static setMissingTranslationMsg(msg: string) {
    this.context.missingTranslationMsg = msg;
  }

  static setRenderInnerTextForMissingKeys(flag: boolean) {
    this.context.renderInnerTextForMissingKeys = flag;
  }
  static setLocale(locale: string) {
    this.context.previousLocale = this.context.locale;
    this.context.locale = locale || this.context.defaultLocale;
  }
}

export default TranslatorContext;
