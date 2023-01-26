/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Converts xx-yy to xx_yy.
 * @param language
 * @returns
 */
export function languageSnakeCase(language) {
  return language.replace(/-/g, '_');
}

/**
 * Converts language country to upper case.
 * @example
 * // returns xx-YY
 * languageUpperCaseCountry('xx-yy');
 * @example
 * // returns xx-Latn-YY
 * languageUpperCaseCountry('xx-Latn-yy');
 * @example
 * // returns xx-Latn-YY-modifier
 * languageUpperCaseCountry('xx-Latn-yy-modifier');
 * @param language
 * @returns
 */
function languageUpperCaseCountry(language) {
  const split = splitLanguageTag(language);
  split.country = split.country ? split.country.toUpperCase() : split.country;
  return buildLanguageTag(split);
}

/**
 * Convert a language tag to java locale tag.
 * @param language
 * @returns
 */
export function languageToJavaLanguage(language) {
  return languageSnakeCase(languageUpperCaseCountry(language));
}

const languageToFakerjsLanguage = (languageTag: string): string => {
  return languageUpperCaseCountry(languageTag);
};

const languageToAngularLanguage = (languageTag: string): string => {
  return languageUpperCaseCountry(languageTag);
};

const languageToDayjsLanguage = (languageTag: string): string => {
  const split = splitLanguageTag(languageTag);
  split.script = split.script ? split.script.toLowerCase() : split.script;
  return buildLanguageTag(split);
};

type specificLocales =
  /**
   * Locale id fallback for java.
   * Tags can be found at [Java 17 locales tags](https://www.oracle.com/java/technologies/javase/jdk17-suported-locales.html#modules)
   */
  | 'javaLocaleMessageSourceSuffix'
  /**
   * Locale id fallback for angular.
   * Tags can be found at https://www.npmjs.com/package/@angular/common?activeTab=explore
   */
  | 'angularLocale'
  /**
   * Locale id fallback for [dayjs](https://github.com/iamkun/dayjs).
   * Tags can be found at https://www.npmjs.com/package/dayjs?activeTab=explore
   */
  | 'dayjsLocale'
  /**
   * Locale for fakerjs.
   * Available locales can be found at https://github.com/faker-js/faker/tree/next/src/locales
   */
  | 'fakerjsLocale';

type BaseLanguage = {
  /**
   * BCP 47 formatted language tag.
   */
  readonly languageTag: string;
  /**
   * English name.
   */
  readonly name: string;
  /**
   * Language name in the original language.
   */
  readonly displayName: string;
  /**
   * Language is right-to-left.
   */
  readonly rtl: boolean;
};

export type Language = BaseLanguage & Readonly<Record<specificLocales, string | null>>;

type PartialLanguage = Omit<BaseLanguage, 'rtl'> &
  Partial<Pick<BaseLanguage, 'rtl'>> &
  Partial<Readonly<Record<specificLocales, string | null>>>;

/**
 * Languages specifications, defaults will be applied to build the supportedLanguages
 */
