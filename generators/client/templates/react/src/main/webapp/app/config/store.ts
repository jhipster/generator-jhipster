import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunkMiddleware from 'redux-thunk';
import reducer from '../reducers';
import DevTools from './devtools';
import errorMiddleware from './error-middleware';
import notificationMiddleware from './notification-middleware';
import loggerMiddleware from './logger-middleware';

const middlewares = [
  thunkMiddleware,
  errorMiddleware,
  notificationMiddleware,
  promiseMiddleware(),
  loggerMiddleware
];
const composedMiddlewares = process.env.NODE_ENV === 'development' ?
  compose(applyMiddleware(...middlewares), DevTools.instrument()) :
  compose(applyMiddleware(...middlewares));

const initialize = (initialState = {}) => {
  const store = createStore(reducer, initialState, composedMiddlewares);

  // Enable Webpack hot module replacement for reducers
  if (module.hot) {
    // TODO : see if reducers can be moved to feature modules and still get HMR working
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }
  return store;
};

export default initialize;
