/**
 * @jest-environment jsdom
 */
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';
import thunk from 'redux-thunk';
import axios from 'axios';
import sinon from 'sinon';
import { Storage } from 'react-jhipster';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';

import authentication, {
  ACTION_TYPES,
  getSession,
  login,
  clearAuthentication,
  logout,
  clearAuthToken,
} from 'app/shared/reducers/authentication';
import { ACTION_TYPES as localeActionTypes } from 'app/shared/reducers/locale';

describe('Authentication reducer tests', () => {
  function isAccountEmpty(state): boolean {
    return Object.keys(state.account).length === 0;
  }

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const toTest = authentication(undefined, {});
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        errorMessage: null, // Errors returned from server side
        loginSuccess: false,
        loginError: false, // Errors returned from server side
        showModalLogin: false,
        redirectMessage: null,
      });
      expect(isAccountEmpty(toTest));
    });
  });

  describe('Requests', () => {
    it('should detect a request', () => {
      expect(authentication(undefined, { type: REQUEST(ACTION_TYPES.LOGIN) })).toMatchObject({
        loading: true,
      });
      expect(authentication(undefined, { type: REQUEST(ACTION_TYPES.GET_SESSION) })).toMatchObject({
        loading: true,
      });
    });
  });

  describe('Success', () => {
    it('should detect a success on login', () => {
      const toTest = authentication(undefined, { type: SUCCESS(ACTION_TYPES.LOGIN) });
      expect(toTest).toMatchObject({
        loading: false,
        loginError: false,
        loginSuccess: true,
        showModalLogin: false,
      });
    });

    it('should detect a success on get session and be authenticated', () => {
      const payload = { data: { activated: true } };
      const toTest = authentication(undefined, { type: SUCCESS(ACTION_TYPES.GET_SESSION), payload });
      expect(toTest).toMatchObject({
        isAuthenticated: true,
        loading: false,
        account: payload.data,
      });
    });

    it('should detect a success on get session and not be authenticated', () => {
      const payload = { data: { activated: false } };
      const toTest = authentication(undefined, { type: SUCCESS(ACTION_TYPES.GET_SESSION), payload });
      expect(toTest).toMatchObject({
        isAuthenticated: false,
        loading: false,
        account: payload.data,
      });
    });
  });

  describe('Failure', () => {
    it('should detect a failure on login', () => {
      const payload = 'Something happened.';
      const toTest = authentication(undefined, { type: FAILURE(ACTION_TYPES.LOGIN), payload });

      expect(toTest).toMatchObject({
        errorMessage: payload,
        showModalLogin: true,
        loginError: true,
      });
      expect(isAccountEmpty(toTest));
    });

    it('should detect a failure', () => {
      const payload = 'Something happened.';
      const toTest = authentication(undefined, { type: FAILURE(ACTION_TYPES.GET_SESSION), payload });

      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        showModalLogin: true,
        errorMessage: payload,
      });
      expect(isAccountEmpty(toTest));
    });
  });

  describe('Other cases', () => {
    it('should properly reset the current state when a logout is requested', () => {
      const toTest = authentication(undefined, { type: ACTION_TYPES.LOGOUT });
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        loginSuccess: false,
        loginError: false,
        showModalLogin: true,
        errorMessage: null,
        redirectMessage: null,
      });
      expect(isAccountEmpty(toTest));
    });

    it('should properly define an error message and change the current state to display the login modal', () => {
      const message = 'redirect me please';
      const toTest = authentication(undefined, { type: ACTION_TYPES.ERROR_MESSAGE, message });
      expect(toTest).toMatchObject({
        loading: false,
        isAuthenticated: false,
        loginSuccess: false,
        loginError: false,
        showModalLogin: true,
        errorMessage: null,
        redirectMessage: message,
      });
      expect(isAccountEmpty(toTest));
    });

    it('should clear authentication', () => {
      const message = 'redirect me please';
      const toTest = authentication(undefined, { type: ACTION_TYPES.CLEAR_AUTH, message });
      expect(toTest).toMatchObject({
        loading: false,
        showModalLogin: true,
        isAuthenticated: false,
      });
    });
  });

  describe('Actions', () => {
    let store;

    const resolvedObject = { value: 'whatever' };
    beforeEach(() => {
      const mockStore = configureStore([thunk, promiseMiddleware]);
      store = mockStore({ authentication: { account: { langKey: 'en' } } });
      axios.get = sinon.stub().returns(Promise.resolve(resolvedObject));
    });

    it('dispatches GET_SESSION_PENDING and GET_SESSION_FULFILLED actions', async () => {
      const expectedActions = [
        {
          type: REQUEST(ACTION_TYPES.GET_SESSION),
        },
        {
          type: SUCCESS(ACTION_TYPES.GET_SESSION),
          payload: resolvedObject,
        },
        {
          type: localeActionTypes.SET_LOCALE,
          locale: 'en',
        },
      ];
      await store.dispatch(getSession());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('dispatches LOGOUT actions', async () => {
      const expectedActions = [
        {
          type: ACTION_TYPES.LOGOUT,
        },
      ];
      await store.dispatch(logout());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('dispatches CLEAR_AUTH actions', async () => {
      const expectedActions = [
        {
          message: 'message',
          type: ACTION_TYPES.ERROR_MESSAGE,
        },
        {
          type: ACTION_TYPES.CLEAR_AUTH,
        },
      ];
      await store.dispatch(clearAuthentication('message'));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('dispatches LOGIN, GET_SESSION and SET_LOCALE success and request actions', async () => {
      const loginResponse = { headers: { authorization: 'auth' } };
      axios.post = sinon.stub().returns(Promise.resolve(loginResponse));
      const expectedActions = [
        {
          type: REQUEST(ACTION_TYPES.LOGIN),
        },
        {
          type: SUCCESS(ACTION_TYPES.LOGIN),
          payload: loginResponse,
        },
        {
          type: REQUEST(ACTION_TYPES.GET_SESSION),
        },
        {
          type: SUCCESS(ACTION_TYPES.GET_SESSION),
          payload: resolvedObject,
        },
        {
          type: localeActionTypes.SET_LOCALE,
          locale: 'en',
        },
      ];
      await store.dispatch(login('test', 'test'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
  describe('clearAuthToken', () => {
    let store;
    beforeEach(() => {
      const mockStore = configureStore([thunk, promiseMiddleware]);
      store = mockStore({ authentication: { account: { langKey: 'en' } } });
    });
    it('clears the session token on clearAuthToken', async () => {
      const AUTH_TOKEN_KEY = 'jhi-authenticationToken';
      const loginResponse = { headers: { authorization: 'Bearer TestToken' } };
      axios.post = sinon.stub().returns(Promise.resolve(loginResponse));

      await store.dispatch(login('test', 'test'));
      expect(Storage.session.get(AUTH_TOKEN_KEY)).toBe('TestToken');
      expect(Storage.local.get(AUTH_TOKEN_KEY)).toBe(undefined);
      clearAuthToken();
      expect(Storage.session.get(AUTH_TOKEN_KEY)).toBe(undefined);
      expect(Storage.local.get(AUTH_TOKEN_KEY)).toBe(undefined);
    });
    it('clears the local storage token on clearAuthToken', async () => {
      const AUTH_TOKEN_KEY = 'jhi-authenticationToken';
      const loginResponse = { headers: { authorization: 'Bearer TestToken' } };
      axios.post = sinon.stub().returns(Promise.resolve(loginResponse));

      await store.dispatch(login('user', 'user', true));
      expect(Storage.session.get(AUTH_TOKEN_KEY)).toBe(undefined);
      expect(Storage.local.get(AUTH_TOKEN_KEY)).toBe('TestToken');
      clearAuthToken();
      expect(Storage.session.get(AUTH_TOKEN_KEY)).toBe(undefined);
      expect(Storage.local.get(AUTH_TOKEN_KEY)).toBe(undefined);
    });
  });
});
