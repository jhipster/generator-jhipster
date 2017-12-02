import * as React from 'react';
import { Route } from 'react-router-dom';

import UserManagement from './user-management';
import Logs from './logs/logs';
import Health from './health/health';
import Metrics from './metrics/metrics';
import Configuration from './configuration/configuration';
import Audits from './audits/audits';
import Docs from './docs/docs';

const Routes = ({ match }) => (
  <div>
    <Route path={`${match.url}/user-management`} component={UserManagement} />
    <Route exact path={`${match.url}/health`} component={Health} />
    <Route exact path={`${match.url}/metrics`} component={Metrics} />
    <Route exact path={`${match.url}/docs`} component={Docs} />
    <Route exact path={`${match.url}/configuration`} component={Configuration} />
    <Route exact path={`${match.url}/audits`} component={Audits} />
    <Route exact path={`${match.url}/logs`} component={Logs} />
  </div>
);

export default Routes;
