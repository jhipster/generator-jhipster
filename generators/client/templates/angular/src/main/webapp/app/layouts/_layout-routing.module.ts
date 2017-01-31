import { NgModule } from '@angular/core';
import { RouterModule, Routes, Resolve } from '@angular/router';

import { homeRoute } from '../home';
import { navbarRoute } from '../app.route';
import { errorRoute } from './';

let LAYOUT_ROUTES = [
    homeRoute,
    navbarRoute,
    ...errorRoute
];

@NgModule({
  imports: [
    RouterModule.forRoot(LAYOUT_ROUTES, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class LayoutRoutingModule {}
