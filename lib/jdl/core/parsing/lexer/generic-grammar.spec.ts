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

import { type CstNode, tokenMatcher } from 'chevrotain';

import { getDefaultRuntime } from '../../../../jdl-config/jdl-runtime.ts';
import { parse as parseDocument } from '../api.ts';
import JDLParser from '../jdl-parser.ts';

import { buildTokens, createJDLLexer } from './lexer.ts';

describe('jdl - definition-independent grammar', () => {
  const tokens = buildTokens();
  const lexer = createJDLLexer(tokens);
  const parser = new JDLParser(tokens.tokens);
  parser.parse();

  const parse = (text: string) => {
    const lexed = lexer.tokenize(text);
    expect(lexed.errors).toEqual([]);
    parser.input = lexed.tokens;
    const result = parser.prog();
    expect(parser.errors).toEqual([]);
    return result;
  };

  it('uses the same token for skipClient and skipServer in config and option statements', () => {
    const text = 'application { config { skipClient true skipServer false } skipClient * skipServer * }';
    const names = lexer.tokenize(text).tokens.filter(token => ['skipClient', 'skipServer'].includes(token.image));
    expect(names).toHaveLength(4);
    expect(names.every(token => token.tokenType === tokens.tokens.IDENTIFIER)).toBe(true);
    expect(names.every(token => tokenMatcher(token, tokens.tokens.NAME))).toBe(true);
    parse(text);
  });

  it('parses an unknown unary and binary option without a definition or lexer change', () => {
    const result = parse('newUnary A, B except C newBinary * with newValue except D');
    expect(result.children.optionDeclaration).toHaveLength(2);
  });

  it('does not reserve option names as entity, field, or enum identifiers', () => {
    parse('entity paginate { dto String skipClient String } enum microservice { pagination, filter }');
  });

  it('accepts generic names in every config block and relationship option', () => {
    parse(`application { config { customOne customValue } config(customNamespace) { customTwo otherValue } }
      deployment { customDeployment customValue }
      relationship CustomRelationship { A to B with customRelationshipOption }`);
  });

  it('keeps comma-separated relationships distinct from comma-separated options', () => {
    const result = parse('relationship OneToOne { A to B with first, second, C to D with third }');
    const declaration = result.children.relationDeclaration[0] as CstNode;
    expect(declaration.children.relationshipBody).toHaveLength(2);
  });

  it('builds validation tokens only from supplied definitions and preserves whitespace-separated fields', () => {
    const custom = buildTokens({ validations: { mandatory: { type: 'flag' }, lower: { type: 'number' }, matches: { type: 'pattern' } } });
    const customLexer = createJDLLexer(custom);
    const customParser = new JDLParser(custom.tokens);
    customParser.parse();
    const lexed = customLexer.tokenize('entity A { a String mandatory matches(/a/) b Integer lower(1) }');
    expect(lexed.errors).toEqual([]);
    customParser.input = lexed.tokens;
    const result = customParser.prog();
    expect(customParser.errors).toEqual([]);
    const entity = result.children.entityDeclaration[0] as CstNode;
    const body = entity.children.entityBody[0] as CstNode;
    expect(body.children.fieldDeclaration).toHaveLength(2);
    const undeclaredValidations = customLexer.tokenize('required minlength');
    expect(undeclaredValidations.errors).toEqual([]);
    expect(undeclaredValidations.tokens.map(token => token.image)).toEqual(['required', 'minlength']);
    expect(undeclaredValidations.tokens.every(token => token.tokenType === custom.tokens.IDENTIFIER)).toBe(true);
    expect(undeclaredValidations.tokens.every(token => tokenMatcher(token, custom.tokens.NAME))).toBe(true);
  });

  it('honors a supplied identifier pattern even when a name starts with a keyword', () => {
    const custom = buildTokens({ namePattern: /[a-zA-Z_$][a-zA-Z_$0-9]*/ });
    const result = createJDLLexer(custom).tokenize('entity$ custom$value');
    expect(result.errors).toEqual([]);
    expect(result.tokens.map(token => token.image)).toEqual(['entity$', 'custom$value']);
    expect(result.tokens.every(token => token.tokenType === custom.tokens.IDENTIFIER)).toBe(true);
    expect(result.tokens.every(token => tokenMatcher(token, custom.tokens.NAME))).toBe(true);
  });

  it('recovers a missing entity name without inventing a name or losing the following entity', () => {
    const text = 'entity { field String }\nentity Valid { id Long }';
    const { ast, diagnostics } = parseDocument(text, getDefaultRuntime());
    expect(diagnostics.map(diagnostic => diagnostic.ruleId)).toEqual(['syntax.MismatchedTokenException']);
    expect(text.slice(diagnostics[0].range.start.offset, diagnostics[0].range.end.offset)).toBe('{');
    expect(ast?.entities.map(entity => entity.name)).toEqual(['Valid']);
    expect(ast?.entities[0].body?.map(field => [field.name, field.type])).toEqual([['id', 'Long']]);
  });

  it('distinguishes documented declarations and constants with one-token declaration lookahead', () => {
    const result = parse(`COUNT = 1
      /** Entity documentation */ @custom entity A
      /** Enum documentation */ enum E { VALUE }
      /** Standalone documentation */ application { config { customOption customValue } }`);
    expect(result.children.constantDeclaration).toHaveLength(1);
    expect(result.children.entityDeclaration).toHaveLength(1);
    expect(result.children.enumDeclaration).toHaveLength(1);
    expect(result.children.applicationDeclaration).toHaveLength(1);
  });

  it('can recover a missing closing parenthesis and still parse the following entity', () => {
    const recovering = new JDLParser(tokens.tokens, { recoveryEnabled: true });
    recovering.parse();
    recovering.input = lexer.tokenize('entity A(table { value String } entity B { second String }').tokens;
    const result = recovering.prog();
    expect(recovering.errors).toHaveLength(1);
    expect(result.children.entityDeclaration).toHaveLength(2);
  });
});
