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

import { createBase64Secret, createReproducibleBase64Secret, createReproducibleSecret, createSecret } from './secret.ts';

describe('lib > utils > secret', () => {
  describe('createReproducibleSecret', () => {
    it('derives the same secret from the same seed and purpose', () => {
      expect(createReproducibleSecret(1703451113582, 'rememberMeKey')).toBe(createReproducibleSecret(1703451113582, 'rememberMeKey'));
    });
    it('has the format and the length of a random secret', () => {
      const secret = createReproducibleSecret(1703451113582, 'rememberMeKey');
      expect(secret.length).toBe(createSecret().length);
      expect(secret).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('createReproducibleBase64Secret', () => {
    it('derives the same secret from the same seed', () => {
      expect(createReproducibleBase64Secret(1703451113582, 'jwtSecretKey', 64)).toBe(
        createReproducibleBase64Secret(1703451113582, 'jwtSecretKey', 64),
      );
    });
    it('derives different secrets from different seeds or purposes', () => {
      const secret = createReproducibleBase64Secret(1703451113582, 'jwtSecretKey', 64);
      expect(createReproducibleBase64Secret(1703451113583, 'jwtSecretKey', 64)).not.toBe(secret);
      expect(createReproducibleBase64Secret(1703451113582, 'other', 64)).not.toBe(secret);
    });
    it('has the format and the length of a random secret', () => {
      const secret = createReproducibleBase64Secret(1703451113582, 'jwtSecretKey', 64);
      expect(secret.length).toBe(createBase64Secret(64).length);
      expect(Buffer.from(secret, 'base64').toString()).toMatch(/^[0-9a-f]{128}$/);
    });
  });
});
