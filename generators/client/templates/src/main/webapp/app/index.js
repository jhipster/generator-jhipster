import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { hashHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import getRoutes from './routes';
import DevTools from './config/devtools';
import initStore from './config/store';
import { registerLocales } from './config/translation';
import setupAxiosInterceptors from './shared/interceptors/axios';
import { redirectToLoginWithMessage, clearAuthToken, logout } from './reducers/authentication';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const devTools = process.env.NODE_ENV === 'development' ? <DevTools /> : null;

const store = initStore();
const history = syncHistoryWithStore(hashHistory, store);
registerLocales(store);

const actions = bindActionCreators({ redirectToLoginWithMessage, logout }, store.dispatch);
setupAxiosInterceptors(() => actions.redirectToLoginWithMessage('login.error.unauthorized'), clearAuthToken);

render(
  <Provider store={store}>
    <div>
      {devTools}
      <Router history={history} routes={getRoutes(actions.logout)} />
    </div>
  </Provider>,
  document.getElementById('root')
);
