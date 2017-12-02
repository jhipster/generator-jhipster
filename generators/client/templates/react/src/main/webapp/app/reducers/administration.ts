import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';

export const ACTION_TYPES = {
  FETCH_GATEWAY_ROUTE: 'administration/FETCH_GATEWAY_ROUTE',
  FETCH_LOGS: 'administration/FETCH_LOGS',
  FETCH_LOGS_CHANGE_LEVEL: 'administration/FETCH_LOGS_CHANGE_LEVEL',
  FETCH_HEALTH: 'administration/FETCH_HEALTH',
  FETCH_METRICS: 'administration/FETCH_METRICS',
  FETCH_THREAD_DUMP: 'administration/FETCH_THREAD_DUMP',
  FETCH_CONFIGURATIONS: 'administration/FETCH_CONFIGURATIONS',
  FETCH_ENV: 'administration/FETCH_ENV',
  FETCH_AUDITS: 'administration/FETCH_AUDITS'
};

const initialState = {
  loading: false,
  errorMessage: null,
  gateway: {
    routes: []
  },
  logs: {
    loggers: []
  },
  health: {},
  metrics: {},
  threadDump: [],
  configuration: {
    configProps: {},
    env: {}
  },
  audits: []
};

// Reducer

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_GATEWAY_ROUTE):
    case REQUEST(ACTION_TYPES.FETCH_METRICS):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case REQUEST(ACTION_TYPES.FETCH_THREAD_DUMP):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case REQUEST(ACTION_TYPES.FETCH_LOGS):
    case REQUEST(ACTION_TYPES.FETCH_CONFIGURATIONS):
    case REQUEST(ACTION_TYPES.FETCH_ENV):
    case REQUEST(ACTION_TYPES.FETCH_AUDITS):
    case REQUEST(ACTION_TYPES.FETCH_HEALTH):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_GATEWAY_ROUTE):
    case FAILURE(ACTION_TYPES.FETCH_METRICS):
    case FAILURE(ACTION_TYPES.FETCH_THREAD_DUMP):
    case FAILURE(ACTION_TYPES.FETCH_LOGS):
    case FAILURE(ACTION_TYPES.FETCH_CONFIGURATIONS):
    case FAILURE(ACTION_TYPES.FETCH_ENV):
    case FAILURE(ACTION_TYPES.FETCH_AUDITS):
    case FAILURE(ACTION_TYPES.FETCH_HEALTH):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_GATEWAY_ROUTE):
      return {
        ...state,
        loading: false,
        gateway: {
          routes: action.payload.data
        }
      };
    case SUCCESS(ACTION_TYPES.FETCH_METRICS):
      return {
        ...state,
        loading: false,
        metrics: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_THREAD_DUMP):
      return {
        ...state,
        loading: false,
        threadDump: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_LOGS):
      return {
        ...state,
        loading: false,
        logs: {
          loggers: action.payload.data
        }
      };
    case SUCCESS(ACTION_TYPES.FETCH_CONFIGURATIONS):
      return {
        ...state,
        loading: false,
        configuration: {
          ...state.configuration,
          configProps: action.payload.data
        }
      };
    case SUCCESS(ACTION_TYPES.FETCH_ENV):
      return {
        ...state,
        loading: false,
        configuration: {
          ...state.configuration,
          env: action.payload.data
        }
      };
    case SUCCESS(ACTION_TYPES.FETCH_AUDITS):
      return {
        ...state,
        loading: false,
        audits: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_HEALTH):
      return {
        ...state,
        loading: false,
        health: action.payload.data
      };
    default:
      return state;
  }
};

// Actions
export const gatewayRoutes = () => ({
  type: ACTION_TYPES.FETCH_GATEWAY_ROUTE,
  payload: axios.get('/api/gateway/routes')
});

export const systemHealth = () => ({
  type: ACTION_TYPES.FETCH_HEALTH,
  payload: axios.get('/management/health')
});

export const systemMetrics = () => ({
  type: ACTION_TYPES.FETCH_METRICS,
  payload: axios.get('/management/metrics')
});

export const systemThreadDump = () => ({
  type: ACTION_TYPES.FETCH_THREAD_DUMP,
  payload: axios.get('/management/dump')
});

export const getLoggers = () => ({
  type: ACTION_TYPES.FETCH_LOGS,
  payload: axios.get('/management/logs')
});

export const changeLogLevel = (name, level) => {
  const body = {
    level,
    name
  };
  return async dispatch => {
    await dispatch({
      type: ACTION_TYPES.FETCH_LOGS_CHANGE_LEVEL,
      payload: axios.put('/management/logs', body)
    });
    dispatch(getLoggers());
  };
};

export const getConfigurations = () => ({
  type: ACTION_TYPES.FETCH_CONFIGURATIONS,
  payload: axios.get('/management/configprops')
});

export const getEnv = () => ({
  type: ACTION_TYPES.FETCH_ENV,
  payload: axios.get('/management/env')
});

export const getAudits = (fromDate, toDate, page = 0, size = 20) => {
  let requestUrl = `/management/jhipster/audits?page=${page}&size=${size}`;
  if (toDate) {
    requestUrl += `&toDate=${toDate}`;
  }
  if (fromDate) {
    requestUrl += `&fromDate=${fromDate}`;
  }
  return {
    type: ACTION_TYPES.FETCH_AUDITS,
    payload: axios.get(requestUrl)
  };
};
