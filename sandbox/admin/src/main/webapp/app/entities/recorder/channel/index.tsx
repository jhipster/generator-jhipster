import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Channel from './channel';
import ChannelDetail from './channel-detail';
import ChannelUpdate from './channel-update';
import ChannelDeleteDialog from './channel-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={ChannelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={ChannelUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={ChannelDetail} />
      <ErrorBoundaryRoute path={match.url} component={Channel} />
    </Switch>
    <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={ChannelDeleteDialog} />
  </>
);

export default Routes;
