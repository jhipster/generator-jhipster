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
import { describe, expect, it } from 'esmocha';

import { convertConfigToCliOption, formatOptionFlags } from './converter.ts';

describe('command - converter', () => {
  describe('formatOptionFlags', () => {
    it('should give a boolean option no value', () => {
      expect(formatOptionFlags('skip-client', { type: Boolean })).toBe('--skip-client');
    });

    it('should give a value to the other types, optional when not required', () => {
      expect(formatOptionFlags('base-name', { type: String })).toBe('--base-name <value>');
      expect(formatOptionFlags('server-port', { type: Number, required: false })).toBe('--server-port [value]');
    });

    it('should give a list of values to an array', () => {
      expect(formatOptionFlags('test-frameworks', { type: Array })).toBe('--test-frameworks <value...>');
      expect(formatOptionFlags('test-frameworks', { type: Array, required: false })).toBe('--test-frameworks [value...]');
    });

    it('should put the alias first', () => {
      expect(formatOptionFlags('debug', { type: Boolean, alias: 'd' })).toBe('-d, --debug');
    });
  });

  describe('convertConfigToCliOption', () => {
    it('should name the option after the config, or after its cli name', () => {
      expect(convertConfigToCliOption('skipClient', { cli: { type: Boolean }, scope: 'storage' })).toMatchObject({
        optionName: 'skip-client',
        option: { type: Boolean },
      });
      expect(convertConfigToCliOption('authenticationType', { cli: { name: 'auth', type: String }, scope: 'storage' })?.optionName).toBe(
        'auth',
      );
    });

    it('should give no option to a config without cli', () => {
      expect(convertConfigToCliOption('validateBaseName', { internal: { type: Function }, scope: 'generator' })).toBeUndefined();
      expect(
        convertConfigToCliOption('jhipsterVersion', { jdl: { type: 'string', tokenType: 'STRING' }, scope: 'storage' }),
      ).toBeUndefined();
    });
  });
});
