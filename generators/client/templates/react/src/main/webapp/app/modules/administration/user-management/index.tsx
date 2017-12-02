
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ModalRoute } from 'react-router-modal';

import UserManagement from './user-management';
import UserManagementDetail from './user-management-detail';
import UserManagementModel from './user-management-model';
import UserManagementDeleteModel from './user-management-delete-model';

const Routes = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={match.url} component={UserManagement} />
      <ModalRoute exact parentPath={match.url} path={`${match.url}/new`} component={UserManagementModel} />
      <ModalRoute exact parentPath={match.url} path={`${match.url}/:login/delete`} component={UserManagementDeleteModel} />
      <ModalRoute exact parentPath={match.url} path={`${match.url}/:login/edit`} component={UserManagementModel} />
      <Route exact path={`${match.url}/:login`} component={UserManagementDetail} />
    </Switch>
  </div>
);

export default Routes;
