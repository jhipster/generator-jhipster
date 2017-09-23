/*eslint-disable */
const serializedGrammar = [
	{
		"type": "Rule",
		"name": "prog",
		"definition": [
			{
				"type": "Repetition",
				"definition": [
					{
						"type": "Alternation",
						"definition": [
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "constantDeclaration",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "entityDeclaration",
										"occurrenceInParent": 1
									}
								]
							}
						]
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "constantDeclaration",
		"definition": [
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d()]*"
			},
			{
				"type": "Terminal",
				"name": "EQUALS",
				"label": "EQUALS",
				"occurrenceInParent": 1,
				"pattern": "="
			},
			{
				"type": "Terminal",
				"name": "INTEGER",
				"label": "INTEGER",
				"occurrenceInParent": 1,
				"pattern": "-?\\d+"
			}
		]
	},
	{
		"type": "Rule",
		"name": "entityDeclaration",
		"definition": [
			{
				"type": "Terminal",
				"name": "ENTITY",
				"label": "ENTITY",
				"occurrenceInParent": 1,
				"pattern": "entity"
			},
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d()]*"
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "entityTableNameDeclaration",
						"occurrenceInParent": 1
					}
				]
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "entityBody",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "entityTableNameDeclaration",
		"definition": [
			{
				"type": "Terminal",
				"name": "LPAREN",
				"label": "LPAREN",
				"occurrenceInParent": 1,
				"pattern": "("
			},
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d()]*"
			},
			{
				"type": "Terminal",
				"name": "RPAREN",
				"label": "RPAREN",
				"occurrenceInParent": 1,
				"pattern": ")"
			}
		]
	},
	{
		"type": "Rule",
		"name": "entityBody",
		"definition": [
			{
				"type": "Terminal",
				"name": "LCURLY",
				"label": "LCURLY",
				"occurrenceInParent": 1,
				"pattern": "{"
			},
			{
				"type": "RepetitionMandatoryWithSeparator",
				"separator": {
					"type": "Terminal",
					"name": "COMMA",
					"label": "COMMA",
					"occurrenceInParent": 1,
					"pattern": ","
				},
				"definition": [
					{
						"type": "NonTerminal",
						"name": "fieldDeclaration",
						"occurrenceInParent": 1
					}
				]
			},
			{
				"type": "Terminal",
				"name": "RCURLY",
				"label": "RCURLY",
				"occurrenceInParent": 1,
				"pattern": "}"
			}
		]
	},
	{
		"type": "Rule",
		"name": "fieldDeclaration",
		"definition": [
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d()]*"
			},
			{
				"type": "NonTerminal",
				"name": "type",
				"occurrenceInParent": 1
			},
			{
				"type": "RepetitionWithSeparator",
				"separator": {
					"type": "Terminal",
					"name": "COMMA",
					"label": "COMMA",
					"occurrenceInParent": 1,
					"pattern": ","
				},
				"definition": [
					{
						"type": "NonTerminal",
						"name": "validation",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "type",
		"definition": [
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d()]*"
			}
		]
	},
	{
		"type": "Rule",
		"name": "validation",
		"definition": [
			{
				"type": "Alternation",
				"definition": [
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "REQUIRED",
								"label": "REQUIRED",
								"occurrenceInParent": 1,
								"pattern": "required"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "NonTerminal",
								"name": "minMaxValidation",
								"occurrenceInParent": 1
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "NonTerminal",
								"name": "pattern",
								"occurrenceInParent": 1
							}
						]
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "minMaxValidation",
		"definition": [
			{
				"type": "Terminal",
				"name": "MIN_MAX_KEYWORD",
				"label": "MIN_MAX_KEYWORD",
				"occurrenceInParent": 1,
				"pattern": "NOT_APPLICABLE"
			},
			{
				"type": "Terminal",
				"name": "LPAREN",
				"label": "LPAREN",
				"occurrenceInParent": 1,
				"pattern": "("
			},
			{
				"type": "Alternation",
				"definition": [
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "INTEGER",
								"label": "INTEGER",
								"occurrenceInParent": 1,
								"pattern": "-?\\d+"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "NAME",
								"label": "NAME",
								"occurrenceInParent": 1,
								"pattern": "[a-zA-Z_][a-zA-Z_\\d()]*"
							}
						]
					}
				]
			},
			{
				"type": "Terminal",
				"name": "RPAREN",
				"label": "RPAREN",
				"occurrenceInParent": 1,
				"pattern": ")"
			}
		]
	},
	{
		"type": "Rule",
		"name": "pattern",
		"definition": [
			{
				"type": "Terminal",
				"name": "PATTERN",
				"label": "PATTERN",
				"occurrenceInParent": 1,
				"pattern": "pattern"
			},
			{
				"type": "Terminal",
				"name": "LPAREN",
				"label": "LPAREN",
				"occurrenceInParent": 1,
				"pattern": "("
			},
			{
				"type": "Terminal",
				"name": "REGEX",
				"label": "REGEX",
				"occurrenceInParent": 1,
				"pattern": "\\/[^\\n\\r\\/]*\\/"
			},
			{
				"type": "Terminal",
				"name": "RPAREN",
				"label": "RPAREN",
				"occurrenceInParent": 1,
				"pattern": ")"
			}
		]
	}
];
