const path = require('path');
const fse = require('fs-extra');
const { writeFileSync, mkdirSync, readFileSync } = require('fs');

const GeneratorBase = require('../../generators/generator-base');

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

const applications = {
  '01-gateway': {
    applicationType: 'gateway',
    baseName: 'jhgate',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    serviceDiscoveryType: 'eureka',
  },
  '02-mysql': {
    applicationType: 'microservice',
    baseName: 'msmysql',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    serviceDiscoveryType: 'eureka',
  },
  '03-psql': {
    applicationType: 'microservice',
    baseName: 'mspsql',
    databaseType: 'sql',
    prodDatabaseType: 'postgresql',
    searchEngine: 'elasticsearch',
  },
  '04-mongo': {
    applicationType: 'microservice',
    baseName: 'msmongodb',
    databaseType: 'mongodb',
  },
  '05-cassandra': {
    applicationType: 'microservice',
    baseName: 'mscassandra',
    databaseType: 'cassandra',
  },
  '07-mariadb': {
    applicationType: 'microservice',
    baseName: 'msmariadb',
    databaseType: 'sql',
    prodDatabaseType: 'mariadb',
  },
  '08-monolith': {
    applicationType: 'monolith',
    baseName: 'sampleMysql',
    databaseType: 'sql',
    prodDatabaseType: 'mysql',
    searchEngine: 'elasticsearch',
  },
  '10-couchbase': {
    applicationType: 'microservice',
    baseName: 'mscouchbase',
    databaseType: 'couchbase',
  },
  '12-oracle': {
    applicationType: 'monolith',
    baseName: 'oracle-mono',
    databaseType: 'sql',
    prodDatabaseType: 'oracle',
  },
};

const createMockedConfig = (appDir, testDir) => {
  const generator = {
    testDir,
    editFile(filePath, ...callbacks) {
      return writeCallbacks(filePath, ...callbacks);
    },
  };

  mkdirSync(`${appDir}/target/jib-cache`, { recursive: true });

  const appConfig = applications[appDir];
  generator.editFile(`${appDir}/.yo-rc.json`, () => JSON.stringify({ 'generator-jhipster': { ...appConfig, mockAppConfig: undefined } }));
  Object.assign(generator, appConfig);
  loadDerivedAppConfig.call(GeneratorBase.prototype, generator);
  loadDerivedServerConfig.call(GeneratorBase.prototype, generator);

  if (appConfig.mockAppConfig) {
    appConfig.mockAppConfig(generator, appDir, testDir);
  } else {
    fse.copySync(path.join(__dirname, `../templates/compose/${appDir}`), path.join(testDir, appDir));
  }

  return generator;
};

module.exports = {
  createMockedConfig,
};
