import { Route } from '@angular/router';

import { LogsComponent } from './logs.component';

export const logsRoute: Route = {
  path: '',
  component: LogsComponent,
  data: {
    pageTitle: 'Logs',
  },
};
