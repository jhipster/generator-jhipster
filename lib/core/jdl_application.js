'use strict';

const merge = require('../utils/object_utils').merge,
  buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

class JDLApplication {
  constructor(args) {
    const merged = merge(defaults(), args);
    this.baseName = merged.baseName;
    this.packageName = merged.packageName;
    this.packageFolder = merged.packageFolder;
    this.authenticationType = merged.authenticationType;
    this.hibernateCache = merged.hibernateCache;
    this.clusteredHttpSession = merged.clusteredHttpSession;
    this.websocket = merged.websocket;
    this.databaseType = merged.databaseType;
    this.devDatabaseType = merged.devDatabaseType;
    this.prodDatabaseType = merged.prodDatabaseType;
    this.useCompass = merged.useCompass;

  }
}

function defaults() {
  return {
    baseName: 'jhipster',
    packageName: 'io.github.jhipster',
    packageFolder: 'io/github/jhipster',
    authenticationType: 'session',
    hibernateCache: 'no',
    clusteredHttpSession: 'no',
    websocket: false,
    databaseType: 'sql',
    devDatabaseType: 'h2Memory',
    prodDatabaseType: 'mysql',
    useCompass: false,
    buildTool: 'maven',
    searchEngine: false,
    enableTranslation: true,
    applicationType: 'monolith',
    testFrameworks: ['gatling', 'protactor'],
    languages: ['en'],
    serverPort: 8080,
    enableSocialSignIn: false,
    useSass: false,
    jhiPrefix: 'jhi',
    messageBroker: false,
    serviceDiscoveryType: false,
    clientPackageManager: 'yarn',
    clientFramework: 'angular1',
    nativeLanguage: 'en',
    frontEndBuilder: null,
    skipUserManagement: false,
    skipClient: false,
    skipServer: false
  };
}

module.exports = JDLApplication;
