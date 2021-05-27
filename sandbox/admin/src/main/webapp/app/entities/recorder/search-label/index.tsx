import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import SearchLabel from './search-label';
import SearchLabelDetail from './search-label-detail';
import SearchLabelUpdate from './search-label-update';
import SearchLabelDeleteDialog from './search-label-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={SearchLabelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={SearchLabelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={SearchLabelDetail} />
      <ErrorBoundaryRoute path={match.url} component={SearchLabel} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={SearchLabelDeleteDialog} />
  </>
);

export default Routes;
