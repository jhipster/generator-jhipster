/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { createJHipsterLogger } from '../../../../utils/logger.ts';

const logger = createJHipsterLogger({ namespace: 'jhipster:jdl' });

export default {
  info: (message: string) => logger.verboseInfo(message),
  error: (message: string) => logger.error(message),
  warn: (message: string) => logger.warn(message),
  debug: (message: string) => logger.debug(message),
};
