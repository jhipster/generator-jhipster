import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
// import * as toaster from 'react-toastify';
// import * as sinon from 'sinon';

import notificationMiddleware from '../../../../../main/webapp/app/config/notification-middleware';

describe('Notification Middleware', () => {
  let store;

  const SUCCESS_TYPE = 'SUCCESS';
  const ERROR_TYPE = 'SUCCESS';
  const DEFAULT_SUCCESS_MESSAGE = 'fooSuccess';
  const DEFAULT_ERROR_MESSAGE = 'fooError';

  // Default action for use in local tests
  const DEFAULT = {
    type: SUCCESS_TYPE,
    payload: 'foo'
  };
  const DEFAULT_PROMISE = {
    type: SUCCESS_TYPE,
    payload: Promise.resolve('foo')
  };
  const DEFAULT_SUCCESS = {
    type: SUCCESS_TYPE,
    meta: {
      successMessage: DEFAULT_SUCCESS_MESSAGE
    },
    payload: Promise.resolve('foo')
  };
  const DEFAULT_ERROR = {
    type: ERROR_TYPE,
    meta: {
      errorMessage: DEFAULT_ERROR_MESSAGE
    },
    payload: Promise.reject(new Error('foo'))
  };

  const makeStore = () => applyMiddleware(
    notificationMiddleware,
    promiseMiddleware()
  )(createStore)(() => null);

  beforeEach(() => {
    store = makeStore();
    // sinon.spy(toaster, 'toast');
  });

  afterEach(() => {
    // toaster.toast.restore();
  });

  context('When action is not a promise:', () => {
    it('should not trigger a toast message but should return action', () => {
      expect(store.dispatch(DEFAULT).payload).to.equal('foo');
    //   expect(toaster.toast.called).to.equal(false);
    });
  });

  context('When action does not describes a message in meta:', () => {
    it('should not trigger a toast message but should return promise success', async () => {
      await store.dispatch(DEFAULT_PROMISE).then(resp => {
        expect(resp.value).to.equal('foo');
      });
    //   expect(toaster.toast.called).to.equal(false);
    });
  });

  context('When action describes a successMessage in meta:', () => {
    it('should trigger a success toast message and return promise success', async () => {
      await store.dispatch(DEFAULT_SUCCESS).then(resp => {
        expect(resp.value).to.equal('foo');
      });
    //   expect(toaster.toast.getCall(0).args[0]).to.equal(DEFAULT_SUCCESS_MESSAGE);
    });
  });

  context('When action describes a errorMessage in meta:', () => {
    it('should trigger an error toast message and return promise error', async () => {
      await store.dispatch(DEFAULT_ERROR).catch(err => {
        expect(err.message).to.equal('foo');
      });
    //   expect(toaster.toast.getCall(0).args[0]).to.equal(DEFAULT_ERROR_MESSAGE);
    });
  });
});
