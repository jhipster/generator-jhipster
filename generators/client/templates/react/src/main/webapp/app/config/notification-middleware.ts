import { isPromise, translate } from 'react-jhipster';
import { toast } from 'react-toastify';

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
      if (typeof action.meta.successMessage === 'string') {
        toast.success(action.meta.successMessage);
      } else {
        toast.success(action.meta.successMessage[0] + response.action.payload.data.id);
      }
    }
    return Promise.resolve(response);
  }).catch(error => {
    if (action.meta && action.meta.errorMessage) {
      toast.error(action.meta.errorMessage);
    }
    return Promise.reject(error);
  });
};
