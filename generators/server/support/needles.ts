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
import assert from 'node:assert';

import type { CascatedEditFileCallback } from '../../base-core/api.ts';
import type CoreGenerator from '../../base-core/index.ts';
import type { NeedleCallback } from '../../base-core/support/needles.ts';
import { createBaseNeedle } from '../../base-core/support/needles.ts';

export type ApplicationPropertiesNeedles = {
  property?: string;
  propertyGetter?: string;
  propertyClass?: string;
};

/**
 * Insert content into ApplicationProperties class
 * @example
 * insertContentIntoApplicationProperties.call(generator, application, {
 *   property: 'private final bar = new Bar();',
 *   proppertyGetter: `
 * public getBar() {
 *     return bar;
 * }`,
 *   propertyClass: `
 * public static class Async {
 *     private String foo = "default";
 * }`,
 * })
 * @example
 * generator.editFile(
 *   'ApplicationProperties.java',
 *   insertContentIntoApplicationProperties({
 *     property: 'private final bar = new Bar();',
 *     propertyGetter: `
 * public getBar() {
 *     return bar;
 * }`,
 *     propertyClass: `
 * public static class Async {
 *     private String foo = "default";
 * }`,
 *   });
 * );
 */
export function insertContentIntoApplicationProperties(needles: ApplicationPropertiesNeedles): NeedleCallback;
export function insertContentIntoApplicationProperties(
  this: CoreGenerator,
  application: { javaPackageSrcDir: string },
  needles: ApplicationPropertiesNeedles,
): NeedleCallback;
export function insertContentIntoApplicationProperties(
  this: CoreGenerator | void,
  application: { javaPackageSrcDir: string } | ApplicationPropertiesNeedles,
  needles?: ApplicationPropertiesNeedles,
): NeedleCallback | CascatedEditFileCallback {
  if (needles) {
    assert.ok(this, 'Generator context is required');

    return createBaseNeedle.call(
      this,
      {
        filePath: `${(application as { javaPackageSrcDir: string }).javaPackageSrcDir}config/ApplicationProperties.java`,
        needlesPrefix: 'application-properties',
      },
      needles,
    );
  }
  return createBaseNeedle(
    {
      needlesPrefix: 'application-properties',
    },
    application as ApplicationPropertiesNeedles,
  );
}
