export type LanguageSourceType = {
  /**
   * Add a new entity in the "global.json" translations.
   * @param args
   */
  addEntityTranslationKey?(args: { translationKey: string; translationValue: string; language: string }): void;
};
