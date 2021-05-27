import thunk from 'redux-thunk';
import axios from 'axios';
import sinon from 'sinon';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { TranslatorContext } from 'react-jhipster';

import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';
import password, { ACTION_TYPES, savePassword, reset } from './password.reducer';

describe('Password reducer tests', () => {
  beforeAll(() => {
    TranslatorContext.registerTranslations('en', {});
  });

  describe('Common tests', () => {
    it('should return the initial state', () => {
      const toTest = password(undefined, {});
      expect(toTest).toMatchObject({
        loading: false,
        errorMessage: null,
        updateSuccess: false,
        updateFailure: false,
      });
    });
  });

  describe('Password update', () => {
    it('should detect a request', () => {
      const toTest = password(undefined, { type: REQUEST(ACTION_TYPES.UPDATE_PASSWORD) });
      expect(toTest).toMatchObject({
        updateSuccess: false,
        updateFailure: false,
        loading: true,
      });
    });
    it('should detect a success', () => {
      const toTest = password(undefined, { type: SUCCESS(ACTION_TYPES.UPDATE_PASSWORD) });
      expect(toTest).toMatchObject({
        updateSuccess: true,
        updateFailure: false,
        loading: false,
      });
    });
    it('should detect a failure', () => {
      const toTest = password(undefined, { type: FAILURE(ACTION_TYPES.UPDATE_PASSWORD) });
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
        password(
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
      store = mockStore({});
      axios.post = sinon.stub().returns(Promise.resolve(resolvedObject));
    });

    it('dispatches UPDATE_PASSWORD_PENDING and UPDATE_PASSWORD_FULFILLED actions', async () => {
      const meta = {
        errorMessage: 'translation-not-found[password.messages.error]',
        successMessage: 'translation-not-found[password.messages.success]',
      };

      const expectedActions = [
        {
          type: REQUEST(ACTION_TYPES.UPDATE_PASSWORD),
          meta,
        },
        {
          type: SUCCESS(ACTION_TYPES.UPDATE_PASSWORD),
          payload: resolvedObject,
          meta,
        },
      ];
      await store.dispatch(savePassword('', '')).then(() => expect(store.getActions()).toEqual(expectedActions));
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
