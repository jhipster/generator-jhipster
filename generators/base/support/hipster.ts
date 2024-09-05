/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { stringHashCode } from '../../../lib/utils/string.js';

/**
 * get a hipster based on the applications name.
 * @param baseName of application
 */
export default function getHipster(baseName: string): string {
  const hash = stringHashCode(baseName);

  switch (hash % 4) {
    case 0:
      return 'jhipster_family_member_0';
    case 1:
      return 'jhipster_family_member_1';
    case 2:
      return 'jhipster_family_member_2';
    case 3:
      return 'jhipster_family_member_3';
    default:
      return 'jhipster_family_member_0';
  }
}
