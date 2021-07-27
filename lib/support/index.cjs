/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const { GeneratorBaseBlueprint } = require('generator-jhipster');

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
 * @private
 * Load generator mixins to be used in current generator.
 *
 * @params {...String} generators
 * @returns Class
 */
module.exports.generateMixedChain = (...generators) => {
  const mixedChain = getChain(...generators);

  let MixedClass = GeneratorBaseBlueprint;
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
    methodNames.forEach(methodName => {
      const loadGeneratorOptions = MixedClass.prototype[methodName];
      if (typeof loadGeneratorOptions !== 'function') {
        throw new Error(`Method ${methodName} not implemented.`);
      }
      loadGeneratorOptions.apply(generatorContext, args);
    });
  };

  MixedClass.prototype.registerChainOptions = function (...args) {
    executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `register${upperCamelCaseGenerator}Options`)
    );
  };

  MixedClass.prototype.configureChain = function (...args) {
    executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `configure${upperCamelCaseGenerator}`)
    );
  };

  MixedClass.prototype.loadChainOptionsConstants = function (...args) {
    executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `load${upperCamelCaseGenerator}OptionsConstants`)
    );
  };

  MixedClass.prototype.loadChainConstants = function (...args) {
    executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `load${upperCamelCaseGenerator}Constants`)
    );
  };

  MixedClass.prototype.loadChainConfig = function (...args) {
    executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `load${upperCamelCaseGenerator}Config`)
    );
  };

  MixedClass.prototype.loadDerivedChainConfig = function (...args) {
    executeChain(
      this,
      args,
      upperCamelCaseGenerators.map(upperCamelCaseGenerator => `loadDerived${upperCamelCaseGenerator}Config`)
    );
  };

  return MixedClass;
};
