
export const containerSize = () => document.getElementById('app-view-container') || { offsetHeight: 960, offsetWidth: 960 };
export const windowSize = () => ({ width: window.innerWidth, height: window.innerHeight });
export const browserLocale = () => {
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
