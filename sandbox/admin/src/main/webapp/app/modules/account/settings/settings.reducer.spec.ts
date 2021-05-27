/**
 * @jest-environment jsdom
 */
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import axios from 'axios';
import sinon from 'sinon';
import { TranslatorContext } from 'react-jhipster';

import account, { ACTION_TYPES, saveAccountSettings, reset } from './settings.reducer';
import { ACTION_TYPES as authActionTypes } from 'app/shared/reducers/authentication';
import { ACTION_TYPES as localeActionTypes } from 'app/shared/reducers/locale';

describe('Settings reducer tests', () => {
  beforeAll(() => {
    TranslatorContext.registerTranslations('en', {});
  });

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const toTest = account(undefined, {});
      expect(toTest).toMatchObject({
        loading: false,
        errorMessage: null,
        updateSuccess: false,
        updateFailure: false,
      });
    });
  });

  describe('Settings update', () => {
    it('should detect a request', () => {
      const toTest = account(undefined, { type: REQUEST(ACTION_TYPES.UPDATE_ACCOUNT) });
      expect(toTest).toMatchObject({
        updateSuccess: false,
        updateFailure: false,
        loading: true,
      });
    });
    it('should detect a success', () => {
      const toTest = account(undefined, { type: SUCCESS(ACTION_TYPES.UPDATE_ACCOUNT) });
      expect(toTest).toMatchObject({
        updateSuccess: true,
        updateFailure: false,
        loading: false,
      });
    });
    it('should detect a failure', () => {
      const toTest = account(undefined, { type: FAILURE(ACTION_TYPES.UPDATE_ACCOUNT) });
      expect(toTest).toMatchObject({
        updateSuccess: false,
        updateFailure: true,
        loading: false,
      });
    });

    it('should reset the state', () => {
      const initialState = {
        loading: false,
        errorMessage: null,
        updateSuccess: false,
        updateFailure: false,
      };
      expect(
        account(
          { ...initialState, loading: true },
          {
            type: ACTION_TYPES.RESET,
          }
        )
      ).toEqual({
        ...initialState,
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
      axios.post = sinon.stub().returns(Promise.resolve(resolvedObject));
    });

    it('dispatches UPDATE_ACCOUNT_PENDING and UPDATE_ACCOUNT_FULFILLED actions', async () => {
      const meta = {
        successMessage: 'translation-not-found[settings.messages.success]',
      };

      const expectedActions = [
        {
          type: REQUEST(ACTION_TYPES.UPDATE_ACCOUNT),
          meta,
        },
        {
          type: SUCCESS(ACTION_TYPES.UPDATE_ACCOUNT),
          payload: resolvedObject,
          meta,
        },
        {
          type: REQUEST(authActionTypes.GET_SESSION),
        },
        {
          type: SUCCESS(authActionTypes.GET_SESSION),
          payload: resolvedObject,
        },
        {
          type: localeActionTypes.SET_LOCALE,
          locale: 'en',
        },
      ];
      await store.dispatch(saveAccountSettings({})).then(() => expect(store.getActions()).toEqual(expectedActions));
    });
    it('dispatches ACTION_TYPES.RESET actions', async () => {
      const expectedActions = [
        {
          type: ACTION_TYPES.RESET,
        },
      ];
      await store.dispatch(reset());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
