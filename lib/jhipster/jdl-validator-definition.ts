/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import type { JDLValidatorOption } from '../jdl/core/types/parsing.ts';

const BASIC_NPM_PACKAGE_NAME_PATTERN = /^(@[a-z0-9-][a-z0-9-._]*\/)?[a-z0-9-][a-z0-9-._]*$/;

export const builtInConfigPropsValidations: Record<string, JDLValidatorOption> = {
  BLUEPRINT: {
    type: 'NAME',
    pattern: BASIC_NPM_PACKAGE_NAME_PATTERN,
    msg: 'blueprint property',
  },
  BLUEPRINTS: {
    type: 'list',
    pattern: BASIC_NPM_PACKAGE_NAME_PATTERN,
    msg: 'blueprints property',
  },
  // DEPRECATED: stamped by the generator, not a user option. TODO drop for v10.
  JHIPSTER_VERSION: { type: 'STRING' },
  SKIP_CLIENT: { type: 'BOOLEAN' },
  SKIP_SERVER: { type: 'BOOLEAN' },
};
