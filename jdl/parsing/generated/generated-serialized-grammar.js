/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

/* eslint-disable no-unused-vars */
const serializedGrammar = [
    {
        type: 'Rule',
        name: 'prog',
        orgText: '',
        definition: [
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Alternation',
                        idx: 0,
                        definition: [
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'entityDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'relationDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'enumDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'Terminal',
                                        name: 'JAVADOC',
                                        label: 'JAVADOC',
                                        idx: 0,
                                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'unaryOptionDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'binaryOptionDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'applicationDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'deploymentDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'constantDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'constantDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Terminal',
                name: 'EQUALS',
                label: "'='",
                idx: 0,
                pattern: '=',
            },
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'DECIMAL',
                                label: 'DECIMAL',
                                idx: 0,
                                pattern: '-?\\d+\\.\\d+',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'INTEGER',
                                label: 'INTEGER',
                                idx: 0,
                                pattern: '-?\\d+',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'entityDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'JAVADOC',
                        label: 'JAVADOC',
                        idx: 0,
                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                    },
                ],
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'annotationDeclaration',
                        idx: 0,
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'ENTITY',
                label: "'entity'",
                idx: 0,
                pattern: 'entity',
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Option',
                idx: 1,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'entityTableNameDeclaration',
                        idx: 0,
                    },
                ],
            },
            {
                type: 'Option',
                idx: 2,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'entityBody',
                        idx: 0,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'annotationDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'AT',
                label: "'@'",
                idx: 0,
                pattern: '@',
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'LPAREN',
                        label: "'('",
                        idx: 0,
                        pattern: '(',
                    },
                    {
                        type: 'Alternation',
                        idx: 0,
                        definition: [
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'Terminal',
                                        name: 'NAME',
                                        label: 'NAME',
                                        idx: 2,
                                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'Terminal',
                                        name: 'INTEGER',
                                        label: 'INTEGER',
                                        idx: 3,
                                        pattern: '-?\\d+',
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'Terminal',
                                        name: 'DECIMAL',
                                        label: 'DECIMAL',
                                        idx: 3,
                                        pattern: '-?\\d+\\.\\d+',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'Terminal',
                        name: 'RPAREN',
                        label: "')'",
                        idx: 0,
                        pattern: ')',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'entityTableNameDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'LPAREN',
                label: "'('",
                idx: 0,
                pattern: '(',
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Terminal',
                name: 'RPAREN',
                label: "')'",
                idx: 0,
                pattern: ')',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'entityBody',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'LCURLY',
                label: "'{'",
                idx: 0,
                pattern: '{',
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'fieldDeclaration',
                        idx: 0,
                    },
                    {
                        type: 'Option',
                        idx: 0,
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'COMMA',
                                label: "','",
                                idx: 0,
                                pattern: ',',
                            },
                        ],
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'RCURLY',
                label: "'}'",
                idx: 0,
                pattern: '}',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'fieldDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'JAVADOC',
                        label: 'JAVADOC',
                        idx: 0,
                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                    },
                ],
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'annotationDeclaration',
                        idx: 0,
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'NonTerminal',
                name: 'type',
                idx: 0,
            },
            {
                type: 'Repetition',
                idx: 1,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'validation',
                        idx: 0,
                    },
                ],
            },
            {
                type: 'Option',
                idx: 2,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'JAVADOC',
                        label: 'JAVADOC',
                        idx: 2,
                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'type',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'validation',
        orgText: '',
        definition: [
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'REQUIRED',
                                label: "'required'",
                                idx: 0,
                                pattern: 'required',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'UNIQUE',
                                label: "'unique'",
                                idx: 0,
                                pattern: 'unique',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'NonTerminal',
                                name: 'minMaxValidation',
                                idx: 0,
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'NonTerminal',
                                name: 'pattern',
                                idx: 0,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'minMaxValidation',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'MIN_MAX_KEYWORD',
                label: 'MIN_MAX_KEYWORD',
                idx: 0,
                pattern: 'NOT_APPLICABLE',
            },
            {
                type: 'Terminal',
                name: 'LPAREN',
                label: "'('",
                idx: 0,
                pattern: '(',
            },
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'DECIMAL',
                                label: 'DECIMAL',
                                idx: 0,
                                pattern: '-?\\d+\\.\\d+',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'INTEGER',
                                label: 'INTEGER',
                                idx: 0,
                                pattern: '-?\\d+',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'NAME',
                                label: 'NAME',
                                idx: 0,
                                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                            },
                        ],
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'RPAREN',
                label: "')'",
                idx: 0,
                pattern: ')',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'pattern',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'PATTERN',
                label: "'pattern'",
                idx: 0,
                pattern: 'pattern',
            },
            {
                type: 'Terminal',
                name: 'LPAREN',
                label: "'('",
                idx: 0,
                pattern: '(',
            },
            {
                type: 'Terminal',
                name: 'REGEX',
                label: 'REGEX',
                idx: 0,
                pattern: '\\/[^\\n\\r]*\\/',
            },
            {
                type: 'Terminal',
                name: 'RPAREN',
                label: "')'",
                idx: 0,
                pattern: ')',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'relationDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'RELATIONSHIP',
                label: "'relationship'",
                idx: 0,
                pattern: 'relationship',
            },
            {
                type: 'NonTerminal',
                name: 'relationshipType',
                idx: 0,
            },
            {
                type: 'Terminal',
                name: 'LCURLY',
                label: "'{'",
                idx: 0,
                pattern: '{',
            },
            {
                type: 'RepetitionMandatory',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'relationshipBody',
                        idx: 0,
                    },
                    {
                        type: 'Option',
                        idx: 0,
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'COMMA',
                                label: "','",
                                idx: 0,
                                pattern: ',',
                            },
                        ],
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'RCURLY',
                label: "'}'",
                idx: 0,
                pattern: '}',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'relationshipType',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'RELATIONSHIP_TYPE',
                label: 'RELATIONSHIP_TYPE',
                idx: 0,
                pattern: 'NOT_APPLICABLE',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'relationshipBody',
        orgText: '',
        definition: [
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'annotationDeclaration',
                        idx: 0,
                    },
                ],
            },
            {
                type: 'NonTerminal',
                name: 'relationshipSide',
                idx: 1,
            },
            {
                type: 'Terminal',
                name: 'TO',
                label: "'to'",
                idx: 0,
                pattern: 'to',
            },
            {
                type: 'NonTerminal',
                name: 'relationshipSide',
                idx: 2,
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'WITH',
                        label: "'with'",
                        idx: 0,
                        pattern: 'with',
                    },
                    {
                        type: 'NonTerminal',
                        name: 'relationshipOptions',
                        idx: 3,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'relationshipSide',
        orgText: '',
        definition: [
            {
                type: 'NonTerminal',
                name: 'comment',
                idx: 0,
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'LCURLY',
                        label: "'{'",
                        idx: 0,
                        pattern: '{',
                    },
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 2,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                    {
                        type: 'Option',
                        idx: 1,
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'LPAREN',
                                label: "'('",
                                idx: 0,
                                pattern: '(',
                            },
                            {
                                type: 'Terminal',
                                name: 'NAME',
                                label: 'NAME',
                                idx: 3,
                                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                            },
                            {
                                type: 'Terminal',
                                name: 'RPAREN',
                                label: "')'",
                                idx: 0,
                                pattern: ')',
                            },
                        ],
                    },
                    {
                        type: 'Option',
                        idx: 2,
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'REQUIRED',
                                label: "'required'",
                                idx: 0,
                                pattern: 'required',
                            },
                        ],
                    },
                    {
                        type: 'Terminal',
                        name: 'RCURLY',
                        label: "'}'",
                        idx: 0,
                        pattern: '}',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'relationshipOptions',
        orgText: '',
        definition: [
            {
                type: 'RepetitionMandatoryWithSeparator',
                idx: 0,
                separator: {
                    type: 'Terminal',
                    name: 'COMMA_WITHOUT_NEWLINE',
                    label: 'COMMA_WITHOUT_NEWLINE',
                    idx: 1,
                    pattern: ',[^\\n\\r]',
                },
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'relationshipOption',
                        idx: 0,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'relationshipOption',
        orgText: '',
        definition: [
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'JPA_DERIVED_IDENTIFIER',
                                label: "'jpaDerivedIdentifier'",
                                idx: 0,
                                pattern: 'jpaDerivedIdentifier',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'enumDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'ENUM',
                label: "'enum'",
                idx: 0,
                pattern: 'enum',
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Terminal',
                name: 'LCURLY',
                label: "'{'",
                idx: 0,
                pattern: '{',
            },
            {
                type: 'NonTerminal',
                name: 'enumPropList',
                idx: 0,
            },
            {
                type: 'Terminal',
                name: 'RCURLY',
                label: "'}'",
                idx: 0,
                pattern: '}',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'enumPropList',
        orgText: '',
        definition: [
            {
                type: 'NonTerminal',
                name: 'enumProp',
                idx: 0,
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'COMMA',
                        label: "','",
                        idx: 0,
                        pattern: ',',
                    },
                    {
                        type: 'NonTerminal',
                        name: 'enumProp',
                        idx: 1,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'enumProp',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'LPAREN',
                        label: "'('",
                        idx: 0,
                        pattern: '(',
                    },
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 2,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                    {
                        type: 'Terminal',
                        name: 'RPAREN',
                        label: "')'",
                        idx: 0,
                        pattern: ')',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'entityList',
        orgText: '',
        definition: [
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 0,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                    {
                        type: 'Terminal',
                        name: 'COMMA',
                        label: "','",
                        idx: 0,
                        pattern: ',',
                    },
                ],
            },
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'STAR',
                                label: "'*'",
                                idx: 0,
                                pattern: '*',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'NAME',
                                label: 'NAME',
                                idx: 1,
                                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                            },
                        ],
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'WITH',
                label: "'with'",
                idx: 0,
                pattern: 'with',
            },
            {
                type: 'Alternation',
                idx: 1,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'NAME',
                                label: 'NAME',
                                idx: 2,
                                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'STRING',
                                label: 'STRING',
                                idx: 3,
                                pattern: '"(?:[^"])*"',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'exclusion',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'EXCEPT',
                label: "'except'",
                idx: 0,
                pattern: 'except',
            },
            {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'COMMA',
                        label: "','",
                        idx: 0,
                        pattern: ',',
                    },
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 2,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'unaryOptionDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'UNARY_OPTION',
                label: 'UNARY_OPTION',
                idx: 0,
                pattern: 'NOT_APPLICABLE',
            },
            {
                type: 'NonTerminal',
                name: 'filterDef',
                idx: 0,
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'exclusion',
                        idx: 0,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'binaryOptionDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'BINARY_OPTION',
                label: 'BINARY_OPTION',
                idx: 0,
                pattern: 'NOT_APPLICABLE',
            },
            {
                type: 'NonTerminal',
                name: 'entityList',
                idx: 0,
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'exclusion',
                        idx: 0,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'filterDef',
        orgText: '',
        definition: [
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 0,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                    {
                        type: 'Terminal',
                        name: 'COMMA',
                        label: "','",
                        idx: 0,
                        pattern: ',',
                    },
                ],
            },
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'STAR',
                                label: "'*'",
                                idx: 0,
                                pattern: '*',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'NAME',
                                label: 'NAME',
                                idx: 1,
                                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'comment',
        orgText: '',
        definition: [
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'JAVADOC',
                        label: 'JAVADOC',
                        idx: 0,
                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'deploymentDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'DEPLOYMENT',
                label: "'deployment'",
                idx: 0,
                pattern: 'deployment',
            },
            {
                type: 'Terminal',
                name: 'LCURLY',
                label: "'{'",
                idx: 0,
                pattern: '{',
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Alternation',
                        idx: 0,
                        definition: [
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'Terminal',
                                        name: 'JAVADOC',
                                        label: 'JAVADOC',
                                        idx: 0,
                                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'deploymentConfigDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'RCURLY',
                label: "'}'",
                idx: 0,
                pattern: '}',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'deploymentConfigDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'DEPLOYMENT_KEY',
                label: 'DEPLOYMENT_KEY',
                idx: 0,
                pattern: 'NOT_APPLICABLE',
            },
            {
                type: 'NonTerminal',
                name: 'deploymentConfigValue',
                idx: 0,
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'COMMA',
                        label: "','",
                        idx: 0,
                        pattern: ',',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'deploymentConfigValue',
        orgText: '',
        definition: [
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'BOOLEAN',
                                label: 'BOOLEAN',
                                idx: 0,
                                pattern: 'NOT_APPLICABLE',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'NonTerminal',
                                name: 'qualifiedName',
                                idx: 0,
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'NonTerminal',
                                name: 'list',
                                idx: 0,
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'INTEGER',
                                label: 'INTEGER',
                                idx: 0,
                                pattern: '-?\\d+',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'STRING',
                                label: 'STRING',
                                idx: 0,
                                pattern: '"(?:[^"])*"',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'applicationDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'APPLICATION',
                label: "'application'",
                idx: 0,
                pattern: 'application',
            },
            {
                type: 'Terminal',
                name: 'LCURLY',
                label: "'{'",
                idx: 0,
                pattern: '{',
            },
            {
                type: 'NonTerminal',
                name: 'applicationSubDeclaration',
                idx: 0,
            },
            {
                type: 'Terminal',
                name: 'RCURLY',
                label: "'}'",
                idx: 0,
                pattern: '}',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'applicationSubDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Alternation',
                        idx: 0,
                        definition: [
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'applicationSubConfig',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'applicationSubEntities',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'unaryOptionDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'binaryOptionDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'applicationSubConfig',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'CONFIG',
                label: "'config'",
                idx: 0,
                pattern: 'config',
            },
            {
                type: 'Terminal',
                name: 'LCURLY',
                label: "'{'",
                idx: 0,
                pattern: '{',
            },
            {
                type: 'Repetition',
                idx: 0,
                definition: [
                    {
                        type: 'Alternation',
                        idx: 0,
                        definition: [
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'Terminal',
                                        name: 'JAVADOC',
                                        label: 'JAVADOC',
                                        idx: 0,
                                        pattern: '\\/\\*\\*([\\s\\S]*?)\\*\\/',
                                    },
                                ],
                            },
                            {
                                type: 'Alternative',
                                definition: [
                                    {
                                        type: 'NonTerminal',
                                        name: 'applicationConfigDeclaration',
                                        idx: 0,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'RCURLY',
                label: "'}'",
                idx: 0,
                pattern: '}',
            },
        ],
    },
    {
        type: 'Rule',
        name: 'applicationSubEntities',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'ENTITIES',
                label: "'entities'",
                idx: 0,
                pattern: 'entities',
            },
            {
                type: 'NonTerminal',
                name: 'filterDef',
                idx: 0,
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'NonTerminal',
                        name: 'exclusion',
                        idx: 0,
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'applicationConfigDeclaration',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'CONFIG_KEY',
                label: 'CONFIG_KEY',
                idx: 0,
                pattern: 'NOT_APPLICABLE',
            },
            {
                type: 'NonTerminal',
                name: 'configValue',
                idx: 0,
            },
            {
                type: 'Option',
                idx: 0,
                definition: [
                    {
                        type: 'Terminal',
                        name: 'COMMA',
                        label: "','",
                        idx: 0,
                        pattern: ',',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'configValue',
        orgText: '',
        definition: [
            {
                type: 'Alternation',
                idx: 0,
                definition: [
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'BOOLEAN',
                                label: 'BOOLEAN',
                                idx: 0,
                                pattern: 'NOT_APPLICABLE',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'NonTerminal',
                                name: 'qualifiedName',
                                idx: 0,
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'NonTerminal',
                                name: 'list',
                                idx: 0,
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'INTEGER',
                                label: 'INTEGER',
                                idx: 0,
                                pattern: '-?\\d+',
                            },
                        ],
                    },
                    {
                        type: 'Alternative',
                        definition: [
                            {
                                type: 'Terminal',
                                name: 'STRING',
                                label: 'STRING',
                                idx: 0,
                                pattern: '"(?:[^"])*"',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'qualifiedName',
        orgText: '',
        definition: [
            {
                type: 'RepetitionMandatoryWithSeparator',
                idx: 0,
                separator: {
                    type: 'Terminal',
                    name: 'DOT',
                    label: "'.'",
                    idx: 1,
                    pattern: '.',
                },
                definition: [
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 0,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                ],
            },
        ],
    },
    {
        type: 'Rule',
        name: 'list',
        orgText: '',
        definition: [
            {
                type: 'Terminal',
                name: 'LSQUARE',
                label: "'['",
                idx: 0,
                pattern: '[',
            },
            {
                type: 'RepetitionWithSeparator',
                idx: 0,
                separator: {
                    type: 'Terminal',
                    name: 'COMMA',
                    label: "','",
                    idx: 1,
                    pattern: ',',
                },
                definition: [
                    {
                        type: 'Terminal',
                        name: 'NAME',
                        label: 'NAME',
                        idx: 0,
                        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*',
                    },
                ],
            },
            {
                type: 'Terminal',
                name: 'RSQUARE',
                label: "']'",
                idx: 0,
                pattern: ']',
            },
        ],
    },
];
