import * as React from 'react';
import { Route } from 'react-router-dom';

import PrivateRoute from './shared/layout/private-route/private-route';
import Login from './modules/login/login';
import Logout from './modules/login/logout';
import Home from './modules/home/home';
import Admin from './modules/administration';
import Settings from './modules/account/settings/settings';
import Password from './modules/account/password/password';

const Routes = () => (
  <div className="view-routes">
    <Route exact path="/" component={Home}/>
    <Route path="/login" component={Login} />
    <Route path="/logout" component={Logout} />
    <Route path="/account/settings" component={Settings}/>
    <Route path="/account/password" component={Password}/>
    <PrivateRoute path="/admin" component={Admin} />
  </div>
);

export default Routes;
