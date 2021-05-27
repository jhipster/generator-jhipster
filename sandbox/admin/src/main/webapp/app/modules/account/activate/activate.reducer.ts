import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  ACTIVATE_ACCOUNT: 'activate/ACTIVATE_ACCOUNT',
  RESET: 'activate/RESET',
};

const initialState = {
  activationSuccess: false,
  activationFailure: false,
};

export type ActivateState = Readonly<typeof initialState>;

// Reducer
export default (state: ActivateState = initialState, action): ActivateState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.ACTIVATE_ACCOUNT):
      return {
        ...state,
      };
    case FAILURE(ACTION_TYPES.ACTIVATE_ACCOUNT):
      return {
        ...state,
        activationFailure: true,
      };
    case SUCCESS(ACTION_TYPES.ACTIVATE_ACCOUNT):
      return {
        ...state,
        activationSuccess: true,
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

// Actions
export const activateAction = key => ({
  type: ACTION_TYPES.ACTIVATE_ACCOUNT,
  payload: axios.get('api/activate?key=' + key),
});

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
