// Use require to workaround https://github.com/esbuild-kit/esm-loader/issues/41
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export const applicationOptions = require('./application-options');
export const applicationTypes = require('./application-types');
export const authenticationTypes = require('./authentication-types');
export const binaryOptions = require('./binary-options');
export const buildToolTypes = require('./build-tool-types');
export const cacheTypes = require('./cache-types');
export const clientFrameworkTypes = require('./client-framework-types');
export const databaseTypes = require('./database-types');
export const defaultApplicationOptions = require('./default-application-options');
export const deploymentOptions = require('./deployment-options');
export const entityOptions = require('./entity-options');
export const entityTableNameCreator = require('./entity-table-name-creator');
export const fieldTypes = require('./field-types');
export const jsonEntity = require('./json-entity');
export const kubernetesPlatformTypes = require('./kubernetes-platform-types');
export const messageBrokerTypes = require('./message-broker-types');
export const monitoringTypes = require('./monitoring-types');
export const openapiOptions = require('./openapi-options');
export const openshiftPlatformTypes = require('./openshift-platform-types');
export const relationshipOptions = require('./relationship-options');
export const relationshipTypes = require('./relationship-types');
export const reservedKeywords = require('./reserved-keywords');
export const searchEngineTypes = require('./search-engine-types');
export const serviceDiscoveryTypes = require('./service-discovery-types');
export const testFrameworkTypes = require('./test-framework-types');
export const unaryOptions = require('./unary-options');
export const validations = require('./validations');
export const websocketTypes = require('./websocket-types');
