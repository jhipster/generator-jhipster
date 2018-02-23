import axios from 'axios';
import { ICrudPutAction } from 'react-jhipster';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';

export const ACTION_TYPES = {
  UPDATE_ACCOUNT: 'account/UPDATE_ACCOUNT',
  UPDATE_PASSWORD: 'account/UPDATE_PASSWORD',
  RESET: 'account/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  account: {},
  updatePasswordSuccess: false,
  updatePasswordFailure: false
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.UPDATE_ACCOUNT):
      return {
        ...state,
        errorMessage: null,
        updatePasswordSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.UPDATE_PASSWORD):
      return {
        ...initialState,
        errorMessage: null,
        updatePasswordSuccess: false,
        loading: true
      };
    case FAILURE(ACTION_TYPES.UPDATE_ACCOUNT):
    case SUCCESS(ACTION_TYPES.UPDATE_ACCOUNT):
      return {
        ...state,
        loading: false,
        account: action.payload.data
      };
    case FAILURE(ACTION_TYPES.UPDATE_PASSWORD):
      return {
        ...initialState,
        loading: false,
        updatePasswordSuccess: false,
        updatePasswordFailure: true
      };
    case SUCCESS(ACTION_TYPES.UPDATE_PASSWORD):
      return {
        ...initialState,
        loading: false,
        updatePasswordSuccess: true,
        updatePasswordFailure: false
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const apiUrl = '/api/account';
// Actions
export const saveAccountSettings: ICrudPutAction = account => ({
  type: ACTION_TYPES.UPDATE_ACCOUNT,
  payload: axios.post(apiUrl, account)
});

export const savePassword: ICrudPutAction = (currentPassword, newPassword) => dispatch => {
  dispatch({
    type: ACTION_TYPES.UPDATE_PASSWORD,
    payload: axios.post(`${apiUrl}/change-password`, { currentPassword, newPassword })
  });
};

export const reset = () => dispatch => {
  dispatch({
    type: ACTION_TYPES.RESET
  });
};
