import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import UserProfile from './user-profile';
import UserProfileDetail from './user-profile-detail';
import UserProfileUpdate from './user-profile-update';
import UserProfileDeleteDialog from './user-profile-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={UserProfileUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={UserProfileUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={UserProfileDetail} />
      <ErrorBoundaryRoute path={match.url} component={UserProfile} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={UserProfileDeleteDialog} />
  </>
);

export default Routes;
