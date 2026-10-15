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

/**
 * The options of a generator to give to the generator of another project: without the blueprints options, which belong to
 * the project they are given for, the other one using the blueprints of its own .yo-rc.json.
 */
export const optionsForAnotherProject = <T extends Record<string, any>>({
  blueprints: _blueprints,
  blueprint: _blueprint,
  ...options
}: T & { blueprints?: unknown; blueprint?: unknown }): Omit<T, 'blueprints' | 'blueprint'> => options;
