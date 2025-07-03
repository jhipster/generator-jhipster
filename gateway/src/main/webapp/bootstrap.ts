import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import AppComponent from './app/app.component';

import { environment } from './environments/environment';

// disable debug data on prod profile to improve performance
if (!environment.DEBUG_INFO_ENABLED) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
  // eslint-disable-next-line no-console
  .then(() => console.log('Application started'))
  .catch((err: unknown) => console.error(err));
