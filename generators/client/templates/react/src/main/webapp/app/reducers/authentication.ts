import { hashHistory } from 'react-router';
import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from './action-type.util';

export const ACTION_TYPES = {
  LOGIN: 'authentication/LOGIN',
  GET_SESSION: 'authentication/GET_SESSION',
  LOGOUT: 'authentication/LOGOUT',
  ERROR_MESSAGE: 'authentication/ERROR_MESSAGE'
};

const initialState = {
  loading: false,
  isAuthenticated: false,
  loginSuccess: false,
  account: {},
  errorMessage: null, // Errors returned from server side
  loginError: false, // Errors returned from server side
  redirectMessage: null,
  showModalLogin: false
};

// Reducer

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.LOGIN):
    case REQUEST(ACTION_TYPES.LOGOUT):
    case REQUEST(ACTION_TYPES.GET_SESSION):
      return {
        ...state,
        loading: true
      };
    case FAILURE(ACTION_TYPES.LOGIN):
      return {
        ...initialState,
        errorMessage: action.payload
      };
    case FAILURE(ACTION_TYPES.GET_SESSION):
    case FAILURE(ACTION_TYPES.LOGOUT):
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.LOGIN):
      return {
        ...state,
        loading: false,
        loginError: false,
        loginSuccess: true
      };
    case SUCCESS(ACTION_TYPES.LOGOUT):
      return {
        ...initialState
      };
    case SUCCESS(ACTION_TYPES.GET_SESSION):
      {
        const isAuthenticated = action.payload && action.payload.data
          ? state.loginSuccess && action.payload.data.activated
          : false;
        return {
          ...state,
          isAuthenticated,
          loading: false,
          account: action.payload.data
        };
      }
    case ACTION_TYPES.ERROR_MESSAGE:
      return {
        ...initialState,
        redirectMessage: action.message
      };
    default:
      return state;
  }
};

export const displayAuthError = message => ({ type: ACTION_TYPES.ERROR_MESSAGE, message });

export const getSession = () => dispatch => dispatch({
  type: ACTION_TYPES.GET_SESSION,
  payload: axios.get('/api/account')
});

export const clearAuthToken = () => {
  if (localStorage.getItem('jhi-authenticationToken')) {
    localStorage.removeItem('jhi-authenticationToken');
  }
  if (sessionStorage.getItem('jhi-authenticationToken')) {
    sessionStorage.removeItem('jhi-authenticationToken');
  }
};

export const login = (username, password, rememberMe = false) => async (dispatch, getState) => {
  const result = await dispatch({
    type: ACTION_TYPES.LOGIN,
    payload: axios.post('/api/authenticate', { username, password, rememberMe })
  });
  const bearerToken = result.value.headers.authorization;
  if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
    const jwt = bearerToken.slice(7, bearerToken.length);
    if (rememberMe) {
      localStorage.setItem('jhi-authenticationToken', jwt);
    } else {
      sessionStorage.setItem('jhi-authenticationToken', jwt);
    }
  }
  const routingState = getState().routing.locationBeforeTransitions.state || {};
  hashHistory.push(routingState.nextPathname || '/');
  dispatch(getSession());
};

export const logout = () => async dispatch => {
  await dispatch({
    type: ACTION_TYPES.LOGOUT,
    payload: axios.get('/api/account')
  });
  clearAuthToken();
  hashHistory.push('/');
};

const getCurrentPath = getState => {
  const currentPath = getState().routing.locationBeforeTransitions.pathname;
  if (currentPath === '/login') {
    return getState().routing.locationBeforeTransitions.state.nextPathname || '/';
  }
  return currentPath;
};

export const redirectToLoginWithMessage = messageKey => (dispatch, getState) => {
  dispatch(displayAuthError(messageKey));

  hashHistory.replace({
    pathname: '/login',
    state: { nextPathname: getCurrentPath(getState) }
  });
};
