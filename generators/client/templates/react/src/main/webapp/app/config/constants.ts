const config = {
  VERSION: process.env.VERSION,
  SERVER_API_URL: process.env.SERVER_API_URL
};

export default config;

export const SERVER_API_URL = '';

export const messages = {
  DATA_CREATE_SUCCESS_ALERT: 'Data created successfully!',
  DATA_DELETE_SUCCESS_ALERT: 'Data deleted successfully!',
  DATA_UPDATE_ERROR_ALERT: 'Data deleted successfully!'
};

export const APP_DATE_FORMAT = 'DD/MM/YY HH:mm';
export const APP_LOCAL_DATE_FORMAT = 'DD/MM/YYYY';
export const APP_LOCAL_DATETIME_FORMAT = 'YYYY-M-DTh:mm';
export const APP_WHOLE_NUMBER_FORMAT = '0,0';
export const APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT = '0,0.[00]';
