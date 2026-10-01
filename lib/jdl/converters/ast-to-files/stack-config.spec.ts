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

import { applyStackConfig } from './stack-config.ts';

const GENERATOR_JHIPSTER = 'generator-jhipster';
const yoRc = (config: Record<string, any>) => ({ [GENERATOR_JHIPSTER]: config });

describe('jdl - applyStackConfig', () => {
  it('should index the applications, the gateways first', () => {
    const { files } = applyStackConfig({
      files: {
        'store/.yo-rc.json': yoRc({ baseName: 'store', applicationType: 'microservice' }),
        'gateway/.yo-rc.json': yoRc({ baseName: 'gateway', applicationType: 'gateway' }),
      },
      relativeRoot: '',
    });
    expect(files['gateway/.yo-rc.json'][GENERATOR_JHIPSTER].applicationIndex).toBe(0);
    expect(files['store/.yo-rc.json'][GENERATOR_JHIPSTER].applicationIndex).toBe(1);
  });

  it('should not index a single application', () => {
    const { files } = applyStackConfig({ files: { 'shop/.yo-rc.json': yoRc({ baseName: 'shop' }) }, relativeRoot: 'shop' });
    expect(files['shop/.yo-rc.json'][GENERATOR_JHIPSTER].applicationIndex).toBeUndefined();
  });

  it('should give a gateway the applications it serves, and them its server port', () => {
    const { files } = applyStackConfig({
      files: {
        'gateway/.yo-rc.json': yoRc({
          baseName: 'gateway',
          applicationType: 'gateway',
          clientFramework: 'angular',
          serverPort: 8080,
          microfrontends: [{ baseName: 'blog' }],
        }),
        'gateway/.jhipster/Product.json': { name: 'Product', microserviceName: 'store' },
        'blog/.yo-rc.json': yoRc({ baseName: 'blog', applicationType: 'microservice', clientFramework: 'angular', serverPort: 8081 }),
        'store/.yo-rc.json': yoRc({ baseName: 'store', applicationType: 'microservice', serverPort: 8082 }),
      },
      relativeRoot: '',
    });
    expect(files['gateway/.yo-rc.json'][GENERATOR_JHIPSTER].applications).toEqual({
      blog: { clientFramework: 'angular', serverPort: 8081, applicationIndex: 1, devServerPort: undefined },
      store: { clientFramework: undefined, serverPort: 8082, applicationIndex: 2, devServerPort: undefined },
    });
    expect(files['blog/.yo-rc.json'][GENERATOR_JHIPSTER].gatewayServerPort).toBe(8080);
    expect(files['store/.yo-rc.json'][GENERATOR_JHIPSTER].gatewayServerPort).toBe(8080);
  });

  it('should refuse a microfrontend of another client framework', () => {
    expect(() =>
      applyStackConfig({
        files: {
          'gateway/.yo-rc.json': yoRc({
            baseName: 'gateway',
            applicationType: 'gateway',
            clientFramework: 'angular',
            microfrontends: [{ baseName: 'blog' }],
          }),
          'blog/.yo-rc.json': yoRc({ baseName: 'blog', applicationType: 'microservice', clientFramework: 'react' }),
        },
        relativeRoot: '',
      }),
    ).toThrow('Using different client frameworks in microfrontends is not supported. Tried to use: angular with react (blog)');
  });

  it('should not change the files passed', () => {
    const files = { 'store/.yo-rc.json': yoRc({ baseName: 'store' }), 'gateway/.yo-rc.json': yoRc({ baseName: 'gateway' }) };
    applyStackConfig({ files, relativeRoot: '' });
    expect(files['store/.yo-rc.json'][GENERATOR_JHIPSTER]).toEqual({ baseName: 'store' });
  });
});
