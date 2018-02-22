import axios from 'axios';
import { ICrudPutAction } from 'react-jhipster';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';
import { messages } from '../config/constants';

export const ACTION_TYPES = {
  UPDATE_ACCOUNT: 'account/UPDATE_ACCOUNT',
  UPDATE_PASSWORD: 'account/UPDATE_PASSWORD'
};

const initialState = {
  loading: false,
  errorMessage: null,
  account: {},
  updateSuccess: false
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
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
    case FAILURE(ACTION_TYPES.UPDATE_ACCOUNT):
    case SUCCESS(ACTION_TYPES.UPDATE_ACCOUNT):
      return {
        ...state,
        loading: false,
        updateSuccess: true,
        account: action.payload.data
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
  payload: axios.post(`${apiUrl}/change-password`, password)
});
