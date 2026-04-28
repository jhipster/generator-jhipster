import { Middleware } from '@reduxjs/toolkit';

import { hideLoading, showLoading } from 'app/shared/reducers/loading-bar';

const loadingBarMiddleware: Middleware =
  ({ dispatch }) =>
  next =>
  (action: unknown) => {
    const { type } = action as { type: string };
    if (type.endsWith('/pending')) {
      dispatch(showLoading());
    } else if (type.endsWith('/fulfilled') || type.endsWith('/rejected')) {
      dispatch(hideLoading());
    }
    return next(action);
  };

export default loadingBarMiddleware;
