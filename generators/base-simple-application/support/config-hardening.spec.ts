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

import { sanitizeConfigForNodeApplications } from './config-hardening.ts';

describe('generator - base-simple-application - support - config-hardening', () => {
  const template = '$' + '{injected}';

  it('sanitizes writable string properties and returns cleanup entries', () => {
    const config: any = {
      foo: `prefix-${template}-suffix`,
      untouched: 123,
    };

    const cleanups = sanitizeConfigForNodeApplications(config);

    expect(config.foo).toBe('prefix--suffix');
    expect(config.untouched).toBe(123);
    expect(cleanups).toEqual({
      foo: { oldValue: `prefix-${template}-suffix`, newValue: 'prefix--suffix' },
    });
  });

  it('does not fail on non-writable properties', () => {
    const config = {} as Record<string, string>;

    Object.defineProperty(config, 'readOnlyProperty', {
      value: `value-${template}`,
      writable: false,
      enumerable: true,
      configurable: true,
    });

    const cleanups = sanitizeConfigForNodeApplications(config);

    expect(config.readOnlyProperty).toBe(`value-${template}`);
    expect(cleanups).toEqual({});
  });

  it('does not recurse by default when depth is 0', () => {
    const config: any = {
      nested: {
        child: `value-${template}`,
      },
    };

    const cleanups = sanitizeConfigForNodeApplications(config);

    expect(config.nested.child).toBe(`value-${template}`);
    expect(cleanups).toEqual({});
  });

  it('recurses through objects and arrays when depth allows it', () => {
    const config: any = {
      objectChild: {
        nestedValue: `object-${template}`,
      },
      arrayChild: [{ nestedValue: `array-${template}` }, `string-${template}`],
    };

    const cleanups = sanitizeConfigForNodeApplications(config, { depth: -1, keyPath: 'root' });

    expect(config.objectChild.nestedValue).toBe('object-');
    expect(config.arrayChild[0].nestedValue).toBe('array-');
    expect(config.arrayChild[1]).toBe(`string-${template}`);
    expect(cleanups).toEqual({
      'root.objectChild.nestedValue': { oldValue: `object-${template}`, newValue: 'object-' },
      'root.arrayChild.nestedValue': { oldValue: `array-${template}`, newValue: 'array-' },
    });
  });

  it('respects depth countdown for nested objects', () => {
    const config: any = {
      level1: {
        level2: {
          value: `deep-${template}`,
        },
      },
    };

    sanitizeConfigForNodeApplications(config, { depth: 1 });

    expect(config.level1.level2.value).toBe(`deep-${template}`);
  });
});