const partialLanguages: PartialLanguage[] = [
  {
    name: 'Albanian',
    displayName: 'Shqip',
    languageTag: 'al',
    dayjsLocale: 'sq',
    angularLocale: 'sq',
  },
  {
    name: 'Arabic (Libya)',
    displayName: 'العربية',
    languageTag: 'ar-ly',
    rtl: true,
  },
  {
    name: 'Armenian',
    displayName: 'Հայերեն',
    languageTag: 'hy',
    dayjsLocale: 'hy-am',
  },
  {
    name: 'Belarusian',
    displayName: 'Беларускі',
    languageTag: 'by',
    dayjsLocale: 'be',
    angularLocale: 'be',
  },
  {
    name: 'Bengali',
    displayName: 'বাংলা',
    languageTag: 'bn',
    dayjsLocale: 'bn',
  },
  { name: 'Bulgarian', displayName: 'Български', languageTag: 'bg' },
  {
    name: 'Catalan',
    displayName: 'Català',
    languageTag: 'ca',
  },
  {
    name: 'Chinese (Simplified)',
    displayName: '中文（简体）',
    languageTag: 'zh-cn',
    angularLocale: 'zh-Hans',
  },
  {
    name: 'Chinese (Traditional)',
    displayName: '繁體中文',
    languageTag: 'zh-tw',
    angularLocale: 'zh-Hant',
  },
  { name: 'Croatian', displayName: 'Hrvatski', languageTag: 'hr' },
  { name: 'Czech', displayName: 'Český', languageTag: 'cs' },
  { name: 'Danish', displayName: 'Dansk', languageTag: 'da' },
  { name: 'Dutch', displayName: 'Nederlands', languageTag: 'nl' },
  { name: 'English', displayName: 'English', languageTag: 'en' },
  { name: 'Estonian', displayName: 'Eesti', languageTag: 'et' },
  {
    name: 'Farsi',
    displayName: 'فارسی',
    languageTag: 'fa',
    rtl: true,
  },
  { name: 'Finnish', displayName: 'Suomi', languageTag: 'fi' },
  { name: 'French', displayName: 'Français', languageTag: 'fr' },
  { name: 'Galician', displayName: 'Galego', languageTag: 'gl' },
  { name: 'German', displayName: 'Deutsch', languageTag: 'de' },
  { name: 'Greek', displayName: 'Ελληνικά', languageTag: 'el' },
  { name: 'Hindi', displayName: 'हिंदी', languageTag: 'hi' },
  { name: 'Hungarian', displayName: 'Magyar', languageTag: 'hu' },
  { name: 'Indonesian', displayName: 'Bahasa Indonesia', languageTag: 'id' },
  { name: 'Italian', displayName: 'Italiano', languageTag: 'it' },
  { name: 'Japanese', displayName: '日本語', languageTag: 'ja' },
  { name: 'Korean', displayName: '한국어', languageTag: 'ko' },
  { name: 'Marathi', displayName: 'मराठी', languageTag: 'mr' },
  { name: 'Myanmar', displayName: 'မြန်မာ', languageTag: 'my' },
  { name: 'Polish', displayName: 'Polski', languageTag: 'pl' },
  {
    name: 'Portuguese (Brazilian)',
    displayName: 'Português (Brasil)',
    languageTag: 'pt-br',
    angularLocale: 'pt',
  },
  {
    name: 'Portuguese',
    displayName: 'Português',
    languageTag: 'pt-pt',
    dayjsLocale: 'pt',
  },
  {
    name: 'Punjabi',
    displayName: 'ਪੰਜਾਬੀ',
    languageTag: 'pa',
    dayjsLocale: 'pa-in',
  },
  { name: 'Romanian', displayName: 'Română', languageTag: 'ro' },
  { name: 'Russian', displayName: 'Русский', languageTag: 'ru' },
  { name: 'Slovak', displayName: 'Slovenský', languageTag: 'sk' },
  { name: 'Serbian', displayName: 'Srpski', languageTag: 'sr' },
  { name: 'Sinhala', displayName: 'සිංහල', languageTag: 'si' },
  { name: 'Spanish', displayName: 'Español', languageTag: 'es' },
  { name: 'Swedish', displayName: 'Svenska', languageTag: 'sv' },
  { name: 'Turkish', displayName: 'Türkçe', languageTag: 'tr' },
  { name: 'Tamil', displayName: 'தமிழ்', languageTag: 'ta' },
  { name: 'Telugu', displayName: 'తెలుగు', languageTag: 'te' },
  { name: 'Thai', displayName: 'ไทย', languageTag: 'th' },
  {
    name: 'Ukrainian',
    displayName: 'Українська',
    languageTag: 'ua',
    angularLocale: 'uk',
    dayjsLocale: 'uk',
  },
  {
    name: 'Uzbek (Cyrillic)',
    displayName: 'Ўзбекча',
    languageTag: 'uz-Cyrl-uz',
    angularLocale: 'uz-Cyrl',
    dayjsLocale: 'uz',
  },
  {
    name: 'Uzbek (Latin)',
    displayName: 'O`zbekcha',
    languageTag: 'uz-Latn-uz',
    angularLocale: 'uz-Latn',
    dayjsLocale: 'uz-latn',
  },
  { name: 'Vietnamese', displayName: 'Tiếng Việt', languageTag: 'vi' },
];

export const supportedLanguages: ReadonlyArray<Language> = partialLanguages.map(language => ({
  rtl: false,
  javaLocaleMessageSourceSuffix: languageToJavaLanguage(language.languageTag),
  angularLocale: languageToAngularLanguage(language.languageTag),
  dayjsLocale: languageToDayjsLanguage(language.languageTag),
  fakerjsLocale: languageToFakerjsLanguage(language.languageTag),
  ...language,
}));

export const findLanguageForTag = (languageTag: string, languages: ReadonlyArray<Language> = supportedLanguages): Language | undefined =>
  languages.find(lang => lang.languageTag === languageTag);

export const defaultLanguage = findLanguageForTag('en')!;

/**
 * Generate language objects in array of "'en': { name: 'English' }" format
 * @param languages
 */
export const generateLanguagesWebappOptions = (languages: ReadonlyArray<Language>) =>
  languages.map(language => `'${language.languageTag}': { name: '${language.displayName}'${language.rtl ? ', rtl: true' : ''} }`);

type LanguageIdParts = { language: string; script?: string; country?: string; variant?: string };

/**
 * Split a language tag.
 * @param languageTag
 * @returns
 */
function splitLanguageTag(languageTag: string): LanguageIdParts {
  const [language, ...split] = languageTag.split('-');
  if (split.length === 0) {
    return { language };
  }
  let script: string | undefined;
  if (split[0].length > 2) {
    script = split.shift();
  }
  const country = split.shift();
  const variant = split.shift();
  return { language, script, country, variant };
}

/**
 * Build a language tag.
 * @param parts
 * @returns
 */
function buildLanguageTag(parts: LanguageIdParts): string {
  const { language, script, country, variant } = parts;
  let languageTag = language;
  if (script) {
    languageTag = languageTag.concat('-', script);
  }
  if (country) {
    languageTag = languageTag.concat('-', country);
  }
  if (variant) {
    languageTag = languageTag.concat('-', variant);
  }
  return languageTag;
}

export function languagesAsChoices(languages: ReadonlyArray<Language> = supportedLanguages) {
  return languages.map(language => ({ value: language.languageTag, name: language.name }));
}
