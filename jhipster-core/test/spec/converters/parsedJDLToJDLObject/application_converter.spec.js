/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { expect } = require('chai');
const { MONOLITH } = require('../../../../lib/core/jhipster/application_types');
const { createJDLApplication } = require('../../../../lib/core/jdl_application_factory');
const { convertApplications } = require('../../../../lib/converters/parsedJDLToJDLObject/application_converter');

describe('ApplicationConverter', () => {
  describe('convertApplications', () => {
    context('when not passing applications', () => {
      it('should fail', () => {
        expect(() => convertApplications()).to.throw(/^Applications have to be passed so as to be converted\.$/);
      });
    });
    context('when passing applications', () => {
      context('with no application type', () => {
        let convertedApplication;
        let expectedApplication;

        before(() => {
          convertedApplication = convertApplications([
            {
              config: {
                baseName: 'mono'
              },
              entities: {
                entityList: [],
                excluded: []
              },
              options: {}
            }
          ]);
          expectedApplication = [
            createJDLApplication({
              applicationType: MONOLITH,
              baseName: 'mono'
            })
          ];
        });

        it(`should convert it as a ${MONOLITH}`, () => {
          expect(convertedApplication).to.deep.equal(expectedApplication);
        });
      });
      context('when passing a configuration object', () => {
        context('with a creation timestamp', () => {
          let convertedApplication;
          let expectedApplication;

          before(() => {
            convertedApplication = convertApplications(
              [
                {
                  config: {
                    applicationType: MONOLITH,
                    baseName: 'mono'
                  },
                  entities: {
                    entityList: [],
                    excluded: []
                  },
                  options: {}
                }
              ],
              { creationTimestamp: 42 }
            );
            expectedApplication = [
              createJDLApplication({
                applicationType: MONOLITH,
                baseName: 'mono',
                creationTimestamp: 42
              })
            ];
          });

          it('should use it', () => {
            expect(convertedApplication).to.deep.equal(expectedApplication);
          });
        });
        context('with a generator version', () => {
          let convertedApplication;
          let expectedApplication;

          before(() => {
            convertedApplication = convertApplications(
              [
                {
                  config: {
                    applicationType: MONOLITH,
                    baseName: 'mono'
                  },
                  entities: {
                    entityList: [],
                    excluded: []
                  },
                  options: {}
                }
              ],
              { generatorVersion: '7.0.0' }
            );
            expectedApplication = [
              createJDLApplication({
                applicationType: MONOLITH,
                baseName: 'mono',
                jhipsterVersion: '7.0.0'
              })
            ];
          });

          it('should use it', () => {
            expect(convertedApplication).to.deep.equal(expectedApplication);
          });
        });
      });
      context('when including all entities in an application', () => {
        let convertedApplication;
        let expectedApplication;

        before(() => {
          convertedApplication = convertApplications(
            [
              {
                config: {
                  baseName: 'mono'
                },
                entities: {
                  entityList: ['*'],
                  excluded: []
                },
                options: {}
              }
            ],
            {},
            ['A', 'B']
          );
          const application = createJDLApplication({
            applicationType: MONOLITH,
            baseName: 'mono'
          });
          application.addEntityNames(['A', 'B']);
          expectedApplication = [application];
        });

        it('should include them', () => {
          expect(convertedApplication).to.deep.equal(expectedApplication);
        });
      });
      context('when including some entities in an application', () => {
        context("if entities don't exist", () => {
          let applicationsToConvert;

          before(() => {
            applicationsToConvert = [
              {
                config: {
                  baseName: 'mono'
                },
                entities: {
                  entityList: ['B'],
                  excluded: []
                },
                options: {}
              }
            ];
          });

          it('should fail', () => {
            expect(() => {
              convertApplications(applicationsToConvert, {}, ['A']);
            }).to.throw(/^The entity B which is declared in mono's entity list doesn't exist\.$/);
          });
        });
      });
      context('when excluding entities in an application', () => {
        let convertedApplication;
        let expectedApplication;

        before(() => {
          convertedApplication = convertApplications(
            [
              {
                config: {
                  baseName: 'mono'
                },
                entities: {
                  entityList: ['*'],
                  excluded: ['A']
                },
                options: {}
              }
            ],
            {},
            ['A', 'B']
          );
          const application = createJDLApplication({
            applicationType: MONOLITH,
            baseName: 'mono'
          });
          application.addEntityNames(['B']);
          expectedApplication = [application];
        });

        it('should exclude them', () => {
          expect(convertedApplication).to.deep.equal(expectedApplication);
        });
      });
      context('when having entity options in an application', () => {
        context('if the entity list does not contain some entities mentioned in options', () => {
          let applicationsToConvert;

          before(() => {
            applicationsToConvert = [
              {
                config: {
                  baseName: 'mono'
                },
                entities: {
                  entityList: ['A'],
                  excluded: []
                },
                options: {
                  dto: {
                    mapstruct: {
                      list: ['C'],
                      excluded: []
                    }
                  }
                }
              }
            ];
          });

          it('should fail', () => {
            expect(() => convertApplications(applicationsToConvert, {}, ['A', 'B', 'C'])).to.throw(
              /^The entity C in the dto option isn't declared in mono's entity list\.$/
            );
          });
        });
        context('if the entity list contains the entities mentioned in options', () => {
          let convertedApplications;

          before(() => {
            convertedApplications = convertApplications(
              [
                {
                  config: {
                    baseName: 'mono'
                  },
                  entities: {
                    entityList: ['*'],
                    excluded: []
                  },
                  options: {
                    dto: {
                      mapstruct: {
                        list: ['A'],
                        excluded: []
                      }
                    }
                  }
                }
              ],
              {},
              ['A', 'B']
            );
          });

          it('should include them', () => {
            expect(convertedApplications[0].options.size()).to.equal(1);
          });
        });
      });
    });
  });
});
