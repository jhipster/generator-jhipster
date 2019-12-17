/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const { OptionNames, OptionValues } = require('./new_application_options');

module.exports = {
  getDefaultConfigForNewApplication
};

function getDefaultConfigForNewApplication() {
  return {
    [OptionNames.BASE_NAME]: OptionValues[OptionNames.BASE_NAME],
    [OptionNames.BUILD_TOOL]: OptionValues[OptionNames.BUILD_TOOL].maven,
    [OptionNames.DATABASE_TYPE]: OptionValues[OptionNames.DATABASE_TYPE].sql,
    [OptionNames.DEV_DATABASE_TYPE]: OptionValues[OptionNames.DEV_DATABASE_TYPE].h2Disk,
    [OptionNames.ENABLE_HIBERNATE_CACHE]: OptionValues[OptionNames.ENABLE_HIBERNATE_CACHE],
    [OptionNames.ENABLE_SWAGGER_CODEGEN]: OptionValues[OptionNames.ENABLE_SWAGGER_CODEGEN],
    [OptionNames.ENABLE_TRANSLATION]: OptionValues[OptionNames.ENABLE_TRANSLATION],
    [OptionNames.JHI_PREFIX]: OptionValues[OptionNames.JHI_PREFIX],
    [OptionNames.LANGUAGES]: OptionValues[OptionNames.LANGUAGES],
    [OptionNames.MESSAGE_BROKER]: OptionValues[OptionNames.MESSAGE_BROKER].false,
    [OptionNames.NATIVE_LANGUAGE]: OptionValues[OptionNames.NATIVE_LANGUAGE],
    [OptionNames.PACKAGE_NAME]: OptionValues[OptionNames.PACKAGE_NAME],
    [OptionNames.PACKAGE_FOLDER]: OptionValues[OptionNames.PACKAGE_FOLDER],
    [OptionNames.PROD_DATABASE_TYPE]: OptionValues[OptionNames.PROD_DATABASE_TYPE].mysql,
    [OptionNames.SEARCH_ENGINE]: OptionValues[OptionNames.SEARCH_ENGINE].false,
    [OptionNames.SERVICE_DISCOVERY_TYPE]: false, // default value for this is treated specially based on application type
    [OptionNames.SKIP_CLIENT]: OptionValues[OptionNames.SKIP_CLIENT],
    [OptionNames.SKIP_SERVER]: OptionValues[OptionNames.SKIP_SERVER],
    [OptionNames.SKIP_USER_MANAGEMENT]: OptionValues[OptionNames.SKIP_USER_MANAGEMENT],
    [OptionNames.TEST_FRAMEWORKS]: [],
    [OptionNames.WEBSOCKET]: OptionValues[OptionNames.WEBSOCKET].false
  };
}
