import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  FIND_ALL: 'sessions/FIND_ALL',
  INVALIDATE: 'sessions/INVALIDATE'
};

const initialState = {
  loading: false,
  sessions: [],
  updateSuccess: false,
  updateFailure: false
};

// Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FIND_ALL):
    case REQUEST(ACTION_TYPES.INVALIDATE):
      return {
        ...state,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FIND_ALL):
      return {
        ...state,
        loading: false
      };
    case FAILURE(ACTION_TYPES.INVALIDATE):
      return {
        ...state,
        loading: false,
        updateFailure: true
      };
    case SUCCESS(ACTION_TYPES.FIND_ALL):
      return {
        ...state,
        loading: false,
        sessions: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.INVALIDATE):
      return {
        ...state,
        loading: false,
        updateSuccess: true
      };

    default:
      return state;
  }
};

// Actions
const apiURL = '/api/account/sessions/';
export const findAll = () => ({
  type: ACTION_TYPES.FIND_ALL,
  payload: axios.get(apiURL)
});

export const invalidateSession = series => ({
  type: ACTION_TYPES.INVALIDATE,
  payload: axios.delete(`${apiURL}${series}`)
});
