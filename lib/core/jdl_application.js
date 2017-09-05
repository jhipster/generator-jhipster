const mergeObjects = require('../utils/object_utils').merge;
const Set = require('../utils/objects/set');
const ApplicationErrorCases = require('../exceptions/error_cases').ErrorCases.applications;

class JDLApplication {
  constructor(args) {
    const merged = merge(args);
    Object.keys(merged).forEach((option) => {
      if (Array.isArray(merged[option]) && (option === 'languages' || option === 'testFrameworks')) {
        this[option] = new Set(merged[option]);
      } else {
        this[option] = merged[option];
      }
    });
  }

  static checkValidity(application) {
    const errors = [];
    if (!application) {
      errors.push(ApplicationErrorCases.NoApplication);
      return errors;
    }
    if (!application.baseName) {
      errors.push(ApplicationErrorCases.NoName);
    }
    if (!application.packageName || !application.packageFolder) {
      errors.push(ApplicationErrorCases.NoPackageNameOrFolder);
    }
    if (!application.authenticationType) {
      errors.push(ApplicationErrorCases.NoAuthenticationType);
    }
    if (!application.hibernateCache) {
      errors.push(ApplicationErrorCases.NoHibernateCache);
    }
    if (!application.databaseType) {
      errors.push(ApplicationErrorCases.NoDatabaseType);
    }
    if (!application.devDatabaseType) {
      errors.push(ApplicationErrorCases.NoDevDatabaseType);
    }
    if (!application.prodDatabaseType) {
      errors.push(ApplicationErrorCases.NoProdDatabaseType);
    }
    if (!application.buildTool) {
      errors.push(ApplicationErrorCases.NoBuildTool);
    }
    if (!application.applicationType) {
      errors.push(ApplicationErrorCases.NoApplicationType);
    }
    if (!application.clientFramework) {
      errors.push(ApplicationErrorCases.NoClientFramework);
    }
    if (application.enableTranslation && !application.nativeLanguage) {
      errors.push(ApplicationErrorCases.NoChosenLanguage);
    }
    return errors;
  }

  static isValid(application) {
    const errors = this.checkValidity(application);
    return errors.length === 0;
  }

  toString() {
    let application = 'application {\n  config {';
    Object.keys(this).forEach((option) => {
      application = `${application}\n    ${option}${stringifyOptionValue(option, this[option])}`;
    });
    return `${application.replace(/[[\]]/g, '')}\n  }\n}`;
  }
}

function stringifyOptionValue(name, value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (value === null || value === undefined || (name === 'testFrameworks' && value.size() === 0)) {
    return '';
  }
  return ` ${value}`;
}

function merge(args) {
  if (!args.packageName && args.packageFolder) {
    args.packageName = args.packageFolder.replace(/\//g, '.');
  }
  if (!args.packageFolder && args.packageName) {
    args.packageFolder = args.packageName.replace(/\./g, '/');
  }
  return mergeObjects(defaults(), args);
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
    testFrameworks: new Set([]),
    languages: new Set(['en']),
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
