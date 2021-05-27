import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import UserGroup from './user-group';
import UserGroupDetail from './user-group-detail';
import UserGroupUpdate from './user-group-update';
import UserGroupDeleteDialog from './user-group-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={UserGroupUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={UserGroupUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={UserGroupDetail} />
      <ErrorBoundaryRoute path={match.url} component={UserGroup} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={UserGroupDeleteDialog} />
  </>
);

export default Routes;
