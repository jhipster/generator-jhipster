import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunkMiddleware from 'redux-thunk';
import reducer from '../reducers';
import DevTools from './devtools';
import errorMiddleware from './error-middleware';
import notificationMiddleware from './notification-middleware';
import loggerMiddleware from './logger-middleware';
import { loadingBarMiddleware } from 'react-redux-loading-bar';

const defaultMiddlewares = [
  thunkMiddleware,
  errorMiddleware,
  notificationMiddleware,
  promiseMiddleware(),
  loadingBarMiddleware(),
  loggerMiddleware
];
const composedMiddlewares = middlewares => process.env.NODE_ENV === 'development' ?
  compose(applyMiddleware(...defaultMiddlewares, ...middlewares), DevTools.instrument()) :
  compose(applyMiddleware(...defaultMiddlewares, ...middlewares));

const initialize = (initialState = {}, middlewares = []) => {
  const store = createStore(reducer, initialState, composedMiddlewares(middlewares));

  // Enable Webpack hot module replacement for reducers
  if (module.hot) {
    // TODO : see if reducers can be moved to feature modules and still get HMR working
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default;
      store.replaceReducer(nextReducer);
    });
  }
  return store;
};

export default initialize;
