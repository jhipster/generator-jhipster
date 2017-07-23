import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';
import { messages } from '../config/constants';
import { ICrudGetAction, ICrudPutAction, ICrudDeleteAction } from '../shared/model/redux-action.type';

export const ACTION_TYPES = {
  FETCH_PROPERTIES: 'systemProperty/FETCH_PROJECTS',
  FETCH_PROPERTY: 'systemProperty/FETCH_PROJECT',
  CREATE_PROPERTY: 'systemProperty/CREATE_PROJECT',
  UPDATE_PROPERTY: 'systemProperty/UPDATE_PROJECT',
  DELETE_PROPERTY: 'systemProperty/DELETE_PROJECT'
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
    case REQUEST(ACTION_TYPES.FETCH_PROPERTIES):
    case REQUEST(ACTION_TYPES.FETCH_PROPERTY):
    case REQUEST(ACTION_TYPES.CREATE_PROPERTY):
    case REQUEST(ACTION_TYPES.UPDATE_PROPERTY):
    case REQUEST(ACTION_TYPES.DELETE_PROPERTY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PROPERTIES):
    case FAILURE(ACTION_TYPES.FETCH_PROPERTY):
    case FAILURE(ACTION_TYPES.CREATE_PROPERTY):
    case FAILURE(ACTION_TYPES.UPDATE_PROPERTY):
    case FAILURE(ACTION_TYPES.DELETE_PROPERTY):
      return {
        ...state,
        loading: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROPERTIES):
      return {
        ...state,
        loading: false,
        systemProperties: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROPERTY):
      return {
        ...state,
        loading: false,
        systemProperty: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PROPERTY):
    case SUCCESS(ACTION_TYPES.UPDATE_PROPERTY):
      return {
        ...state,
        loading: false,
        updateSuccess: true,
        systemProperty: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PROPERTY):
      return {
        ...state,
        loading: false,
        updateSuccess: true,
        systemProperty: {}
      };
    default:
      return state;
  }
};

const apiUrl = '/api/system-property';
// Actions
export const getSystemProperties: ICrudGetAction = () => ({
  type: ACTION_TYPES.FETCH_PROPERTIES,
  payload: axios.get(apiUrl)
});

export const getSystemProperty: ICrudGetAction = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PROPERTY,
    payload: axios.get(requestUrl)
  };
};

export const createSystemProperty: ICrudPutAction = project => dispatch => dispatch({
  type: ACTION_TYPES.CREATE_PROPERTY,
  meta: {
    successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
    errorMessage: messages.DATA_UPDATE_ERROR_ALERT
  },
  payload: axios.post(apiUrl, project)
});

export const updateSystemProperty: ICrudPutAction = project => dispatch => dispatch({
  type: ACTION_TYPES.UPDATE_PROPERTY,
  meta: {
    successMessage: messages.DATA_CREATE_SUCCESS_ALERT,
    errorMessage: messages.DATA_UPDATE_ERROR_ALERT
  },
  payload: axios.put(apiUrl, project)
});

export const deleteSystemProperty: ICrudDeleteAction = id => dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  return dispatch({
    type: ACTION_TYPES.DELETE_PROPERTY,
    meta: {
      successMessage: messages.DATA_DELETE_SUCCESS_ALERT,
      errorMessage: messages.DATA_UPDATE_ERROR_ALERT
    },
    payload: axios.delete(requestUrl)
  });
};
