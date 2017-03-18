import { createStore, applyMiddleware, compose } from 'redux';
import reducer from '../reducers';
import DevTools from './devtools';
import promiseMiddleware from './promise-middleware';

const middlewares = process.env.NODE_ENV === 'development' ?
  [applyMiddleware(promiseMiddleware), DevTools.instrument()] :
  [applyMiddleware(promiseMiddleware)];

const initialize = (initialState = {}) => {
  const store = createStore(reducer, initialState, compose(...middlewares));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    // TODO : see if reducers can be moved to feature modules and still get HMR working
    module.hot.accept('../reducers', () => {
      /* eslint-disable */
      const nextReducer = require('../reducers');
      /* eslint-enable */
      store.replaceReducer(nextReducer);
    });
  }
  return store;
};

export default initialize;
