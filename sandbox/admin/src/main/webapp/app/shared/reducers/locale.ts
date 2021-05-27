import axios from 'axios';
import dayjs from 'dayjs';

import { TranslatorContext } from 'react-jhipster';

export const ACTION_TYPES = {
  SET_LOCALE: 'locale/SET_LOCALE',
};

const initialState = {
  currentLocale: '',
};

export type LocaleState = Readonly<typeof initialState>;

export default (state: LocaleState = initialState, action): LocaleState => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOCALE: {
      const currentLocale = action.locale;
      if (state.currentLocale !== currentLocale) {
        dayjs.locale(currentLocale);
        TranslatorContext.setLocale(currentLocale);
      }
      return {
        currentLocale,
      };
    }
    default:
      return state;
  }
};

export const setLocale: (locale: string) => void = locale => async dispatch => {
  if (!Object.keys(TranslatorContext.context.translations).includes(locale)) {
    const response = await axios.get(`i18n/${locale}.json?buildTimestamp=${process.env.BUILD_TIMESTAMP}`, { baseURL: '' });
    TranslatorContext.registerTranslations(locale, response.data);
  }
  dispatch({
    type: ACTION_TYPES.SET_LOCALE,
    locale,
  });
};
