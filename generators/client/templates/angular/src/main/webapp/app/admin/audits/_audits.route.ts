import { Route } from '@angular/router';

import { AuditsComponent } from './audits.component';

export const auditsRoute: Route = {
  path: 'audits',
  component: AuditsComponent,
  data: {
    pageTitle: 'audits.title'
  }
};
