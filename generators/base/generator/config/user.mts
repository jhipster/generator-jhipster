/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import authenticationTypes from '../../../../jdl/jhipster/authentication-types.js';
import databaseTypes from '../../../../jdl/jhipster/database-types.js';

const { NO: NO_DATABASE } = databaseTypes;
const { OAUTH2 } = authenticationTypes;

const isBuiltInUserConfiguration = (config: any): boolean => {
  return (
    !config ||
    (!config.skipUserManagement && config.databaseType !== NO_DATABASE) ||
    (config.authenticationType === OAUTH2 && config.databaseType !== NO_DATABASE)
  );
};

export default isBuiltInUserConfiguration;
