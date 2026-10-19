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
import { before, describe, expect, it } from 'expect-node';

import BaseApplicationGenerator from '../generators/base-application/index.ts';
import CoreGenerator from '../generators/base-core/index.ts';
import BaseWorkspacesGenerator from '../generators/base-workspaces/index.ts';
import { mutateData } from '../lib/utils/object.ts';

import { defaultHelpers as helpers } from '#testing';

const { objectPriority } = CoreGenerator;

/** The order the priorities of a generator with a `service` custom object run in, by the base it extends. */
const bases = [
  {
    Generator: CoreGenerator,
    order: ['preparing', 'loadingService', 'preparingService', 'postPreparingService', 'postPreparing', 'default'],
  },
  {
    Generator: BaseApplicationGenerator,
    order: [
      'preparing',
      'loadingService custom',
      'preparingService custom',
      'postPreparingService custom',
      'postPreparing',
      'configuringEachEntity',
      'loadingEntities',
      'preparingEachEntity',
      'postPreparingEachEntity',
      'default',
    ],
  },
  {
    Generator: BaseWorkspacesGenerator,
    order: [
      'preparing',
      'postPreparing',
      'loadingWorkspaces',
      'preparingWorkspaces',
      'loadingService deployment applications',
      'preparingService deployment applications',
      'postPreparingService deployment applications',
      'default',
    ],
  },
];

