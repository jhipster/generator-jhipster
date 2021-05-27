import thunk from 'redux-thunk';
import axios from 'axios';
import sinon from 'sinon';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { TranslatorContext } from 'react-jhipster';

import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import register, { ACTION_TYPES, handleRegister, reset } from './register.reducer';

describe('Creating account tests', () => {
  const initialState = {
    loading: false,
    registrationSuccess: false,
    registrationFailure: false,
    errorMessage: null,
  };

  beforeAll(() => {
    TranslatorContext.registerTranslations('en', {});
  });

  it('should return the initial state', () => {
    expect(register(undefined, {})).toEqual({
      ...initialState,
    });
  });

  it('should detect a request', () => {
    expect(register(undefined, { type: REQUEST(ACTION_TYPES.CREATE_ACCOUNT) })).toEqual({
      ...initialState,
      loading: true,
    });
  });

  it('should handle RESET', () => {
    expect(
      register({ loading: true, registrationSuccess: true, registrationFailure: true, errorMessage: '' }, { type: ACTION_TYPES.RESET })
    ).toEqual({
      ...initialState,
    });
  });

  it('should handle CREATE_ACCOUNT success', () => {
    expect(
      register(undefined, {
        type: SUCCESS(ACTION_TYPES.CREATE_ACCOUNT),
        payload: 'fake payload',
      })
    ).toEqual({
      ...initialState,
      registrationSuccess: true,
    });
  });

  it('should handle CREATE_ACCOUNT failure', () => {
    const payload = { response: { data: { errorKey: 'fake error' } } };
    expect(
      register(undefined, {
        type: FAILURE(ACTION_TYPES.CREATE_ACCOUNT),
        payload,
      })
    ).toEqual({
      ...initialState,
      registrationFailure: true,
      errorMessage: payload.response.data.errorKey,
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

    it('dispatches CREATE_ACCOUNT_PENDING and CREATE_ACCOUNT_FULFILLED actions', async () => {
      const meta = {
        successMessage: 'translation-not-found[register.messages.success]',
      };

      const expectedActions = [
        {
          type: REQUEST(ACTION_TYPES.CREATE_ACCOUNT),
          meta,
        },
        {
          type: SUCCESS(ACTION_TYPES.CREATE_ACCOUNT),
          payload: resolvedObject,
          meta,
        },
      ];
      await store.dispatch(handleRegister('', '', '')).then(() => expect(store.getActions()).toEqual(expectedActions));
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
