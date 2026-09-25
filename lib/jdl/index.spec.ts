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

// Only what `generator-jhipster/jdl` exports: what a tool reading a jdl has.
import {
  type JDLDefinitions,
  buildJDLApplicationConfig,
  createImporterFromContent,
  createJDLRuntime,
  getDefaultJDLDefinitions,
  parseJDL,
} from './index.ts';

const defaults = getDefaultJDLDefinitions();
/** The JHipster entity options, and one more. */
const entity: JDLDefinitions['entity'] = {
  configs: { ...defaults.entity.configs, audited: { description: 'Audited entities', jdl: { type: 'unary' } } },
};
const importerConfiguration = { applicationName: 'jhipster', databaseType: 'sql' };

describe('jdl - generator-jhipster/jdl', () => {
  it('parses a jdl with the JHipster definitions', () => {
    const { ast, diagnostics } = parseJDL('entity A\ndto A with mapstruct', createJDLRuntime());
    expect(diagnostics).toEqual([]);
    expect(ast?.entities.map(({ name }) => name)).toEqual(['A']);
  });

  it('parses a jdl with definitions of a tool', () => {
    const content = 'entity A\naudited A';
    expect(parseJDL(content, createJDLRuntime()).diagnostics.map(({ ruleId }) => ruleId)).toEqual(['syntax']);
    expect(parseJDL(content, createJDLRuntime({ entity })).diagnostics).toEqual([]);
  });

  it('imports a jdl with definitions, the JHipster ones completing the others', () => {
    const content = 'entity A\naudited A\ndto A with mapstruct';
    expect(() => createImporterFromContent(content, importerConfiguration).import()).toThrow(/audited/);
    const { exportedEntities } = createImporterFromContent(content, importerConfiguration, { entity }).import();
    expect(exportedEntities.map(({ name, dto }) => ({ name, dto }))).toEqual([{ name: 'A', dto: 'mapstruct' }]);
  });

  it('imports a jdl with the application options of a generator', () => {
    // The application options are the ones of the generator only.
    const application = buildJDLApplicationConfig({
      baseName: { description: 'Application name', jdl: { type: 'string', tokenType: 'NAME' }, scope: 'storage' },
      myOption: { description: 'My option', jdl: { type: 'boolean', tokenType: 'BOOLEAN' }, scope: 'storage' },
    });
    const content = 'application {\n  config {\n    baseName jhipster\n    myOption true\n  }\n}';
    expect(() => createImporterFromContent(content).import()).toThrow(/myOption/);
    const { exportedApplications } = createImporterFromContent(content, undefined, application).import();
    expect(exportedApplications[0]['generator-jhipster']).toMatchObject({ baseName: 'jhipster', myOption: true });
  });
});
