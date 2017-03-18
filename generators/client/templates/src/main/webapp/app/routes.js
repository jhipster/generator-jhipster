import React from 'react';
import { Route, IndexRoute } from 'react-router';
import AppComponent from './App';
import PrivateRoute from './shared/components/private-route/PrivateRoute';

if (typeof require.ensure !== 'function') {
  require.ensure = function requireModule(deps, callback) {
    callback(require);
  };
}

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable */
  // Require async routes only in development for react-hot-reloader to work.
  require('./modules/home/Home');
  require('./modules/login/Login');
  // require('./modules/administration/gateway/Gateway');
  // require('./modules/administration/logs/Logs');
  // require('./modules/administration/health/Health');
  // require('./modules/administration/metrics/Metrics');
  // require('./modules/administration/user-management/UserManagement');
  // require('./modules/administration/configuration/Configuration');
  // require('./modules/administration/audits/Audits');
  // require('./modules/administration/docs/ApiDocs');
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
            cb(null, require('./modules/home/Home').default);
          });
        }}
      />
      <Route
        path="/login"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, require('./modules/login/Login').default);
          });
        }}
      />
      <Route
        path="/logout"
        onEnter={onLogout}
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, require('./modules/login/Login').default);
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
        path="/admin/logs"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            // cb(null, PrivateRoute(require('./modules/administration/Logs').default));
            cb(null, (require('./modules/administration/logs/Logs').default));
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
      <Route
        path="/admin/configuration"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            cb(null, PrivateRoute(require('./modules/administration/configuration/Configuration').default));
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
        path="/admin/docs"
        getComponent={(nextState, cb) => {
          require.ensure([], (require) => {
            // cb(null, PrivateRoute(require('./modules/administration/docs/ApiDocs').default));
            cb(null, require('./modules/administration/docs/ApiDocs').default);
          });
        }}
      />
    */}
    </Route>
  );
};
