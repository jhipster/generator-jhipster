import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AppContainer } from 'react-hot-loader';

import DevTools from './config/devtools';
import initStore from './config/store';
<%_ if (enableTranslation) { _%>
import { registerLocales } from './config/translation';
<%_ } _%>
import setupAxiosInterceptors from './config/axios-interceptor';
import { clearAuthentication } from './reducers/authentication';
import AppComponent from './app';

const devTools = process.env.NODE_ENV === 'development' ? <DevTools /> : null;

const store = initStore();
<%_ if (enableTranslation) { _%>
registerLocales(store);
<%_ } _%>

const actions = bindActionCreators({ clearAuthentication }, store.dispatch);
setupAxiosInterceptors(() => actions.clearAuthentication('login.error.unauthorized'));

const rootEl = document.getElementById('root');

const render = Component =>
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <div>
          {/* If this slows down the app in dev disable it and enable when required  */}
          {devTools}
          <Component/>
        </div>
      </Provider>
    </AppContainer>,
    rootEl
  );

render(AppComponent);

// This is quite unstable
// if (module.hot) {
//   module.hot.accept('./app', () => {
//     const NextApp = require<{ default: typeof AppComponent }>('./app').default;
//     render(NextApp);
//   });
// }
