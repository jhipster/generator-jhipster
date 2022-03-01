import { Route } from '@angular/router';

import { DocsComponent } from './docs.component';

export const docsRoute: Route = {
  path: '',
  component: DocsComponent,
  data: {
    pageTitle: 'API',
  },
};
