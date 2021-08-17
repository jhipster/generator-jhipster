/* eslint-disable no-unused-expressions, max-classes-per-file */
const sinon = require('sinon');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const BaseBlueprint = require('../generators/generator-base-blueprint');

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
  'preparingFields',
  'preparingRelationships',
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
  return class extends BaseBlueprint {
    _initializing() {
      return {
        mockedInitializing() {
          mockedPriorities.initializing();
        },
      };
    }

    get initializing() {
      return this._initializing();
    }

    _prompting() {
      return {
        mockedPrompting() {
          mockedPriorities.prompting();
        },
      };
    }

    get prompting() {
      return this._prompting();
    }

    _configuring() {
      return {
        mockedConfiguring() {
          mockedPriorities.configuring();
        },
      };
    }

    get configuring() {
      return this._configuring();
    }

    _composing() {
      return {
        mockedComposing() {
          mockedPriorities.composing();
        },
      };
    }

    get composing() {
      return this._composing();
    }

    _loading() {
      return {
        mockedLoading() {
          mockedPriorities.loading();
        },
      };
    }

    get loading() {
      return this._loading();
    }

    _preparing() {
      return {
        mockedPreparing() {
          mockedPriorities.preparing();
        },
      };
    }

    get preparing() {
      return this._preparing();
    }

    _preparingFields() {
      return {
        mockedPreparingFields() {
          mockedPriorities.preparingFields();
        },
      };
    }

    get preparingFields() {
      return this._preparingFields();
    }

    _preparingRelationships() {
      return {
        mockedPreparingRelationships() {
          mockedPriorities.preparingRelationships();
        },
      };
    }

    get preparingRelationships() {
      return this._preparingRelationships();
    }

    _default() {
      return {
        ...this._missingPreDefault(),
        mockedDefault() {
          mockedPriorities.default();
        },
      };
    }

    get default() {
      return this._default();
    }

    _writing() {
      return {
        mockedWriting() {
          mockedPriorities.writing();
        },
        ...this._missingPostWriting(),
      };
    }

    get writing() {
      return this._writing();
    }

    _postWriting() {
      return {
        mockedPostWriting() {
          mockedPriorities.postWriting();
        },
      };
    }

    get postWriting() {
      return this._postWriting();
    }

    _install() {
      return {
        mockedInstall() {
          mockedPriorities.install();
        },
      };
    }

    get install() {
      return this._install();
    }

    _end() {
      return {
        mockedEnd() {
          mockedPriorities.end();
        },
      };
    }

    get end() {
      return this._end();
    }
  };
};

describe('Generator Base Blueprint', () => {
  describe('priorities', () => {
    describe('when every priority has been implemented', () => {
      let mockedPriorities;
      let mockBlueprintSubGen;
      before(() => {
        mockedPriorities = createPrioritiesFakes();
        mockBlueprintSubGen = createAllBlueprint(mockedPriorities);
        return helpers.create(mockBlueprintSubGen).run();
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

    describe('when custom priorities are missing', () => {
      let mockedPriorities;
      let mockBlueprintSubGen;
      before(() => {
        mockedPriorities = createPrioritiesFakes();
        mockBlueprintSubGen = class extends createAllBlueprint(mockedPriorities) {
          get initializing() {
            return this._initializing();
          }

          get prompting() {
            return this._prompting();
          }

          get configuring() {
            return this._configuring();
          }

          get default() {
            return this._default();
          }

          get writing() {
            return this._writing();
          }

          get install() {
            return this._install();
          }

          get end() {
            return this._end();
          }
        };
        return helpers.create(mockBlueprintSubGen).run();
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
          constructor(args, opts) {
            super(args, opts);
            this.sbsBlueprint = true;
          }

          get initializing() {
            return this._initializing();
          }

          get prompting() {
            return this._prompting();
          }

          get configuring() {
            return this._configuring();
          }

          get default() {
            return this._default();
          }

          get writing() {
            return this._writing();
          }

          get install() {
            return this._install();
          }

          get end() {
            return this._end();
          }
        };
        return helpers.create(mockBlueprintSubGen).run();
      });

      priorities.forEach(priority => {
        if (['composing', 'loading', 'preparing', 'preparingFields', 'preparingRelationships', 'postWriting'].includes(priority)) {
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
