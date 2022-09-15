/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const { camelCase, upperFirst, uniq } = require('lodash');
const GeneratorBaseBlueprint = require('../../generators/generator-base-blueprint');
const { PRIORITY_PREFIX } = require('../constants/priorities.cjs');

/**
 * @private
 * Get chain for the generators.
 *
 * @params {...String} generators
 * @returns {String[]}
 */
function getChain(...generators) {
  const chain = uniq(
    generators
      .map(generator => {
        // eslint-disable-next-line import/no-dynamic-require,global-require
        const { dependencyChain } = require(`../../generators/${generator}/mixin.cjs`);
        if (!Array.isArray(dependencyChain)) {
          throw new Error(`Generator ${generator} doesn't provide a generator chain`);
        }
        return dependencyChain;
      })
      .concat(generators)
      .flat()
  );
  if (chain.length > generators.length) {
    return getChain(...chain);
  }
  return chain;
}

/**
 * @experimental
 * Load generator mixins to be used in current generator.
 *
 * @params {...String} generators
 * @returns Class
 */
module.exports.generateMixedChain = (...generators) => {
  let baseGenerator = GeneratorBaseBlueprint;
  if (typeof generators[0] !== 'string') {
    baseGenerator = generators.shift();
  }
  const mixedChain = getChain(...generators);

  let MixedClass = class extends baseGenerator {
    constructor(args, options, features) {
      super(args, options, features);
      if (!this.fromBlueprint && this.features.taskPrefix === undefined) {
        this.features.taskPrefix = PRIORITY_PREFIX;
      }
    }

    get initializing() {
      return {};
    }

    get prompting() {
      return {};
    }

    get configuring() {
      return {};
    }

    get composing() {
      return {};
    }

    get loading() {
      return {};
    }

    get preparing() {
      return {};
    }

    get preparingFields() {
      return {};
    }

    get preparingRelationships() {
      return {};
    }

    get default() {
      return {};
    }

    get writing() {
      return {};
    }

    get postWriting() {
      return {};
    }

    get install() {
      return {};
    }

    get end() {
      return {};
    }
  };

  mixedChain.forEach(generator => {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    const { mixin } = require(`../../generators/${generator}/mixin.cjs`);
    if (typeof mixin !== 'function') {
      throw new Error(`Generator ${generator} doesn't provide a mixin`);
    }
    MixedClass = mixin(MixedClass);
  });

  const upperCamelCaseGenerators = mixedChain.map(generator => upperFirst(camelCase(generator)));

  const executeChain = (generatorContext, args, methodNames) => {
    return methodNames.map(methodName => {
      const method = MixedClass.prototype[methodName];
      if (typeof method !== 'function') {
        throw new Error(`Method ${methodName} not implemented.`);
      }
      return method.apply(generatorContext, args);
    });
  };

  MixedClass.prototype.registerChainOptions = function (...args) {
    const allOptions = executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `get${upperCamelCaseGenerator}Options`)
    );
    const options = {};
    allOptions.forEach(generatorOptions => {
      Object.assign(options, generatorOptions);
    });
    this.jhipsterOptions(options);
  };

  // Reverse order so child config takes priority over parent.
  const reversedUpperCamelCaseGenerators = [];
  reversedUpperCamelCaseGenerators.unshift(...upperCamelCaseGenerators);

  MixedClass.prototype.configureChain = function (...args) {
    return executeChain(
      this,
      args,
      reversedUpperCamelCaseGenerators.map(upperCamelCaseGenerator => `configure${upperCamelCaseGenerator}`)
    );
  };

  MixedClass.prototype.loadChainOptionsConstants = function (...args) {
    return executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `load${upperCamelCaseGenerator}OptionsConstants`)
    );
  };

  MixedClass.prototype.loadChainConstants = function (...args) {
    return executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `load${upperCamelCaseGenerator}Constants`)
    );
  };

  MixedClass.prototype.loadChainConfig = function (...args) {
    return executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `load${upperCamelCaseGenerator}Config`)
    );
  };

  MixedClass.prototype.prepareChainDerivedProperties = function (...args) {
    return executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `prepare${upperCamelCaseGenerator}DerivedProperties`)
    );
  };

  return MixedClass;
};
