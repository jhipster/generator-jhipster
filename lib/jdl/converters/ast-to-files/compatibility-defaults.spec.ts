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

import { getDefaultRuntime } from '../../../jdl-config/jdl-runtime.ts';
import { parse } from '../../core/parsing/api.ts';
import performJDLPostParsingTasks from '../../core/parsing/jdl-post-parsing-tasks.ts';

import { astToFiles } from './ast-to-files.ts';
import { applyCompatibilityDefaults } from './compatibility-defaults.ts';

const runtime = getDefaultRuntime();

const convert = (jdl: string) =>
  applyCompatibilityDefaults(astToFiles(performJDLPostParsingTasks(parse(jdl, runtime, { onWarning: () => {} })), runtime)).files;

describe('jdl - applyCompatibilityDefaults', () => {
  it('should give a deployment the defaults of its type, and empty lists', () => {
    expect(convert('deployment { deploymentType docker-compose appsFolders [shop] monitoring prometheus }')).toMatchInlineSnapshot(`
{
  "docker-compose/.yo-rc.json": {
    "generator-jhipster": {
      "appsFolders": [
        "shop",
      ],
      "clusteredDbApps": [],
      "deploymentType": "docker-compose",
      "directoryPath": "../",
      "gatewayType": "SpringCloudGateway",
      "monitoring": "prometheus",
      "serviceDiscoveryType": "consul",
    },
  },
}
`);
  });

  it('should give an entity with a dto, or filtering, a service class, unless it declares a service', () => {
    const files = convert('entity A\nentity B\nentity C\nentity D\ndto A, D with mapstruct\nfilter B\nservice D with no');
    expect(Object.values(files).map(({ name, service }) => ({ name, service }))).toEqual([
      { name: 'A', service: 'serviceClass' },
      { name: 'B', service: 'serviceClass' },
      { name: 'C', service: undefined },
      { name: 'D', service: 'no' },
    ]);
  });

  it('should give the entities annotations, the applications they are in, and their attributes in the order of the importer', () => {
    const files = convert(`
application {
  config { baseName one }
  entities A
}
application {
  config { baseName two }
  entities A, B
}
entity A
entity B
dto A with mapstruct
`);
    expect(Object.keys(files['one/.jhipster/A.json'])).toEqual([
      'annotations',
      'name',
      'fields',
      'relationships',
      'dto',
      'service',
      'applications',
    ]);
    expect(files['two/.jhipster/A.json']).toMatchObject({ annotations: {}, applications: ['one', 'two'] });
    expect(files['two/.jhipster/B.json']).toMatchObject({ applications: ['two'] });
    expect(convert('entity C')['.jhipster/C.json']).toMatchObject({ applications: ['*'] });
  });

  it('should order the relationships of an entity by side, then by type', () => {
    const files = convert(`
entity A
entity B
relationship ManyToMany { A{b} to B{a} }
relationship OneToOne { A{c} to B{d} }
relationship OneToMany { B{e} to A{f} }
`);
    expect(
      files['.jhipster/A.json'].relationships.map(
        ({ relationshipSide, relationshipType }: any) => `${relationshipSide} ${relationshipType}`,
      ),
    ).toEqual(['left one-to-one', 'left many-to-many', 'right many-to-one']);
  });

  it('should give the destination side of a relationship to a built-in entity the builtInEntity option', () => {
    const files = convert('entity A\nentity B\nrelationship OneToOne {\n  @Id A{b} to B{a} with builtInEntity\n}');
    expect(files['.jhipster/B.json'].relationships[0].options).toEqual({ builtInEntity: true, id: true });
  });

  it('should leave out of a microservice the entities of another microservice', () => {
    const files = convert(`
application {
  config { baseName store applicationType microservice }
  entities *
}
entity Product
entity Order
microservice Order with orders
`);
    expect(Object.keys(files)).toEqual(['store/.yo-rc.json', 'store/.jhipster/Product.json']);
  });

  describe('with the application the jdl is imported into', () => {
    const convertInto = (jdl: string, applicationType: 'microservice' | 'monolith') =>
      applyCompatibilityDefaults(astToFiles(performJDLPostParsingTasks(parse(jdl, runtime)), runtime), {
        applicationName: 'store',
        applicationType,
      }).files;

    it('should give the entities imported into a microservice its name and client root folder, unless the jdl gives others', () => {
      expect(Object.values(convertInto('entity A\nentity B\nclientRootFolder B with shop', 'microservice'))).toMatchObject([
        { name: 'A', microserviceName: 'store', clientRootFolder: 'store' },
        { name: 'B', microserviceName: 'store', clientRootFolder: 'shop' },
      ]);
    });

    it('should leave out the entities of another microservice, and not name the microservice of a jdl naming some', () => {
      const entities = Object.values(convertInto('entity A\nentity B\nmicroservice B with orders', 'microservice'));
      expect(entities.map(({ name, clientRootFolder, microserviceName }) => ({ name, clientRootFolder, microserviceName }))).toEqual([
        { name: 'A', clientRootFolder: 'store', microserviceName: undefined },
      ]);
    });

    it('should keep the entities imported into another application', () => {
      expect(Object.values(convertInto('entity A\nentity B', 'monolith')).map(({ microserviceName }) => microserviceName)).toEqual([
        undefined,
        undefined,
      ]);
    });
  });
});