describe('custom objects', () => {
  for (const { Generator, order } of bases) {
    describe(Generator.name, () => {
      const events: string[] = [];
      /** The priority, with the application or the deployment and its applications the phases of the object get. */
      const event = (priorityName: string, { application, deployment, applications }: any = {}) =>
        [priorityName, application?.baseName, deployment && 'deployment', applications && 'applications'].filter(Boolean).join(' ');

      class CustomGenerator extends (Generator as typeof CoreGenerator) {
        constructor(args: any, options: any, features: any) {
          super(args, options, { ...features, queueCommandTasks: false, customObjects: [{ name: 'service' }] });
        }

        get service() {
          return this.getContextData('test:service', { factory: () => ({}) });
        }

        async beforeQueue() {
          if (this instanceof BaseApplicationGenerator) {
            await this.dependsOnBootstrap('app');
          }
        }

        get [CoreGenerator.PREPARING]() {
          return { preparing: () => events.push('preparing') };
        }

        get [objectPriority('service', 'loading')]() {
          return { loading: (arg: any) => events.push(event('loadingService', arg)) };
        }

        get [objectPriority('service', 'preparing')]() {
          return { preparing: (arg: any) => events.push(event('preparingService', arg)) };
        }

        get [objectPriority('service', 'postPreparing')]() {
          return { postPreparing: (arg: any) => events.push(event('postPreparingService', arg)) };
        }

        get [CoreGenerator.POST_PREPARING]() {
          return { postPreparing: () => events.push('postPreparing') };
        }

        get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
          return { configuring: () => events.push('configuringEachEntity') };
        }

        get [BaseApplicationGenerator.LOADING_ENTITIES]() {
          return { loading: () => events.push('loadingEntities') };
        }

        get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
          return { preparing: () => events.push('preparingEachEntity') };
        }

        get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
          return { postPreparing: () => events.push('postPreparingEachEntity') };
        }

        get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
          return { loading: () => events.push('loadingWorkspaces') };
        }

        get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
          return { preparing: () => events.push('preparingWorkspaces') };
        }

        get [CoreGenerator.DEFAULT]() {
          return { default: () => events.push('default') };
        }
      }

      before(async () => {
        await helpers
          .run(CustomGenerator)
          .withJHipsterGenerators({ useDefaultMocks: true })
          .withJHipsterConfig({ baseName: 'custom', skipUserManagement: true }, [{ name: 'One' }]);
      });

      it('runs the phases of the object in order', () => {
        expect(events).toEqual(order);
      });
    });
  }

  describe('base-core with several generators', () => {
    let events: string[];

    /** A generator with a `service` custom object, shared by the generators, recording its phases. */
    const createServiceGenerator = (generatorName: string, compose?: string) =>
      class extends CoreGenerator {
        constructor(args: any, options: any, features: any) {
          super(args, options, { ...features, queueCommandTasks: false, customObjects: [{ name: 'service' }] });
        }

        get service() {
          return this.getContextData('test:service', { factory: () => ({}) });
        }

        async beforeQueue() {
          if (compose) {
            await this.composeWith(compose);
          }
        }

        get [CoreGenerator.PREPARING]() {
          return {
            preparing() {
              events.push(`${generatorName} preparing`);
            },
          };
        }

        get [objectPriority('service', 'loading')]() {
          return {
            loading({ service }: any) {
              service.loadedBy = [...(service.loadedBy ?? []), generatorName];
              events.push(`${generatorName} loading`);
            },
          };
        }

        get [objectPriority('service', 'preparing')]() {
          return {
            preparing({ service }: any) {
              service.preparedBy ??= generatorName;
              events.push(`${generatorName} preparing ${service.loadedBy.join(', ')}`);
            },
          };
        }

        get [objectPriority('service', 'postPreparing')]() {
          return {
            postPreparing({ service }: any) {
              events.push(`${generatorName} post preparing ${service.preparedBy}`);
            },
          };
        }

        get [CoreGenerator.POST_PREPARING]() {
          return {
            postPreparing() {
              events.push(`${generatorName} post preparing`);
            },
          };
        }
      };

    before(async () => {
      events = [];
      await helpers
        .run(createServiceGenerator('first', 'jhipster-foo:second'))
        .withGenerators([[createServiceGenerator('second'), { namespace: 'jhipster-foo:second' }]]);
    });

    it('runs the phases of the object between the preparing and the post preparing priorities, the object shared', () => {
      expect(events).toEqual([
        'first preparing',
        'second preparing',
        'first loading',
        'second loading',
        'first preparing first, second',
        'second preparing first, second',
        // The first generator prepared the object first.
        'first post preparing first',
        'second post preparing first',
        'first post preparing',
        'second post preparing',
      ]);
    });

    it('gives the priority name of a phase', () => {
      expect(objectPriority('service', 'loading')).toBe('>loadingService');
      expect(objectPriority('service', 'preparing')).toBe('>preparingService');
      expect(objectPriority('service', 'postPreparing')).toBe('>postPreparingService');
    });

    it('fails when the generator does not implement the getter of the object', async () => {
      await expect(
        helpers.run(
          class extends CoreGenerator {
            constructor(args: any, options: any, features: any) {
              super(args, options, { ...features, queueCommandTasks: false, customObjects: [{ name: 'service' }] });
            }

            get [objectPriority('service', 'loading')]() {
              return { loading() {} };
            }
          },
        ),
      ).rejects.toThrow(/declares the custom object service without a service getter/);
    });

    describe('with a default reading a property another generator sets later', () => {
      let label: string;

      const createGenerator = (preparing: (service: any) => void, compose?: string) =>
        class extends CoreGenerator {
          constructor(args: any, options: any, features: any) {
            super(args, options, { ...features, queueCommandTasks: false, customObjects: [{ name: 'service' }] });
          }

          get service() {
            return this.getContextData('test:service', { factory: () => ({}) });
          }

          async beforeQueue() {
            if (compose) {
              await this.composeWith(compose);
            }
          }

          get [objectPriority('service', 'loading')]() {
            return {
              loading({ service }: any) {
                service.name = 'Book';
              },
            };
          }

          get [objectPriority('service', 'preparing')]() {
            return {
              preparing({ service }: any) {
                preparing(service);
              },
            };
          }

          get [objectPriority('service', 'postPreparing')]() {
            return {
              postPreparing({ service }: any) {
                ({ label } = service);
              },
            };
          }
        };

      before(async () => {
        await helpers
          .run(
            createGenerator(
              service => mutateData(service, { __override__: false, label: ({ className }: any) => `${className} label` }),
              'jhipster-foo:second',
            ),
          )
          .withGenerators([
            [
              createGenerator(service => {
                service.className = `${service.name}Service`;
              }),
              { namespace: 'jhipster-foo:second' },
            ],
          ]);
      });

      it('waits for the property and applies the default before the post preparing', () => {
        expect(label).toBe('BookService label');
      });
    });
  });
});
