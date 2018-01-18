import * as React from 'react';
import { Route } from 'react-router-dom';

import UserManagement from './user-management';
import Logs from './logs/logs';
import Health from './health/health';
import Metrics from './metrics/metrics';
import Configuration from './configuration/configuration';
<%_ if (databaseType !== 'no' && databaseType !== 'cassandra') { _%>
import Audits from './audits/audits';
<%_ } _%>
import Docs from './docs/docs';
<%_ if (applicationType === 'gateway') { _%>
import Gateway from './gateway/gateway';
<%_ } _%>

const Routes = ({ match }) => (
  <div>
    <Route path={`${match.url}/user-management`} component={UserManagement} />
    <Route exact path={`${match.url}/health`} component={Health} />
<%_ if (applicationType === 'gateway') { _%>
    <Route exact path={`${match.url}/gateway`} component={Gateway} />
<%_ } _%>
    <Route exact path={`${match.url}/metrics`} component={Metrics} />
    <Route exact path={`${match.url}/docs`} component={Docs} />
    <Route exact path={`${match.url}/configuration`} component={Configuration} />
<%_ if (databaseType !== 'no' && databaseType !== 'cassandra') { _%>
    <Route exact path={`${match.url}/audits`} component={Audits} />
<%_ } _%>
    <Route exact path={`${match.url}/logs`} component={Logs} />
  </div>
);

export default Routes;
