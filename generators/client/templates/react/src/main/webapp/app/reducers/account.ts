import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';
import { messages } from '../config/constants';
import { ICrudPutAction } from '../shared/model/redux-action.type';

export const ACTION_TYPES = {
  CREATE_PROPERTY: 'systemProperty/CREATE_PROJECT',
  UPDATE_ACCOUNT: 'systemProperty/UPDATE_ACCOUNT',
  UPDATE_PASSWORD: 'systemProperty/UPDATE_PASSWORD'
};

const initialState = {
  loading: false,
  errorMessage: null,
  systemPropertiesByKey: {},
  systemProperty: {},
  updateSuccess: false
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CREATE_PROPERTY):
    case REQUEST(ACTION_TYPES.UPDATE_ACCOUNT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.UPDATE_PASSWORD):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CREATE_PROPERTY):
    case FAILURE(ACTION_TYPES.UPDATE_ACCOUNT):
    case SUCCESS(ACTION_TYPES.CREATE_PROPERTY):
    case SUCCESS(ACTION_TYPES.UPDATE_ACCOUNT):
      return {
        ...state,
        loading: false,
        updateSuccess: true,
        systemProperty: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.UPDATE_PASSWORD):
      return {
        ...state,
        loading: false,
        updateSuccess: true
      };
    default:
      return state;
  }
};

const apiUrl = '/api/account';
// Actions
export const saveAccountSettings: ICrudPutAction = account => ({
  type: ACTION_TYPES.UPDATE_ACCOUNT,
  meta: {
    successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
    errorMessage: messages.DATA_UPDATE_ERROR_ALERT
  },
  payload: axios.post(apiUrl, account)
});

export const savePassword: ICrudPutAction = password => ({
  type: ACTION_TYPES.UPDATE_PASSWORD,
  meta: {
    successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
    errorMessage: messages.DATA_UPDATE_ERROR_ALERT
  },
  payload: axios.post(`${apiUrl}/change_password`, password)
});
