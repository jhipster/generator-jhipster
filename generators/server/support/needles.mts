/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import BaseGenerator from '../../base/index.mjs';
import { createBaseNeedle } from '../../base/support/needles.mjs';
import { SpringBootApplication } from '../types.mjs';

type ApplicationPropertiesNeedles = {
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
 *     proppertyGetter: `
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
// eslint-disable-next-line import/prefer-default-export
export function insertContentIntoApplicationProperties(
  this: BaseGenerator | void,
  application: SpringBootApplication,
  needles: ApplicationPropertiesNeedles
) {
  if (this) {
    return createBaseNeedle.call(
      this,
      {
        filePath: `${application.javaPackageSrcDir}config/ApplicationProperties.java`,
        needlesPrefix: 'application-properties',
      },
      needles
    );
  }
  return createBaseNeedle(
    {
      needlesPrefix: 'application-properties',
    },
    needles
  );
}
