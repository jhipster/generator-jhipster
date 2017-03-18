import { browserHistory } from 'react-router';

const LOGIN = 'authentication/LOGIN';
const LOGIN_SUCCESS = 'authentication/LOGIN_SUCCESS';
const LOGIN_FAIL = 'authentication/LOGIN_FAIL';

const GET_SESSION = 'authentication/GET_SESSION';
const GET_SESSION_SUCCESS = 'authentication/GET_SESSION_SUCCESS';
const GET_SESSION_FAIL = 'authentication/GET_SESSION_FAIL';

const LOGOUT = 'authentication/LOGOUT';
const LOGOUT_SUCCESS = 'authentication/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'authentication/LOGOUT_FAIL';

const ERROR_MESSAGE = 'authentication/ERROR_MESSAGE';

const initialState = {
  isFetching: false,
  isAuthenticated: false,
  account: {},
  errorMessage: null, // Errors returned from server side
  redirectMessage: null,
  showModalLogin: false
};

// Reducer

export default function reducer(state = initialState, action) {
  let isAuthenticated = false;
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...initialState,
        isAuthenticated: true
      };
    case LOGIN_FAIL:
      return {
        ...initialState,
        errorMessage: action.error.data
      };
    case LOGOUT_SUCCESS:
      return {
        ...initialState
      };
    case GET_SESSION:
      return {
        ...state,
        isFetching: true
      };
    case GET_SESSION_SUCCESS:
      isAuthenticated = action.result.data ? action.result.data.activated : false;
      return {
        ...initialState,
        isAuthenticated,
        account: action.result.data
      };
    case GET_SESSION_FAIL:
      return {
        ...initialState,
        errorMessage: action.error.data
      };
    case ERROR_MESSAGE:
      return {
        ...initialState,
        redirectMessage: action.message
      };
    default:
      return state;
  }
}

export function displayAuthError(message) {
  return { type: ERROR_MESSAGE, message };
}

export function getSession() {
  return {
    types: [GET_SESSION, GET_SESSION_SUCCESS, GET_SESSION_FAIL],
    promise: client => client.get('/api/account')
  };
}

export function clearAuthToken() {
  if (localStorage.getItem('jhi-authenticationToken')) {
    localStorage.removeItem('jhi-authenticationToken');
  }
  if (sessionStorage.getItem('jhi-authenticationToken')) {
    sessionStorage.removeItem('jhi-authenticationToken');
  }
}

<%_ if (authenticationType === 'oauth2') { _%>
export function login(username, password, rememberMe = false) {
  const data = `username=${encodeURIComponent(username)}&password=${
      encodeURIComponent(password)}&grant_type=password&scope=read%20write&` +
      'client_secret=my-secret-token-to-change-in-production&client_id=<%= baseName%>app';
  const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + this.base64.encode('<%= baseName%>app' + ':' + 'my-secret-token-to-change-in-production')
  };

  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: client => client.post('oauth/token', data, { headers: headers }),
    afterSuccess: (dispatch, getState, response) => {
      const expiredAt = new Date();
      expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
      response.expires_at = expiredAt.getTime();
      localStorage.setItem('jhi-authenticationToken', response);
      const routingState = getState().routing.locationBeforeTransitions.state || {};
      browserHistory.push(routingState.nextPathname || '/#/');
      dispatch(getSession());
    }
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: client => client.post('/api/logout', {}),
    afterSuccess: () => {
      clearAuthToken();
      browserHistory.push('/#/');
    }
  };
}
<%_ } else if (authenticationType === 'jwt') { _%>
export function login(username, password, rememberMe = false) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: client => client.post('/api/authenticate', { username, password, rememberMe }),
    afterSuccess: (dispatch, getState, response) => {
      const bearerToken = response.headers.authorization;
      if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
        const jwt = bearerToken.slice(7, bearerToken.length);
        if (rememberMe) {
          localStorage.setItem('jhi-authenticationToken', jwt);
        } else {
          sessionStorage.setItem('jhi-authenticationToken', jwt);
        }
      }
      const routingState = getState().routing.locationBeforeTransitions.state || {};
      browserHistory.push(routingState.nextPathname || '/#/');
      dispatch(getSession());
    }
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: client => client.get('/api/account'),
    afterSuccess: () => {
      clearAuthToken();
      browserHistory.push('/#/');
    }
  };
}
<%_ } else if (authenticationType === 'session') { _%>
export function login(username, password, rememberMe = false) {
  const data = `j_username=${encodeURIComponent(username)
      }&j_password=${encodeURIComponent(password)
      }&remember-me=${rememberMe}&submit=Login`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: client => client.post('/api/authentication', data, { headers }),
    afterSuccess: (dispatch, getState, response) => {
      const routingState = getState().routing.locationBeforeTransitions.state || {};
      browserHistory.push(routingState.nextPathname || '/#/');
      dispatch(getSession());
    }
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: client => client.post('/api/logout', {}),
    afterSuccess: (dispatch, getState, response) => {
      dispatch(getSession());
      browserHistory.push('/#/');
    }
  };
}
<%_ } _%>

export function redirectToLoginWithMessage(messageKey) {
  return (dispatch, getState) => {
    dispatch(displayAuthError(messageKey));
    const currentPath = getState().routing.locationBeforeTransitions.pathname;
    browserHistory.replace({
      pathname: '/login',
      state: { nextPathname: currentPath }
    });
  };
}
