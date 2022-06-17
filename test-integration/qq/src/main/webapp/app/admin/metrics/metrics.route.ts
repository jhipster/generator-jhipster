import { Route } from '@angular/router';

import { MetricsComponent } from './metrics.component';

export const metricsRoute: Route = {
  path: '',
  component: MetricsComponent,
  data: {
    pageTitle: 'metrics.title',
  },
};
