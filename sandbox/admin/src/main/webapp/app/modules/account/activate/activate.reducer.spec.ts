import thunk from 'redux-thunk';
import axios from 'axios';
import sinon from 'sinon';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';

import { SUCCESS, FAILURE, REQUEST } from 'app/shared/reducers/action-type.util';
import activate, { ACTION_TYPES, activateAction, reset } from './activate.reducer';

describe('Activate reducer tests', () => {
  it('should return the initial state', () => {
    expect(activate(undefined, {})).toMatchObject({
      activationSuccess: false,
      activationFailure: false,
    });
  });

  it('should reset', () => {
    expect(activate({ activationSuccess: true, activationFailure: false }, { type: ACTION_TYPES.RESET })).toMatchObject({
      activationSuccess: false,
      activationFailure: false,
    });
  });

  it('should detect a success', () => {
    expect(activate(undefined, { type: SUCCESS(ACTION_TYPES.ACTIVATE_ACCOUNT) })).toMatchObject({
      activationSuccess: true,
      activationFailure: false,
    });
  });

  it('should return the same state on request', () => {
    expect(activate(undefined, { type: REQUEST(ACTION_TYPES.ACTIVATE_ACCOUNT) })).toMatchObject({
      activationSuccess: false,
      activationFailure: false,
    });
  });

  it('should detect a failure', () => {
    expect(activate(undefined, { type: FAILURE(ACTION_TYPES.ACTIVATE_ACCOUNT) })).toMatchObject({
      activationSuccess: false,
      activationFailure: true,
    });
  });

  it('should reset the state', () => {
    const initialState = {
      activationSuccess: false,
      activationFailure: false,
    };
    expect(
      activate(
        { activationSuccess: true, activationFailure: true },
        {
          type: ACTION_TYPES.RESET,
        }
      )
    ).toEqual({
      ...initialState,
    });
  });

  describe('Actions', () => {
    let store;

    const resolvedObject = { value: 'whatever' };
    beforeEach(() => {
      const mockStore = configureStore([thunk, promiseMiddleware]);
      store = mockStore({});
      axios.get = sinon.stub().returns(Promise.resolve(resolvedObject));
    });

    it('dispatches ACTIVATE_ACCOUNT_PENDING and ACTIVATE_ACCOUNT_FULFILLED actions', async () => {
      const expectedActions = [
        {
          type: REQUEST(ACTION_TYPES.ACTIVATE_ACCOUNT),
        },
        {
          type: SUCCESS(ACTION_TYPES.ACTIVATE_ACCOUNT),
          payload: resolvedObject,
        },
      ];
      await store.dispatch(activateAction('')).then(() => expect(store.getActions()).toEqual(expectedActions));
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
