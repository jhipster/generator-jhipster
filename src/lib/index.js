const constants = require('../generators/generator-constants');

const GeneratorBase = require('../generators/generator-base');
const GeneratorBaseBlueprint = require('../generators/generator-base-blueprint');
const GeneratorBaseEntities = require('../generators/generator-base-entities.cjs');

const AppGenerator = require('../generators/app');
const ClientGenerator = require('../generators/client');
const CommonGenerator = require('../generators/common');
const CypressGenerator = require('../generators/cypress');
const EntitiesGenerator = require('../generators/entities');
const EntitiesClientGenerator = require('../generators/entities-client');
const EntityGenerator = require('../generators/entity');
const EntityClientGenerator = require('../generators/entity-client');
const EntityServerGenerator = require('../generators/entity-server');
const LanguagesGenerator = require('../generators/languages');
const PageGenerator = require('../generators/page');
const ServerGenerator = require('../generators/server');
const SpringControllerGenerator = require('../generators/spring-controller');
const SpringServiceGenerator = require('../generators/spring-service');

module.exports = {
  constants,

  GeneratorBase,
  GeneratorBaseBlueprint,
  GeneratorBaseEntities,

  AppGenerator,
  ClientGenerator,
  CommonGenerator,
  CypressGenerator,
  EntitiesGenerator,
  EntitiesClientGenerator,
  EntityGenerator,
  EntityClientGenerator,
  EntityServerGenerator,
  LanguagesGenerator,
  PageGenerator,
  ServerGenerator,
  SpringControllerGenerator,
  SpringServiceGenerator,
};
