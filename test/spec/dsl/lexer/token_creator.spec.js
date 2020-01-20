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
const { NAME, KEYWORD } = require('../../../../lib/dsl/lexer/shared_tokens');
const { createTokenFromConfig } = require('../../../../lib/dsl/lexer/token_creator');

describe('TokenCreator', () => {
  describe('createTokenFromConfig', () => {
    context('when not passing a config', () => {
      it('should fail', () => {
        expect(() => createTokenFromConfig()).to.throw(/^Can't create a token without the proper config\.$/);
      });
    });
    context('when passing a config', () => {
      context('with just a name', () => {
        let token;

        before(() => {
          token = createTokenFromConfig({ name: 'MY_TOKEN' });
        });

        it('should use the passed name', () => {
          expect(token.name).to.equal('MY_TOKEN');
        });
        it('should set an empty list as categories', () => {
          expect(token.CATEGORIES).to.deep.equal([]);
        });
      });
      context('when the pattern is a keyword', () => {
        let token;

        before(() => {
          token = createTokenFromConfig({ name: 'MY_TOKEN', pattern: 'keyword' });
        });

        it('should set the longer alternative attribute', () => {
          expect(token.LONGER_ALT).to.equal(NAME);
        });
        it('should set the categories list', () => {
          expect(token.CATEGORIES).to.deep.equal([KEYWORD]);
        });
      });
      context('if there is no label but a pattern', () => {
        let token;

        before(() => {
          token = createTokenFromConfig({ name: 'MY_TOKEN', pattern: 'pattern' });
        });

        it('should set a label from the pattern', () => {
          expect(token.LABEL).to.equal("'pattern'");
        });
      });
    });
  });
});
