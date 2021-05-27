import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Node from './node';
import NodeDetail from './node-detail';
import NodeUpdate from './node-update';
import NodeDeleteDialog from './node-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={NodeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={NodeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={NodeDetail} />
      <ErrorBoundaryRoute path={match.url} component={Node} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={NodeDeleteDialog} />
  </>
);

export default Routes;
