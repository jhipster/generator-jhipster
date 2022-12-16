/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import {
  getConfigForMonolithApplication,
  getConfigForGatewayApplication,
  getConfigForMicroserviceApplication,
  getDefaultConfigForNewApplication,
} from '../../../jdl/jhipster/default-application-options.js';

describe('DefaultApplicationOptions', () => {
  describe('getConfigForMonolithApplication', () => {
    context('without passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMonolithApplication();
      });

      it('should set the application type to monolith', () => {
        expect(options.applicationType).to.equal('monolith');
      });
      it('should set the server port to 8080', () => {
        expect(options.serverPort).to.equal('8080');
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
      it('should set the client theme variant option to none', () => {
        expect(options.clientThemeVariant).to.equal('');
      });
      it('should set withAdminUI option to true', () => {
        expect(options.withAdminUi).to.be.true;
      });
    });
    context('when passing a custom client theme and no variant', () => {
      let clientThemeVariantOption: any;

      before(() => {
        clientThemeVariantOption = getConfigForMonolithApplication({
          clientTheme: 'custom',
        }).clientThemeVariant;
      });

      it('should set the client theme variant to the primary', () => {
        expect(clientThemeVariantOption).to.equal('primary');
      });
    });
    context('when the authentication type is oauth2', () => {
      let skipUserManagementOption: any;

      before(() => {
        skipUserManagementOption = getConfigForMonolithApplication({
          authenticationType: 'oauth2',
        }).skipUserManagement;
      });

      it('should set the user management skipping option to true', () => {
        expect(skipUserManagementOption).to.be.true;
      });
    });
    context('when passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMonolithApplication({
          applicationType: 'custom',
        });
      });

      it('should ignore the application type', () => {
        expect(options.applicationType).to.equal('monolith');
      });
    });
  });
  describe('getConfigForGatewayApplication', () => {
    context('without passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForGatewayApplication();
      });

      it('should set the application type to gateway', () => {
        expect(options.applicationType).to.equal('gateway');
      });
      it('should set the server port to 8080', () => {
        expect(options.serverPort).to.equal('8080');
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
      it('should set the client theme variant option to none', () => {
        expect(options.clientThemeVariant).to.equal('');
      });
      it('should set the withAdminUi option to true', () => {
        expect(options.withAdminUi).to.be.true;
      });
      it('should set the service discovery type to eureka', () => {
        expect(options.serviceDiscoveryType).to.equal('eureka');
      });
      it('should set the reactive to true', () => {
        expect(options.reactive).to.be.true;
      });
    });
    context('when the service discovery type option is false', () => {
      let serviceDiscoveryTypeOption;

      before(() => {
        serviceDiscoveryTypeOption = getConfigForGatewayApplication({
          serviceDiscoveryType: false,
        }).serviceDiscoveryType;
      });

      it('should set it to eureka', () => {
        expect(serviceDiscoveryTypeOption).to.equal('eureka');
      });
    });
    context('when the service discovery type option is no', () => {
      let serviceDiscoveryTypeOption;

      before(() => {
        serviceDiscoveryTypeOption = getConfigForGatewayApplication({
          serviceDiscoveryType: 'no',
        }).serviceDiscoveryType;
      });

      it('should set it to false', () => {
        expect(serviceDiscoveryTypeOption).to.be.false;
      });
    });
    context('when passing a custom client theme and no variant', () => {
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
    context('when the authentication type is oauth2', () => {
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
    context('when passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForGatewayApplication({
          applicationType: 'custom',
        });
      });

      it('should ignore the application type', () => {
        expect(options.applicationType).to.equal('gateway');
      });
    });
  });
  describe('getConfigForMicroserviceApplication', () => {
    context('without passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMicroserviceApplication();
      });

      it('should set the application type to microservice', () => {
        expect(options.applicationType).to.equal('microservice');
      });
      it('should set the server port to 8081', () => {
        expect(options.serverPort).to.equal('8081');
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
      it('should set the service discovery type option to eureka', () => {
        expect(options.serviceDiscoveryType).to.equal('eureka');
      });
      it('should set the client skipping option to true', () => {
        expect(options.skipClient).to.be.true;
      });
      it('should unset the client theme option', () => {
        expect(options.clientTheme).to.be.undefined;
      });
      it('should unset the client theme variant option', () => {
        expect(options.clientThemeVariant).to.be.undefined;
      });
      it('should unset the withAdminUi option', () => {
        expect(options.withAdminUi).to.be.undefined;
      });
      it('should unset the server skipping option', () => {
        expect(options.skipServer).to.be.undefined;
      });
    });
    context('when the service discovery type option is false', () => {
      let serviceDiscoveryTypeOption;

      before(() => {
        serviceDiscoveryTypeOption = getConfigForMicroserviceApplication({
          serviceDiscoveryType: false,
        }).serviceDiscoveryType;
      });

      it('should set it to eureka', () => {
        expect(serviceDiscoveryTypeOption).to.equal('eureka');
      });
    });
    context('when the service discovery type option is no', () => {
      let serviceDiscoveryTypeOption;

      before(() => {
        serviceDiscoveryTypeOption = getConfigForMicroserviceApplication({
          serviceDiscoveryType: 'no',
        }).serviceDiscoveryType;
      });

      it('should set it to false', () => {
        expect(serviceDiscoveryTypeOption).to.be.false;
      });
    });
    context('when the user management skipping option is not a boolean', () => {
      let skipUserManagementOption;

      before(() => {
        skipUserManagementOption = getConfigForMicroserviceApplication({
          skipUserManagement: 'no',
        }).skipUserManagement;
      });

      it('should set it to true', () => {
        expect(skipUserManagementOption).to.be.true;
      });
    });
    context('when passing custom options', () => {
      let options;

      before(() => {
        options = getConfigForMicroserviceApplication({
          applicationType: 'ignored',
          skipClient: false,
          clientFramework: 'react',
          clientTheme: 'something',
          clientThemeVariant: 'somethingElse',
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
        expect(options.clientTheme).to.be.undefined;
      });
      it('should remove the client theme variant option', () => {
        expect(options.clientThemeVariant).to.be.undefined;
      });
      it('should remove the withAdminUi option', () => {
        expect(options.withAdminUi).to.be.undefined;
      });
      it('should not remove the server skipping option', () => {
        expect(options.skipServer).not.to.be.undefined;
      });
    });
  });
  describe('getDefaultConfigForNewApplication', () => {
    context('when not passing custom options', () => {
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
      it('should set the client package manager to npm', () => {
        expect(options.clientPackageManager).to.equal('npm');
      });
      it('should set the database type option to sql', () => {
        expect(options.databaseType).to.equal('sql');
      });
      it('should set the development database type option to h2Disk', () => {
        expect(options.devDatabaseType).to.equal('h2Disk');
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
      it('should set the message broker option to false', () => {
        expect(options.messageBroker).to.be.false;
      });
      it('should set the package folder to com/mycompany/myapp', () => {
        expect(options.packageFolder).to.equal('com/mycompany/myapp');
      });
      it('should set the package name to com.mycompany.myapp', () => {
        expect(options.packageName).to.equal('com.mycompany.myapp');
      });
      it('should set the production database type option to postgresql', () => {
        expect(options.prodDatabaseType).to.equal('postgresql');
      });
      it('should set the search engine option to false', () => {
        expect(options.searchEngine).to.be.false;
      });
      it('should set the test frameworks option to nothing', () => {
        expect(options.testFrameworks).to.have.lengthOf(0);
      });
      it('should set the websocket option to false', () => {
        expect(options.websocket).to.be.false;
      });
    });
    context('when there is no package name option but only a package folder', () => {
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
    context('when there is no package folder option but only a package name', () => {
      let packageFolderOption;

      before(() => {
        packageFolderOption = getDefaultConfigForNewApplication({
          packageName: 'a.b.c.d',
        }).packageFolder;
      });

      it('should set the package name accordingly', () => {
        expect(packageFolderOption).to.equal('a/b/c/d');
      });
    });
    context('when the client framework option is angular', () => {
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
    context('when the dto suffix option is a boolean', () => {
      let dtoSuffixOption;

      before(() => {
        dtoSuffixOption = getDefaultConfigForNewApplication({
          dtoSuffix: true,
        }).dtoSuffix;
      });

      it('should set it to DTO', () => {
        expect(dtoSuffixOption).to.equal('DTO');
      });
    });
    context('when the entity suffix option is a boolean', () => {
      let entitySuffixOption;

      before(() => {
        entitySuffixOption = getDefaultConfigForNewApplication({
          entitySuffix: true,
        }).entitySuffix;
      });

      it('should set it to an empty string', () => {
        expect(entitySuffixOption).to.equal('');
      });
    });
    context('when the database type option is MongoDB', () => {
      let devDatabaseTypeOption;
      let prodDatabaseTypeOption;
      let enableHibernateCacheOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'mongodb',
        });
        devDatabaseTypeOption = options.devDatabaseType;
        prodDatabaseTypeOption = options.prodDatabaseType;
        enableHibernateCacheOption = options.enableHibernateCache;
      });

      it('should set the devDatabaseType option to mongodb', () => {
        expect(devDatabaseTypeOption).to.equal('mongodb');
      });
      it('should set the prodDatabaseType option to mongodb', () => {
        expect(prodDatabaseTypeOption).to.equal('mongodb');
      });
      it('should set the enableHibernateCache option to false', () => {
        expect(enableHibernateCacheOption).to.be.false;
      });
    });
    context('when the database type option is couchbase', () => {
      let devDatabaseTypeOption;
      let prodDatabaseTypeOption;
      let enableHibernateCacheOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'couchbase',
        });
        devDatabaseTypeOption = options.devDatabaseType;
        prodDatabaseTypeOption = options.prodDatabaseType;
        enableHibernateCacheOption = options.enableHibernateCache;
      });

      it('should set the devDatabaseType option to couchbase', () => {
        expect(devDatabaseTypeOption).to.equal('couchbase');
      });
      it('should set the prodDatabaseType option to couchbase', () => {
        expect(prodDatabaseTypeOption).to.equal('couchbase');
      });
      it('should set the enableHibernateCache option to false', () => {
        expect(enableHibernateCacheOption).to.be.false;
      });
    });
    context('when the database type option is cassandra', () => {
      let devDatabaseTypeOption;
      let prodDatabaseTypeOption;
      let enableHibernateCacheOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'cassandra',
        });
        devDatabaseTypeOption = options.devDatabaseType;
        prodDatabaseTypeOption = options.prodDatabaseType;
        enableHibernateCacheOption = options.enableHibernateCache;
      });

      it('should set the devDatabaseType option to cassandra', () => {
        expect(devDatabaseTypeOption).to.equal('cassandra');
      });
      it('should set the prodDatabaseType option to cassandra', () => {
        expect(prodDatabaseTypeOption).to.equal('cassandra');
      });
      it('should set the enableHibernateCache option to false', () => {
        expect(enableHibernateCacheOption).to.be.false;
      });
    });
    context('when the database type option is no', () => {
      let devDatabaseTypeOption;
      let prodDatabaseTypeOption;

      before(() => {
        const options = getDefaultConfigForNewApplication({
          databaseType: 'no',
        });
        devDatabaseTypeOption = options.devDatabaseType;
        prodDatabaseTypeOption = options.prodDatabaseType;
      });

      it('should set the devDatabaseType option to no', () => {
        expect(devDatabaseTypeOption).to.equal('no');
      });
      it('should set the prodDatabaseType option to no', () => {
        expect(prodDatabaseTypeOption).to.equal('no');
      });
    });
    context('when the reactive option is set', () => {
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
  });
});
