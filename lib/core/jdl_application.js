'use strict';

const merge = require('../utils/object_utils').merge,
  isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
  _ = require('lodash');

class JDLApplication {
  constructor(args) {
    const merged = merge(defaults(), args);
    for (let option in merged) {
      this[option] = merged[option];
    }
  }

  toString() {
    let application = 'application {';
    for (let option in this) {
      application = `${application}\n  ${option} ${_.isArray(this[option]) ? `${this[option].join(', ')}` : this[option]}`;
    }
    return `${application}\n}`;
  }
}

function defaults() {
  return {
    baseName: 'jhipster',
    path: 'jhipster',
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
