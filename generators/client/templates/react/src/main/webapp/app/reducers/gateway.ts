import axios from 'axios';
import { ICrudGetAction } from 'react-jhipster';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';

export const ACTION_TYPES = {
  FETCH_ROUTES: 'gateway/FETCH_ROUTES'
};

const initialState = {
  routes: [],
  errorMessage: null
};

// Reducer
export default (state = initialState, action) => {
switch (action.type) {
  case REQUEST(ACTION_TYPES.FETCH_ROUTES):
    return {
      ...state
    };
  case FAILURE(ACTION_TYPES.FETCH_ROUTES):
    return {
      ...state,
      errorMessage: action.payload
    };
    case SUCCESS(ACTION_TYPES.FETCH_ROUTES):
      return {
        ...state,
        routes: action.payload.data
      };
    default:
      return state;
  }
};

const apiUrl = '/api/gateway/routes';
// Actions
export const getRoutes: ICrudGetAction = () => ({
  type: ACTION_TYPES.FETCH_ROUTES,
  payload: axios.get(`${apiUrl}`)
});
