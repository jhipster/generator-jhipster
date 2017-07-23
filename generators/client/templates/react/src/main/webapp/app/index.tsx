import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hashHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { AppContainer } from 'react-hot-loader';

import getRoutes from './routes';
// import DevTools from './config/devtools';
import initStore from './config/store';
import { registerLocales } from './config/translation';
import setupAxiosInterceptors from './config/axios-interceptor';
import { redirectToLoginWithMessage, clearAuthToken } from './reducers/authentication';

// enable once we start using it
// const devTools = process.env.NODE_ENV === 'development' ? <DevTools /> : null;

const store = initStore();
const history = syncHistoryWithStore(hashHistory, store);
registerLocales(store);

const actions = bindActionCreators({ redirectToLoginWithMessage }, store.dispatch);
setupAxiosInterceptors(() => actions.redirectToLoginWithMessage('login.error.unauthorized'), clearAuthToken);

const rootEl = document.getElementById('root');
ReactDOM.render(
  <AppContainer>
    <Provider store={store}>
      <div>
        {/* devTools*/}
        <Router history={history} routes={getRoutes()} />
      </div>
    </Provider>
  </AppContainer>,
  rootEl
);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./routes', () => {
    const nextRoute = require<any>('./routes').default;
    ReactDOM.render(
      <AppContainer>
        <Provider store={store}>
          <div>
            {/* devTools*/}
            <Router history={history} routes={nextRoute()} />
          </div>
        </Provider>
      </AppContainer>,
      rootEl
    );
  });
}
