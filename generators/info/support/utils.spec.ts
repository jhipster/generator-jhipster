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

import { describe, expect, it } from 'expect-node';

import { replaceSensitiveConfig } from './utils.ts';

describe('replaceSensitiveConfig', () => {
  it('should omit the secrets of the configuration', () => {
    const yoRc = {
      'generator-jhipster': {
        baseName: 'jhipster',
        jwtSecretKey: 'jwt-secret',
        rememberMeKey: 'remember-me',
        consulGossipKey: 'gossip-key',
      },
    };
    expect(JSON.parse(JSON.stringify(replaceSensitiveConfig(yoRc)))).toEqual({ 'generator-jhipster': { baseName: 'jhipster' } });
  });
});
