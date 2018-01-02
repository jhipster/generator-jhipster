import * as React from 'react';
import { Route } from 'react-router-dom';
import { PrivateRoute } from 'react-jhipster';

import Login from './modules/login/login';
import Logout from './modules/login/logout';
import Home from './modules/home/home';
import Admin from './modules/administration';
import Account from './modules/account';
import Entities from './entities';

const Routes = () => (
  <div className="view-routes">
    <Route exact path="/" component={Home}/>
    <Route path="/login" component={Login} />
    <Route path="/logout" component={Logout} />
    <PrivateRoute path="/admin" component={Admin} />
    <PrivateRoute path="/account" component={Account} />
    <Route path="**" component={Entities} />
  </div>
);

export default Routes;
