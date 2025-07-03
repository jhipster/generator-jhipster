import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ProductResolve from './route/product-routing-resolve.service';

const productRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/product.component').then(m => m.ProductComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/product-detail.component').then(m => m.ProductDetailComponent),
    resolve: {
      product: ProductResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/product-update.component').then(m => m.ProductUpdateComponent),
    resolve: {
      product: ProductResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/product-update.component').then(m => m.ProductUpdateComponent),
    resolve: {
      product: ProductResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default productRoute;
