import axios from 'axios';
import { logError } from '../shared/util/log-util';

export default function promiseMiddleware({ dispatch, getState }) {
  return next => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }
    const { promise, types, afterSuccess, ...rest } = action;
    if (!action.promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({ ...rest, type: REQUEST });

    const onFulfilled = (result) => {
      next({ ...rest, result, type: SUCCESS });
      if (afterSuccess) {
        afterSuccess(dispatch, getState, result);
      }
    };
    const onRejected = (error) => {
      next({ ...rest, error, type: FAILURE });
    };
    return promise(axios)
      .then(onFulfilled, onRejected)
      .catch((error) => {
        logError('MIDDLEWARE ERROR:', error);
        onRejected(error);
      });
  };
}
