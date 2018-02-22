import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';

export const ACTION_TYPES = {
  ACTIVATE_ACCOUNT: 'register/ACTIVATE_ACCOUNT',
  RESET: 'reset'
};

const initialState = {
  activationSuccess: false,
  activationFailure: false
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.ACTIVATE_ACCOUNT):
      return {
        ...state
      };
    case FAILURE(ACTION_TYPES.ACTIVATE_ACCOUNT):
      return {
        ...state,
        activationFailure: true
      };
    case SUCCESS(ACTION_TYPES.ACTIVATE_ACCOUNT):
      return {
        ...state,
        activationSuccess: true
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

// Actions
export const reset = () => dispatch => {
  dispatch({
    type: ACTION_TYPES.RESET
  });
};

export const activateAction = key => dispatch => {
  dispatch({
    type: ACTION_TYPES.ACTIVATE_ACCOUNT,
    payload: axios.get('/api/activate?key=' + key)
  });
};
