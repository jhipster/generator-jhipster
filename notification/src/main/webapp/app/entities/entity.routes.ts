import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'notification',
    data: { pageTitle: 'notificationApp.notificationNotification.home.title' },
    loadChildren: () => import('./notification/notification/notification.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
