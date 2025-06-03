/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, it } from 'esmocha';
import { expect } from 'chai';

import * as defaultApplicationOptions from './default-application-options.js';

const {
  getConfigForMonolithApplication,
  getConfigForGatewayApplication,
  getConfigForMicroserviceApplication,
  getDefaultConfigForNewApplication,
} = defaultApplicationOptions;

describe('jdl - DefaultApplicationOptions', () => {
  describe('getConfigForMonolithApplication', () => {
    describe('without passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMonolithApplication();
      });

      it('should set the application type to monolith', () => {
        expect(options.applicationType).to.equal('monolith');
      });
      it('should set the server port to 8080', () => {
        expect(options.serverPort).to.equal(8080);
      });
      it('should set the authentication type to jwt', () => {
        expect(options.authenticationType).to.equal('jwt');
      });
      it('should set the cache provider to ehcache', () => {
        expect(options.cacheProvider).to.equal('ehcache');
      });
      it('should set the user management skipping option to false', () => {
        expect(options.skipUserManagement).to.be.false;
      });
      it('should set the client framework option to angular', () => {
        expect(options.clientFramework).to.equal('angular');
      });
      it('should set the client theme option to none', () => {
        expect(options.clientTheme).to.equal('none');
      });
      it('should set the client theme variant option to undefined', () => {
        expect(options.clientThemeVariant).to.be.undefined;
      });
      it('should set withAdminUI option to true', () => {
        expect(options.withAdminUi).to.be.true;
      });
    });
    describe('when passing a custom client theme and no variant', () => {
      let clientThemeVariantOption: string | undefined;

      before(() => {
        clientThemeVariantOption = getConfigForMonolithApplication({
          clientTheme: 'custom',
        }).clientThemeVariant;
      });

      it('should set the client theme variant to the primary', () => {
        expect(clientThemeVariantOption).to.equal('primary');
      });
    });
    describe('when the authentication type is oauth2', () => {
      let skipUserManagementOption: boolean | undefined;

      before(() => {
        skipUserManagementOption = getConfigForMonolithApplication({
          authenticationType: 'oauth2',
        }).skipUserManagement;
      });

      it('should set the user management skipping option to true', () => {
        expect(skipUserManagementOption).to.be.true;
      });
    });
    describe('when passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMonolithApplication({
          // @ts-expect-error check invalid option
          applicationType: 'custom',
        });
      });

      it('should ignore the application type', () => {
        expect(options.applicationType).to.equal('monolith');
      });
    });
  });
  describe('getConfigForGatewayApplication', () => {
    describe('without passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForGatewayApplication();
      });

      it('should set the application type to gateway', () => {
        expect(options.applicationType).to.equal('gateway');
      });
      it('should set the server port to 8080', () => {
        expect(options.serverPort).to.equal(8080);
      });
      it('should set the authentication type to jwt', () => {
        expect(options.authenticationType).to.equal('jwt');
      });
      it('should set the cache provider to no', () => {
        expect(options.cacheProvider).to.equal('no');
      });
      it('should disable hibernate cache', () => {
        expect(options.enableHibernateCache).to.be.false;
      });
      it('should set the user management skipping option to false', () => {
        expect(options.skipUserManagement).to.be.false;
      });
      it('should set the client framework option to angular', () => {
        expect(options.clientFramework).to.equal('angular');
      });
      it('should set the client theme option to none', () => {
        expect(options.clientTheme).to.equal('none');
      });
      it('should set the client theme variant option to undefined', () => {
        expect(options.clientThemeVariant).to.be.undefined;
      });
      it('should set the withAdminUi option to true', () => {
        expect(options.withAdminUi).to.be.true;
      });
      it('should set the service discovery type to consul', () => {
        expect(options.serviceDiscoveryType).to.equal('consul');
      });
      it('should set the reactive to true', () => {
        expect(options.reactive).to.be.true;
      });
    });
    describe('when the service discovery type option is no', () => {
      let serviceDiscoveryTypeOption;

      before(() => {
        serviceDiscoveryTypeOption = getConfigForGatewayApplication({
          serviceDiscoveryType: 'no',
        }).serviceDiscoveryType;
      });

      it('should set it to no', () => {
        expect(serviceDiscoveryTypeOption).to.be.equal('no');
      });
    });
    describe('when passing a custom client theme and no variant', () => {
      let clientThemeVariantOption;

      before(() => {
        clientThemeVariantOption = getConfigForGatewayApplication({
          clientTheme: 'custom',
        }).clientThemeVariant;
      });

      it('should set the client theme variant to the primary', () => {
        expect(clientThemeVariantOption).to.equal('primary');
      });
    });
    describe('when the authentication type is oauth2', () => {
      let skipUserManagementOption;

      before(() => {
        skipUserManagementOption = getConfigForGatewayApplication({
          authenticationType: 'oauth2',
        }).skipUserManagement;
      });

      it('should set the user management skipping option to true', () => {
        expect(skipUserManagementOption).to.be.true;
      });
    });
    describe('when passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForGatewayApplication({
          // @ts-expect-error check invalid option
          applicationType: 'custom',
        });
      });

      it('should ignore the application type', () => {
        expect(options.applicationType).to.equal('gateway');
      });
    });
  });
  describe('getConfigForMicroserviceApplication', () => {
    describe('without passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMicroserviceApplication();
      });

      it('should set the application type to microservice', () => {
        expect(options.applicationType).to.equal('microservice');
      });
      it('should set the server port to 8081', () => {
        expect(options.serverPort).to.equal(8081);
      });
      it('should set the authentication type to jwt', () => {
        expect(options.authenticationType).to.equal('jwt');
      });
      it('should set the cache provider to hazelcast', () => {
        expect(options.cacheProvider).to.equal('hazelcast');
      });
      it('should set the user management skipping option to true', () => {
        expect(options.skipUserManagement).to.be.true;
      });
      it('should set the service discovery type option to consul', () => {
        expect(options.serviceDiscoveryType).to.equal('consul');
      });
      it('should set the client skipping option to true', () => {
        expect(options.clientFramework).to.equal('no');
      });
      it('should unset the client theme option', () => {
        expect(options.clientTheme).to.be.undefined;
      });
      it('should unset the client theme variant option', () => {
        expect(options.clientThemeVariant).to.be.undefined;
      });
      it('should unset the withAdminUi option', () => {
        expect(options.withAdminUi).to.be.false;
      });
      it('should unset the server skipping option', () => {
        expect(options.skipServer).to.be.undefined;
      });
    });
    describe('when the service discovery type option is no', () => {
      let serviceDiscoveryTypeOption;

      before(() => {
        serviceDiscoveryTypeOption = getConfigForMicroserviceApplication({
          serviceDiscoveryType: 'no',
        }).serviceDiscoveryType;
      });

      it('should set it to no', () => {
        expect(serviceDiscoveryTypeOption).to.equal('no');
      });
    });
    describe('when passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMicroserviceApplication({
          // @ts-expect-error check invalid option
          applicationType: 'ignored',
          skipClient: false,
          clientFramework: 'react',
          clientTheme: 'something',
          clientThemeVariant: 'dark',
          skipServer: true,
        });
      });

      it('should ignore the application type option', () => {
        expect(options.applicationType).to.equal('microservice');
      });
      it('should not ignore the client skipping option', () => {
        expect(options.skipClient).to.be.false;
      });
      it('should not remove the client framework option', () => {
        expect(options.clientFramework).to.equal('react');
      });
      it('should remove the client theme option', () => {
        expect(options.clientTheme).to.equal('something');
      });
      it('should remove the client theme variant option', () => {
        expect(options.clientThemeVariant).to.equal('dark');
      });
      it('should remove the withAdminUi option', () => {
        expect(options.withAdminUi).to.be.false;
      });
      it('should not remove the server skipping option', () => {
        expect(options.skipServer).not.to.be.undefined;
      });
    });
  });
  describe('getDefaultConfigForNewApplication', () => {
    describe('when not passing custom options', () => {
      let options;

      before(() => {
        options = getDefaultConfigForNewApplication();
      });

      it('should set the base name option to jhipster', () => {
        expect(options.baseName).to.equal('jhipster');
      });
      it('should set the build tool option to maven', () => {
        expect(options.buildTool).to.equal('maven');
      });
      it('should set the database type option to sql', () => {
        expect(options.databaseType).to.equal('sql');
      });
      it('should set the development database type option to the same that production database', () => {
        expect(options.devDatabaseType).to.equal(options.prodDatabaseType);
      });
      it('should set the hibernate cache enabling option to true', () => {
        expect(options.enableHibernateCache).to.be.true;
      });
      it('should set the swagger codegen enabling option to false', () => {
        expect(options.enableSwaggerCodegen).to.be.false;
      });
      it('should set the translation enabling option to true', () => {
        expect(options.enableTranslation).to.be.true;
      });
      it('should set the jhipster prefix option to jhi', () => {
        expect(options.jhiPrefix).to.equal('jhi');
      });
      it('should set the languages option to an empty array', () => {
        expect(options.languages).to.be.eql([]);
      });
      it('should set the package name to com.mycompany.myapp', () => {
        expect(options.packageName).to.equal('com.mycompany.myapp');
      });
      it('should set the production database type option to postgresql', () => {
        expect(options.prodDatabaseType).to.equal('postgresql');
      });
      it('should set the search engine option to no', () => {
        expect(options.searchEngine).to.be.equal('no');
      });
      it('should set the test frameworks option to nothing', () => {
        expect(options.testFrameworks).to.have.lengthOf(0);
      });
      it('should set the websocket option to no', () => {
        expect(options.websocket).to.be.equal('no');
      });
    });
    describe('when there is no package name option but only a package folder', () => {
      let packageNameOption;

      before(() => {
        packageNameOption = getDefaultConfigForNewApplication({
          packageFolder: 'a/b/c/d',
        }).packageName;
      });

      it('should set the package name accordingly', () => {
        expect(packageNameOption).to.equal('a.b.c.d');
      });
    });
    describe('when the client framework option is angular', () => {
      let clientFrameworkOption;

      before(() => {
        clientFrameworkOption = getDefaultConfigForNewApplication({
          clientFramework: 'angular',
        }).clientFramework;
      });

      it('should set the option to angular', () => {
        expect(clientFrameworkOption).to.equal('angular');
      });
    });
    describe('when the database type option is MongoDB', () => {
      let enableHibernateCacheOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'mongodb',
        });
        enableHibernateCacheOption = options.enableHibernateCache;
      });

      it('should set the enableHibernateCache option to false', () => {
        expect(enableHibernateCacheOption).to.be.false;
      });
    });
    describe('when the database type option is couchbase', () => {
      let enableHibernateCacheOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'couchbase',
        });
        enableHibernateCacheOption = options.enableHibernateCache;
      });

      it('should set the enableHibernateCache option to false', () => {
        expect(enableHibernateCacheOption).to.be.false;
      });
    });
    describe('when the database type option is cassandra', () => {
      let enableHibernateCacheOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'cassandra',
        });
        enableHibernateCacheOption = options.enableHibernateCache;
      });

      it('should set the enableHibernateCache option to false', () => {
        expect(enableHibernateCacheOption).to.be.false;
      });
    });
    describe('when the reactive option is set', () => {
      let cacheProviderOption;

      before(() => {
        cacheProviderOption = getDefaultConfigForNewApplication({
          reactive: true,
        }).cacheProvider;
      });

      it('should set the cache provider option to no', () => {
        expect(cacheProviderOption).to.equal('no');
      });
    });
    describe('when the cache option is set to ehcache', () => {
      it('should set the enableHibernateCache option to true', () => {
        expect(
          getDefaultConfigForNewApplication({
            cacheProvider: 'ehcache',
          }).enableHibernateCache,
        ).to.equal(true);
      });
    });
    describe('when the cache option is set to memcached', () => {
      it('should set the enableHibernateCache option to false', () => {
        expect(
          getDefaultConfigForNewApplication({
            cacheProvider: 'memcached',
          }).enableHibernateCache,
        ).to.equal(false);
      });
    });
  });
});
