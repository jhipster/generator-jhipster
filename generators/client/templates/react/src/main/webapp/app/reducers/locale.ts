export const ACTION_TYPES = {
  SET_LOCALE: 'locale/SET_LOCALE'
};

export default (state = { currentLocale: 'en' }, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOCALE:
      return {
        currentLocale: action.locale
      };
    default:
      return state;
  }
};

export const setLocale = locale => ({
  type: ACTION_TYPES.SET_LOCALE,
  locale
});
