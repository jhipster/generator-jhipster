import * as React from 'react';
import {
  Route, IndexRoute
} from 'react-router';

import AppComponent from './app';
import Login from './modules/login/login';
import Logout from './modules/login/logout';
import Logs from './modules/administration/logs/logs';
import Configuration from './modules/administration/configuration/configuration';
import Audits from './modules/administration/audits/audits';
import Docs from './modules/administration/docs/docs';
import Home from './modules/home/home';

// react-router setup without code-splitting
const Routes = () => (
  <Route path="/" component={AppComponent}>
    <IndexRoute component={Home}/>
    <Route path="/login" component={Login}/>
    <Route path="/logout" component={Logout}/>
    <Route path="/rawdata" component={Home}/>
    <Route path="/admin/docs" component={Docs}/>
    <Route path="/admin/configuration" component={Configuration}/>
    <Route path="/admin/audits" component={Audits}/>
    <Route path="/admin/logs" component={Logs}/>
  </Route>
);

export default Routes;
