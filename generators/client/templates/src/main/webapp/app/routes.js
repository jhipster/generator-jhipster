import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AppComponent from './app';
import PrivateRoute from './shared/components/private-route/private-route';

if (typeof require.ensure !== 'function') {
  require.ensure = function requireModule(deps, callback) {
    callback(require);
  };
}

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable */
  // Require async routes only in development for react-hot-reloader to work.
  require('./modules/home/home');
  require('./modules/login/login');
  // require('./modules/administration/gateway/gateway');
  require('./modules/administration/logs/logs');
  // require('./modules/administration/health/health');
  // require('./modules/administration/metrics/metrics');
  // require('./modules/administration/user-management/user-management');
  require('./modules/administration/configuration/configuration');
  require('./modules/administration/audits/audits');
  require('./modules/administration/docs/docs');
  /* eslint-enable */
}

// react-router setup with code-splitting
// More info: http://blog.mxstbr.com/2016/01/react-apps-with-pages/
export default (onLogout) => {
  return (
    <Route path="/" component={AppComponent}>
      <IndexRoute
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, require('./modules/home/home').default);
          });
        }}
      />
      <Route
        path="/login"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, require('./modules/login/login').default);
          });
        }}
      />
      <Route
        path="/logout"
        onEnter={onLogout}
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, require('./modules/login/login').default);
          });
        }}
      />
      {/*
      <Route
        path="/admin/gateway"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/gateway/Gateway').default));
          });
        }}
      />
      <Route
        path="/admin/health"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/health/Health').default));
          });
        }}
      />
      <Route
        path="/admin/metrics"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/metrics/Metrics').default));
          });
        }}
      />
      <Route
        path="/admin/user-management"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/user-management/UserManagement').default));
          });
        }}
      />
      */}
      <Route
        path="/admin/configuration"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/configuration/configuration').default));
          });
        }}
      />
      <Route
        path="/admin/audits"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/audits/Audits').default));
          });
        }}
      />
      <Route
        path="/admin/logs"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            // cb(null, PrivateRoute(require('./modules/administration/Logs').default));
            cb(null, (require('./modules/administration/logs/logs').default));
          });
        }}
      />
      <Route
        path="/admin/docs"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            // cb(null, PrivateRoute(require('./modules/administration/docs/Docs').default));
            cb(null, require('./modules/administration/docs/docs').default);
          });
        }}
      />
    </Route>
  );
};
