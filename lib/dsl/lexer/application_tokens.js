/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { Lexer } = require('chevrotain');
const { createTokenFromConfig } = require('./token_creator');
const {
  KEYWORD,
  sharedCategoryTokens: { UNARY_OPTION }
} = require('./shared_tokens');

const applicationConfigCategoryToken = createTokenFromConfig({ name: 'CONFIG_KEY', pattern: Lexer.NA });

const applicationConfigTokens = [
  { name: 'BASE_NAME', pattern: 'baseName' },
  { name: 'BLUEPRINTS', pattern: 'blueprints' },
  { name: 'BLUEPRINT', pattern: 'blueprint' },
  { name: 'EMBEDDABLE_LAUNCH_SCRIPT', pattern: 'embeddableLaunchScript' },
  { name: 'CREATION_TIMESTAMP', pattern: 'creationTimestamp' },
  { name: 'OTHER_MODULES', pattern: 'otherModules' },
  { name: 'PACKAGE_NAME', pattern: 'packageName' },
  { name: 'AUTHENTICATION_TYPE', pattern: 'authenticationType' },
  { name: 'CACHE_PROVIDER', pattern: 'cacheProvider' },
  { name: 'ENABLE_HIBERNATE_CACHE', pattern: 'enableHibernateCache' },
  { name: 'WEBSOCKET', pattern: 'websocket' },
  { name: 'DATABASE_TYPE', pattern: 'databaseType' },
  { name: 'DEV_DATABASE_TYPE', pattern: 'devDatabaseType' },
  { name: 'PROD_DATABASE_TYPE', pattern: 'prodDatabaseType' },
  { name: 'BUILD_TOOL', pattern: 'buildTool' },
  { name: 'SEARCH_ENGINE', pattern: 'searchEngine' },
  { name: 'ENABLE_TRANSLATION', pattern: 'enableTranslation' },
  { name: 'APPLICATION_TYPE', pattern: 'applicationType' },
  { name: 'TEST_FRAMEWORKS', pattern: 'testFrameworks' },
  { name: 'UAA_BASE_NAME', pattern: 'uaaBaseName' },
  { name: 'LANGUAGES', pattern: 'languages' },
  { name: 'SERVER_PORT', pattern: 'serverPort' },
  { name: 'USE_SASS', pattern: 'useSass' },
  { name: 'JHI_PREFIX', pattern: 'jhiPrefix' },
  { name: 'JWT_SECRET_KEY', pattern: 'jwtSecretKey' },
  { name: 'JHIPSTER_VERSION', pattern: 'jhipsterVersion' },
  { name: 'MESSAGE_BROKER', pattern: 'messageBroker' },
  { name: 'CLIENT_PACKAGE_MANAGER', pattern: 'clientPackageManager' },
  { name: 'CLIENT_FRAMEWORK', pattern: 'clientFramework' },
  { name: 'CLIENT_THEME_VARIANT', pattern: 'clientThemeVariant' },
  { name: 'CLIENT_THEME', pattern: 'clientTheme' },
  { name: 'NATIVE_LANGUAGE', pattern: 'nativeLanguage' },
  { name: 'FRONT_END_BUILDER', pattern: 'frontendBuilder' },
  { name: 'SKIP_USER_MANAGEMENT', pattern: 'skipUserManagement' },
  { name: 'ENABLE_SWAGGER_CODEGEN', pattern: 'enableSwaggerCodegen' },
  { name: 'REACTIVE', pattern: 'reactive' },
  { name: 'ENTITY_SUFFIX', pattern: 'entitySuffix' },
  { name: 'DTO_SUFFIX', pattern: 'dtoSuffix' },
  { name: 'SKIP_CLIENT', pattern: 'skipClient' },
  { name: 'SKIP_SERVER', pattern: 'skipServer' }
].map(tokenConfig => {
  tokenConfig.categories = [applicationConfigCategoryToken];
  // This is actually needed as the skipClient & skipServer options are both entity & app options...
  if (['SKIP_CLIENT', 'SKIP_SERVER'].includes(tokenConfig.name)) {
    tokenConfig.categories.push(KEYWORD);
    tokenConfig.categories.push(UNARY_OPTION);
  }
  return createTokenFromConfig(tokenConfig);
});

module.exports = {
  categoryToken: applicationConfigCategoryToken,
  tokens: [applicationConfigCategoryToken, ...applicationConfigTokens]
};
