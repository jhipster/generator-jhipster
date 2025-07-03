// eslint-disable @typescript-eslint/no-unsafe-return
import { Type } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation-runtime';

import NavbarItem from 'app/layouts/navbar/navbar-item.model';

export const loadNavbarItems = async (service: string): Promise<NavbarItem[]> =>
  loadRemoteModule<{ EntityNavbarItems: NavbarItem[] }>({
    type: 'module',
    remoteEntry: `./services/${service}/remoteEntry.js`,
    exposedModule: './entity-navbar-items',
  }).then(({ EntityNavbarItems }) => EntityNavbarItems);

export const loadTranslationModule = async (service: string): Promise<Type<any>> =>
  loadRemoteModule<{ LazyTranslationModule: Type<any> }>({
    type: 'module',
    remoteEntry: `./services/${service}/remoteEntry.js`,
    exposedModule: './translation-module',
  }).then(({ LazyTranslationModule }) => LazyTranslationModule);

export const loadEntityRoutes = (service: string): Promise<Type<any>> =>
  loadRemoteModule<Type<any>>({
    type: 'module',
    remoteEntry: `./services/${service}/remoteEntry.js`,
    exposedModule: './entity-routes',
  });
