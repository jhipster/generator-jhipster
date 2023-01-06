import path from 'path';
import fse from 'fs-extra';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { getTemplatePath } from './get-template-path.mjs';

import GeneratorBase from '../../generators/base/index.mjs';
import { getConfigWithDefaults } from '../../jdl/jhipster/default-application-options.js';

const { loadDerivedAppConfig, loadDerivedServerConfig } = GeneratorBase.prototype;

const writeCallbacks = (filePath, ...callbacks) => {
  let content;
  try {
    content = readFileSync(filePath).toString();
    // eslint-disable-next-line no-empty
  } catch (_error) {}
  for (const callback of callbacks) {
    content = callback(content, filePath);
  }
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
  return (...callbacks) => writeCallbacks(filePath, ...callbacks);
};

export const deploymentTestSamples = {
  '01-gateway': {
    applicationType: 'gateway',
    baseName: 'jhgate',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    serviceDiscoveryType: 'eureka',
    serverPort: 8080,
  },
  '02-mysql': {
    applicationType: 'microservice',
    baseName: 'msmysql',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    serviceDiscoveryType: 'eureka',
    serverPort: 8081,
  },
  '03-psql': {
    applicationType: 'microservice',
    baseName: 'mspsql',
    databaseType: 'sql',
    prodDatabaseType: 'postgresql',
    searchEngine: 'elasticsearch',
    serviceDiscoveryType: 'eureka',
    serverPort: 8081,
  },
  '04-mongo': {
    applicationType: 'microservice',
    baseName: 'msmongodb',
    databaseType: 'mongodb',
    prodDatabaseType: 'mongodb',
    serverPort: 8081,
  },
  '05-cassandra': {
    applicationType: 'microservice',
    baseName: 'mscassandra',
    databaseType: 'cassandra',
    prodDatabaseType: 'cassandra',
    serverPort: 8081,
  },
  '07-mariadb': {
    applicationType: 'microservice',
    baseName: 'msmariadb',
    databaseType: 'sql',
    prodDatabaseType: 'mariadb',
    serverPort: 8081,
  },
  '08-monolith': {
    applicationType: 'monolith',
    baseName: 'sampleMysql',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    searchEngine: 'elasticsearch',
    serverPort: 8080,
    rememberMeKey: '2bb60a80889aa6e6767e9ccd8714982681152aa5',
    authenticationType: 'session',
  },
  '09-kafka': {
    applicationType: 'monolith',
    baseName: 'sampleKafka',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    serverPort: 8080,
    messageBroker: 'kafka',
    authenticationType: 'session',
  },
  '10-couchbase': {
    applicationType: 'microservice',
    baseName: 'mscouchbase',
    databaseType: 'couchbase',
    prodDatabaseType: 'couchbase',
    serviceDiscoveryType: 'eureka',
    serverPort: 8081,
  },
  '11-mssql': {
    applicationType: 'microservice',
    baseName: 'msmssqldb',
    databaseType: 'sql',
    prodDatabaseType: 'mssql',
    serverPort: 8081,
  },
  '12-oracle': {
    applicationType: 'monolith',
    baseName: 'oracle-mono',
    databaseType: 'sql',
    prodDatabaseType: 'oracle',
    serverPort: 8080,
    skipClient: true,
  },
};

const createMockedConfig = (sampleDir, testDir, { appDir = sampleDir, config = {} } = {}) => {
  const generator = {
    testDir,
    editFile(filePath, ...callbacks) {
      return writeCallbacks(filePath, ...callbacks);
    },
  };
  if (appDir) {
    appDir = `${appDir}/`;
  }

  mkdirSync(`${appDir}target/jib-cache`, { recursive: true });

  let appConfig = deploymentTestSamples[sampleDir];
  if (!appConfig) {
    throw new Error(`Sample ${sampleDir} not found`);
  }
  appConfig = getConfigWithDefaults({ packageName: 'com.mycompany.myapp', ...appConfig, ...config });
  generator.editFile(`${appDir}.yo-rc.json`, () => JSON.stringify({ 'generator-jhipster': { ...appConfig, mockAppConfig: undefined } }));
  Object.assign(generator, appConfig);
  loadDerivedAppConfig.call(GeneratorBase.prototype, generator);
  loadDerivedServerConfig.call(GeneratorBase.prototype, generator);

  if (appConfig.mockAppConfig) {
    appConfig.mockAppConfig(generator, appDir, testDir);
  } else {
    fse.copySync(getTemplatePath(`compose/${sampleDir}`), path.join(testDir, appDir));
  }

  return generator;
};

export default createMockedConfig;
