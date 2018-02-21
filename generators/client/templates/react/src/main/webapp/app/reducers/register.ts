import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';

export const ACTION_TYPES = {
  CREATE_ACCOUNT: 'register/CREATE_ACCOUNT',
  RESET: 'register/RESET'
};

const initialState = {
  registrationSuccess: false,
  registrationFailure: false,
  errorMessage: null
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CREATE_ACCOUNT):
      return {
        ...state
      };
    case FAILURE(ACTION_TYPES.CREATE_ACCOUNT):
      return {
        ...state,
        registrationFailure: true,
        errorMessage: action.payload.response.data.errorKey
      };
    case SUCCESS(ACTION_TYPES.CREATE_ACCOUNT):
      return {
        ...state,
        registrationSuccess: true
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export const reset = () => dispatch => {
  dispatch({
    type: ACTION_TYPES.RESET
  });
};

// Action
export const register = (login, email, password) => dispatch => {
  dispatch({
    type: ACTION_TYPES.CREATE_ACCOUNT,
    payload: axios.post('/api/register', { login, email, password })
  });
};
