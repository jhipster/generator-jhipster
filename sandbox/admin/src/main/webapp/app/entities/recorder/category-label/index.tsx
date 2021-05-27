import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import CategoryLabel from './category-label';
import CategoryLabelDetail from './category-label-detail';
import CategoryLabelUpdate from './category-label-update';
import CategoryLabelDeleteDialog from './category-label-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={CategoryLabelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={CategoryLabelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={CategoryLabelDetail} />
      <ErrorBoundaryRoute path={match.url} component={CategoryLabel} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={CategoryLabelDeleteDialog} />
  </>
);

export default Routes;
