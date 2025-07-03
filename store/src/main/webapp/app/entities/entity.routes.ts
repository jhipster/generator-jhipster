import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'product',
    data: { pageTitle: 'storeApp.storeProduct.home.title' },
    loadChildren: () => import('./store/product/product.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
