/**
 * Fetch the specified element by id or return default
 * @param id id of element
 */
export const containerSize = (id = 'app-view-container') => document.getElementById(id) || { offsetHeight: 960, offsetWidth: 960 };

/**
 * Fetch the current window size
 */
export const windowSize = () => ({ width: window.innerWidth, height: window.innerHeight });

/**
 * Get the current browser locale
 */
export const browserLocale = (): string => {
  let lang;

  const nav: any = navigator;
  // tslint:disable-next-line
  if (nav.languages && nav.languages.length) {
    // latest versions of Chrome and Firefox set this correctly
    lang = nav.languages[0];
  } else if (nav.userLanguage) {
    // IE only
    lang = nav.userLanguage;
  } else {
    // latest versions of Chrome, Firefox, and Safari set this correctly
    lang = nav.language;
  }
  return lang;
};
