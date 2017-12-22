import { isPromise } from 'react-jhipster';

export default () => next => action => {
  // If not a promise, continue on
  if (!isPromise(action.payload)) {
    return next(action);
  }

  /**
   *
   * The notification middleware serves to dispatch the initial pending promise to
   * the promise middleware, but adds a `then` and `catch.
   */
  return next(action).then(response => {
    if (action.meta && action.meta.successMessage) {
      // toast(action.meta.successMessage, { type: toast.TYPE.SUCCESS });
    }
    return Promise.resolve(response);
  }).catch(error => {
    if (action.meta && action.meta.errorMessage) {
      // toast(action.meta.errorMessage, { type: toast.TYPE.ERROR });
    }
    return Promise.reject(error);
  });
};
