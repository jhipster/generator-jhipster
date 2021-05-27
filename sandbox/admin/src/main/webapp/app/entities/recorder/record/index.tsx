import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Record from './record';
import RecordDetail from './record-detail';
import RecordUpdate from './record-update';
import RecordDeleteDialog from './record-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={RecordUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={RecordUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={RecordDetail} />
      <ErrorBoundaryRoute path={match.url} component={Record} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={RecordDeleteDialog} />
  </>
);

export default Routes;
