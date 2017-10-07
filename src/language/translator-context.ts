/**
 * Holder for tranlation content and locale
 */
class TranslatorContext {
  static context = {
    previousLocale: null,
    defaultLocale: null,
    locale: null,
    translations: {},
    missingTranslationMsg: 'translation-not-found'
  };
  static registerTranslations(locale: string, translation: any) {
    this.context.translations = {
      ...this.context.translations,
      [locale]: translation
    };
  }
  static setDefaultLocale(locale: string): any {
    this.context.defaultLocale = locale;
  }

  static setMissingTranslationMsg(msg: string): any {
    this.context.missingTranslationMsg = msg;
  }
  static setLocale(locale: string): any {
    this.context.previousLocale = this.context.locale;
    this.context.locale = locale || this.context.defaultLocale;
  }
}

export default TranslatorContext;
