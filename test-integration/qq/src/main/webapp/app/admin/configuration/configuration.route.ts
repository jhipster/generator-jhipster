import { Route } from '@angular/router';

import { ConfigurationComponent } from './configuration.component';

export const configurationRoute: Route = {
  path: '',
  component: ConfigurationComponent,
  data: {
    pageTitle: 'configuration.title',
  },
};
