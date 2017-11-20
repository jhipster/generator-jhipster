/* global: require*/
import { TranslatorContext } from 'react-jhipster';

import { setLocale } from '../reducers/locale';
import Storage from '../shared/util/storage-util';

const mergeTranslations = requireContext => requireContext.keys().reduce(
  (merged, key) => ({ ...merged, ...requireContext(key) }),
  {}
);

// tslint:disable:object-literal-key-quotes
const translations = {
<%_ languages.forEach((lang, index) => { _%>
   '<%= lang %>': mergeTranslations(require.context('../../i18n/<%= lang %>', false, /.json$/))<%= index !== languages.length - 1 ? ',' : '' %>
<%_ }); _%>
};
// tslint:enable

let currentLocale;
const savedLocale = Storage.local.get('locale', 'en');
TranslatorContext.setDefaultLocale('en');
TranslatorContext.setRenderInnerTextForMissingKeys(false);

export const locales = Object.keys(translations);

export const registerLocales = store => {
  locales.forEach(key => {
    TranslatorContext.registerTranslations(key, translations[key]);
  });
  store.subscribe(() => {
    const previousLocale = currentLocale;
    currentLocale = store.getState().locale.currentLocale;
    if (previousLocale !== currentLocale) {
      Storage.local.set('locale', currentLocale);
      TranslatorContext.setLocale(currentLocale);
    }
  });
  store.dispatch(setLocale(savedLocale));
  return savedLocale;
};
