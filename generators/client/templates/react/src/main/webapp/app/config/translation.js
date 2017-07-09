import counterpart from 'counterpart';
import { setLocale } from '../reducers/locale';

const mergeTranslations = (requireContext) => {
  const merged = {};
  requireContext.keys().forEach((key) => {
    Object.assign(merged, requireContext(key));
  });
  return merged;
};

/* eslint-disable */
const translations = {
<%_ languages.forEach((lang, index) => { _%>
  <%= lang %>: mergeTranslations(require.context('i18n/<%= lang %>', false, /.json$/))<%= index !== languages.length - 1 ? ',' : '' %>
<%_ }); _%>
};
/* eslint-enable */

let currentLocale;
const savedLocale = localStorage.getItem('locale') || '<%= nativeLanguage %>';

export const locales = Object.keys(translations);

export const registerLocales = (store) => {
  locales.forEach((key) => {
    counterpart.registerTranslations(key, translations[key]);
  });
  store.subscribe(() => {
    const previousLocale = currentLocale;
    currentLocale = store.getState().locale.currentLocale;
    if (previousLocale !== currentLocale) {
      localStorage.setItem('locale', currentLocale);
      counterpart.setLocale(currentLocale);
    }
  });
  store.dispatch(setLocale(savedLocale));
  return savedLocale;
};
