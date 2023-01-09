/* eslint-disable no-unused-expressions, max-classes-per-file */
import sinon from 'sinon';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

import BaseBlueprint from '../generators/base/index.mjs';

const BaseGenerator = BaseBlueprint.prototype;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

const priorities = [
  'initializing',
  'prompting',
  'configuring',
  'composing',
  'loading',
  'preparing',
  'default',
  'writing',
  'postWriting',
  'install',
  'end',
];

const createPrioritiesFakes = () => {
  const mockedPriorities = {};
  priorities.forEach(priority => {
    mockedPriorities[priority] = sinon.fake();
  });
  return mockedPriorities;
};

const createAllBlueprint = mockedPriorities => {
  /**
   * @class
   * @extends {BaseBlueprint}
   */
  return class extends BaseBlueprint {
    get initializing() {
      return {
        mockedInitializing() {
          mockedPriorities.initializing();
        },
      };
    }

    get [BaseBlueprint.INITIALIZING]() {
      return this.initializing;
    }

    get prompting() {
      return {
        mockedPrompting() {
          mockedPriorities.prompting();
        },
      };
    }

    get [BaseBlueprint.PROMPTING]() {
      return this.prompting;
    }

    get configuring() {
      return {
        mockedConfiguring() {
          mockedPriorities.configuring();
        },
      };
    }

    get [BaseBlueprint.CONFIGURING]() {
      return this.configuring;
    }

    get composing() {
      return {
        mockedComposing() {
          mockedPriorities.composing();
        },
      };
    }

    get [BaseBlueprint.COMPOSING]() {
      return this.composing;
    }

    get loading() {
      return {
        mockedLoading() {
          mockedPriorities.loading();
        },
      };
    }

    get [BaseBlueprint.LOADING]() {
      return this.loading;
    }

    get preparing() {
      return {
        mockedPreparing() {
          mockedPriorities.preparing();
        },
      };
    }

    get [BaseBlueprint.PREPARING]() {
      return this.preparing;
    }

    get default() {
      return {
        mockedDefault() {
          mockedPriorities.default();
        },
      };
    }

    get [BaseBlueprint.DEFAULT]() {
      return this.default;
    }

    get writing() {
      return {
        mockedWriting() {
          mockedPriorities.writing();
        },
      };
    }

    get [BaseBlueprint.WRITING]() {
      return this.writing;
    }

    get postWriting() {
      return {
        mockedPostWriting() {
          mockedPriorities.postWriting();
        },
      };
    }

    get [BaseBlueprint.POST_WRITING]() {
      return this.postWriting;
    }

    get install() {
      return {
        mockedInstall() {
          mockedPriorities.install();
        },
      };
    }

    get [BaseBlueprint.INSTALL]() {
      return this.install;
    }

    get end() {
      return {
        mockedEnd() {
          mockedPriorities.end();
        },
      };
    }

    get [BaseBlueprint.END]() {
      return this.end;
    }
  };
};

describe('generator - base-blueprint', () => {
  describe('priorities', () => {
    describe('when every priority has been implemented', () => {
      let mockedPriorities;
      let mockBlueprintSubGen;
      before(() => {
        mockedPriorities = createPrioritiesFakes();
        mockBlueprintSubGen = createAllBlueprint(mockedPriorities);
        return helpers.run(mockBlueprintSubGen);
      });

      priorities.forEach((priority, idx) => {
        it(`should execute ${priority} once`, () => {
          assert.equal(mockedPriorities[priority].callCount, 1);
        });
        if (idx > 0) {
          const lastPriority = priorities[idx - 1];
          it(`should execute ${priority} after ${lastPriority} `, () => {
            assert(mockedPriorities[priority].calledAfter(mockedPriorities[lastPriority]));
          });
        }
      });
    });

    describe('when custom priorities are missing and the blueprint is sbs', () => {
      let mockedPriorities;
      let mockBlueprintSubGen;
      before(() => {
        mockedPriorities = createPrioritiesFakes();
        mockBlueprintSubGen = class extends createAllBlueprint(mockedPriorities) {
          constructor(args, opts, features) {
            super(args, opts, features);
            this.sbsBlueprint = true;
          }

          get [BaseBlueprint.INITIALIZING]() {
            return super.initializing;
          }

          get [BaseBlueprint.PROMPTING]() {
            return super.prompting;
          }

          get [BaseBlueprint.CONFIGURING]() {
            return super.configuring;
          }

          get [BaseBlueprint.DEFAULT]() {
            return super.default;
          }

          get [BaseBlueprint.WRITING]() {
            return super.writing;
          }

          get [BaseBlueprint.INSTALL]() {
            return super.install;
          }

          get [BaseBlueprint.END]() {
            return super.end;
          }
        };
        return helpers.create(mockBlueprintSubGen).run();
      });

      priorities.forEach(priority => {
        if (['composing', 'loading', 'preparing', 'postWriting'].includes(priority)) {
          it(`should not execute ${priority}`, () => {
            assert.equal(mockedPriorities[priority].callCount, 0);
          });
        } else {
          it(`should execute ${priority} once`, () => {
            assert.equal(mockedPriorities[priority].callCount, 1);
          });
        }
      });
    });
  });
});
