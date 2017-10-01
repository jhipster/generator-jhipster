const crypto = require('crypto');
const mergeObjects = require('../utils/object_utils').merge;
const Set = require('../utils/objects/set');
const ApplicationErrorCases = require('../exceptions/error_cases').ErrorCases.applications;

class JDLApplication {
  constructor(args) {
    const merged = merge(args);
    this.config = {};
    Object.keys(merged.config).forEach((option) => {
      if (Array.isArray(merged.config[option]) && (option === 'languages' || option === 'testFrameworks')) {
        this.config[option] = new Set(merged.config[option]);
      } else {
        this.config[option] = merged.config[option];
      }
    });
    if (this.config.authenticationType === 'jwt' || this.config.applicationType === 'microservice') {
      this.config.jwtSecretKey = crypto.randomBytes(20).toString('hex');
    }
  }

  static checkValidity(application) {
    const errors = [];
    if (!application || !application.config) {
      errors.push(ApplicationErrorCases.NoApplication);
      return errors;
    }
    if (!application.config.baseName) {
      errors.push(ApplicationErrorCases.NoName);
    }
    if (!application.config.packageName || !application.config.packageFolder) {
      errors.push(ApplicationErrorCases.NoPackageNameOrFolder);
    }
    if (!application.config.authenticationType) {
      errors.push(ApplicationErrorCases.NoAuthenticationType);
    }
    if (!application.config.hibernateCache) {
      errors.push(ApplicationErrorCases.NoHibernateCache);
    }
    if (!application.config.databaseType) {
      errors.push(ApplicationErrorCases.NoDatabaseType);
    }
    if (!application.config.devDatabaseType) {
      errors.push(ApplicationErrorCases.NoDevDatabaseType);
    }
    if (!application.config.prodDatabaseType) {
      errors.push(ApplicationErrorCases.NoProdDatabaseType);
    }
    if (!application.config.buildTool) {
      errors.push(ApplicationErrorCases.NoBuildTool);
    }
    if (!application.config.applicationType) {
      errors.push(ApplicationErrorCases.NoApplicationType);
    }
    if (!application.config.clientFramework) {
      errors.push(ApplicationErrorCases.NoClientFramework);
    }
    if (application.config.enableTranslation && !application.config.nativeLanguage) {
      errors.push(ApplicationErrorCases.NoChosenLanguage);
    }
    return errors;
  }

  static isValid(application) {
    const errors = this.checkValidity(application);
    return errors.length === 0;
  }

  toString() {
    return `application {\n${stringifyConfig(this.config)}\n}`;
  }
}

function stringifyConfig(applicationConfig) {
  let config = '  config {';
  Object.keys(applicationConfig).forEach((option) => {
    config = `${config}\n    ${option}${stringifyOptionValue(option, applicationConfig[option])}`;
  });
  return `${config.replace(/[[\]]/g, '')}\n  }`;
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
  if (args.config) {
    if (!args.config.packageName && args.config.packageFolder) {
      args.config.packageName = args.config.packageFolder.replace(/\//g, '.');
    }
    if (!args.config.packageFolder && args.config.packageName) {
      args.config.packageFolder = args.config.packageName.replace(/\./g, '/');
    }
  }
  return {
    config: mergeObjects(defaults().config, args.config)
  };
}

function defaults() {
  return {
    config: {
      baseName: 'jhipster',
      path: 'jhipster',
      packageName: 'com.mycompany.myapp',
      packageFolder: 'com/mycompany/myapp',
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
    }
  };
}

module.exports = JDLApplication;
