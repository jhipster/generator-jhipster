import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import MachineLabel from './machine-label';
import MachineLabelDetail from './machine-label-detail';
import MachineLabelUpdate from './machine-label-update';
import MachineLabelDeleteDialog from './machine-label-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={MachineLabelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={MachineLabelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={MachineLabelDetail} />
      <ErrorBoundaryRoute path={match.url} component={MachineLabel} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={MachineLabelDeleteDialog} />
  </>
);

export default Routes;
