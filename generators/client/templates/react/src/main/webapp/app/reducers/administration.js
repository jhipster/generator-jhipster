const FETCH = 'administration/FETCH';
const FETCH_SUCCESS = 'administration/FETCH_SUCCESS';
const FETCH_FAIL = 'administration/FETCH_FAIL';
const FETCH_GATEWAY_ROUTE = 'administration/FETCH_GATEWAY_ROUTE';
const FETCH_LOGS = 'administration/FETCH_LOGS';
const FETCH_LOGS_CHANGE_LEVEL = 'administration/FETCH_LOGS_CHANGE_LEVEL';
const FETCH_HEALTH = 'administration/FETCH_HEALTH';
const FETCH_HEALTH_INFO = 'administration/FETCH_HEALTH_INFO';
const FETCH_METRICS = 'administration/FETCH_METRICS';
const FETCH_THREAD_DUMP = 'administration/FETCH_THREAD_DUMP';
const FETCH_USERS = 'administration/FETCH_USERS';
const FETCH_CONFIGURATIONS = 'administration/FETCH_CONFIGURATIONS';
const FETCH_ENV = 'administration/FETCH_ENV';
const FETCH_AUDITS = 'administration/FETCH_AUDITS';
const FETCH_API_DOCS = 'administration/FETCH_API_DOCS';

const initialState = {
  loading: false,
  gateway: {
    routes: []
  },
  logs: {
    loggers: []
  },
  health: {

  },
  metrics: {

  },
  userManagement: {
    users: []
  },
  configuration: {
    configProps: {},
    env: {}
  },
  audits: [],
  apiDocs: {

  }
};

// Reducer

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case FETCH:
      return {
        ...state,
        loading: true
      };
    case FETCH_SUCCESS:
      return {
        ...state,
        loading: false
      };
    case FETCH_GATEWAY_ROUTE:
      return {
        ...state,
        gateway: {
          routes: action.result.data
        },
        loading: false
      };
    case FETCH_METRICS:
      return {
        ...state,
        metrics: action.result.data,
        loading: false
      };
    case FETCH_THREAD_DUMP:
      return {
        ...state,
        threadDump: action.result.data,
        loading: false
      };
    case FETCH_LOGS:
      return {
        ...state,
        logs: {
          loggers: action.result.data
        },
        loading: false
      };
    case FETCH_USERS:
      return {
        ...state,
        userManagement: {
          users: action.result.data
        },
        loading: false
      };
    case FETCH_CONFIGURATIONS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          configProps: action.result.data
        },
        loading: false
      };
    case FETCH_ENV:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          env: action.result.data
        },
        loading: false
      };
    case FETCH_AUDITS:
      return {
        ...state,
        audits: action.result.data,
        loading: false
      };
    case FETCH_HEALTH:
      return {
        ...state,
        health: action.result.data,
        loading: false
      };
    case FETCH_HEALTH_INFO:
      return {
        ...state,
        health: action.result,
        loading: false
      };
    case FETCH_API_DOCS:
      return {
        ...state,
        apiDocs: action.result.data,
        loading: false
      };
    default:
      return state;
  }
}

// Actions

export function gatewayRoutes() {
  return {
    types: [FETCH, FETCH_GATEWAY_ROUTE, FETCH_FAIL],
    promise: client => client.get('/api/gateway/routes')
  };
}


export function getLoggers() {
  return {
    types: [FETCH, FETCH_LOGS, FETCH_FAIL],
    promise: client => client.get('/management/logs')
  };
}

export function systemHealth() {
  return {
    types: [FETCH, FETCH_HEALTH, FETCH_FAIL],
    promise: client => client.get('/management/health')
  };
}

export function systemHealthInfo(healthObj) {
  return {
    types: [FETCH, FETCH_HEALTH_INFO, FETCH_FAIL],
    promise: () => Promise.resolve(healthObj)
  };
}

export function systemMetrics() {
  return {
    types: [FETCH, FETCH_METRICS, FETCH_FAIL],
    promise: client => client.get('/management/jhipster/metrics')
  };
}

export function systemThreadDump() {
  return {
    types: [FETCH, FETCH_THREAD_DUMP, FETCH_FAIL],
    promise: client => client.get('/management/dump')
  };
}

export function changeLogLevel(name, level) {
  const body = {
    level,
    name
  };
  return {
    types: [FETCH, FETCH_LOGS_CHANGE_LEVEL, FETCH_FAIL],
    promise: client => client.put('/management/jhipster/logs', body),
    afterSuccess: dispatch => dispatch(getLoggers())
  };
}

export function getUsers(page = 0, size = 10, sort = 'id, asc') {
  return {
    types: [FETCH, FETCH_USERS, FETCH_FAIL],
    promise: client => client.get(`/api/users?cacheBuster=${new Date().getTime()}&page=${page}&size=${size}&sort=${sort}`)
  };
}

export function getConfigurations() {
  return {
    types: [FETCH, FETCH_CONFIGURATIONS, FETCH_FAIL],
    promise: client => client.get('/management/configprops')
  };
}

export function getEnv() {
  return {
    types: [FETCH, FETCH_ENV, FETCH_FAIL],
    promise: client => client.get('/management/env')
  };
}

export function getAudits(fromDate, toDate, page = 0, size = 20) {
  let requestUrl = `/management/jhipster/audits?page=${page}&size=${size}`;
  if (toDate) {
    requestUrl += `&toDate=${toDate}`;
  }
  if (fromDate) {
    requestUrl += `&fromDate=${fromDate}`;
  }
  return {
    types: [FETCH, FETCH_AUDITS, FETCH_FAIL],
    promise: client => client.get(requestUrl)
  };
}

export function getApiDocs() {
  return {
    types: [FETCH, FETCH_API_DOCS, FETCH_FAIL],
    promise: client => client.get('/v2/api-docs')
  };
}
