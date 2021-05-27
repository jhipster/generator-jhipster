import React from 'react';
import { Switch } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import SearchLabel from './recorder/search-label';
import UserGroup from './recorder/user-group';
import MachineLabel from './recorder/machine-label';
import Channel from './recorder/channel';
import Node from './recorder/node';
import Record from './recorder/record';
import CategoryLabel from './recorder/category-label';
import UserProfile from './recorder/user-profile';
/* jhipster-needle-add-route-import - JHipster will add routes here */

const Routes = ({ match }) => (
  <div>
    <Switch>
      {/* prettier-ignore */}
      <ErrorBoundaryRoute path={`${match.url}search-label`} component={SearchLabel} />
      <ErrorBoundaryRoute path={`${match.url}user-group`} component={UserGroup} />
      <ErrorBoundaryRoute path={`${match.url}machine-label`} component={MachineLabel} />
      <ErrorBoundaryRoute path={`${match.url}channel`} component={Channel} />
      <ErrorBoundaryRoute path={`${match.url}node`} component={Node} />
      <ErrorBoundaryRoute path={`${match.url}record`} component={Record} />
      <ErrorBoundaryRoute path={`${match.url}category-label`} component={CategoryLabel} />
      <ErrorBoundaryRoute path={`${match.url}user-profile`} component={UserProfile} />
      {/* jhipster-needle-add-route-path - JHipster will add routes here */}
    </Switch>
  </div>
);

export default Routes;
