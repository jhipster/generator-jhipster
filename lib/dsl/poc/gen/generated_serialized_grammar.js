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
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "relationDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "enumDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "dtoDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "paginationDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "serviceDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "Terminal",
										"name": "COMMENT",
										"label": "COMMENT",
										"occurrenceInParent": 1,
										"pattern": "\\/\\*[^]*?\\*\\/"
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "microserviceDecl1",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "searchEngineDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "noClientDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "noServerDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "angularSuffixDecl",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "noFluentMethod",
										"occurrenceInParent": 1
									}
								]
							},
							{
								"type": "Flat",
								"definition": [
									{
										"type": "NonTerminal",
										"name": "filterDecl",
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
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
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
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
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
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
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
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
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
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
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
								"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
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
	},
	{
		"type": "Rule",
		"name": "relationDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "RELATIONSHIP",
				"label": "RELATIONSHIP",
				"occurrenceInParent": 1,
				"pattern": "relationship"
			},
			{
				"type": "NonTerminal",
				"name": "relationshipType",
				"occurrenceInParent": 1
			},
			{
				"type": "Terminal",
				"name": "LCURLY",
				"label": "LCURLY",
				"occurrenceInParent": 1,
				"pattern": "{"
			},
			{
				"type": "Repetition",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "relationshipBody",
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
		"name": "relationshipType",
		"definition": [
			{
				"type": "Alternation",
				"definition": [
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "ONE_TO_ONE",
								"label": "ONE_TO_ONE",
								"occurrenceInParent": 1,
								"pattern": "OneToOne"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "ONE_TO_MANY",
								"label": "ONE_TO_MANY",
								"occurrenceInParent": 1,
								"pattern": "OneToMany"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "MANY_TO_ONE",
								"label": "MANY_TO_ONE",
								"occurrenceInParent": 1,
								"pattern": "ManyToOne"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "MANY_TO_MANY",
								"label": "MANY_TO_MANY",
								"occurrenceInParent": 1,
								"pattern": "ManyToMany"
							}
						]
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "relationshipBody",
		"definition": [
			{
				"type": "NonTerminal",
				"name": "relationshipSide",
				"occurrenceInParent": 1
			},
			{
				"type": "Terminal",
				"name": "TO",
				"label": "TO",
				"occurrenceInParent": 1,
				"pattern": "to"
			},
			{
				"type": "NonTerminal",
				"name": "relationshipSide",
				"occurrenceInParent": 2
			}
		]
	},
	{
		"type": "Rule",
		"name": "relationshipSide",
		"definition": [
			{
				"type": "NonTerminal",
				"name": "comment",
				"occurrenceInParent": 1
			},
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "Terminal",
						"name": "LCURLY",
						"label": "LCURLY",
						"occurrenceInParent": 1,
						"pattern": "{"
					},
					{
						"type": "Terminal",
						"name": "NAME",
						"label": "NAME",
						"occurrenceInParent": 2,
						"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
					},
					{
						"type": "Option",
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
						"type": "Terminal",
						"name": "RCURLY",
						"label": "RCURLY",
						"occurrenceInParent": 1,
						"pattern": "}"
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "enumDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "ENUM",
				"label": "ENUM",
				"occurrenceInParent": 1,
				"pattern": "enum"
			},
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
			},
			{
				"type": "Terminal",
				"name": "LCURLY",
				"label": "LCURLY",
				"occurrenceInParent": 1,
				"pattern": "{"
			},
			{
				"type": "NonTerminal",
				"name": "enumPropList",
				"occurrenceInParent": 1
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
		"name": "enumPropList",
		"definition": [
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
			},
			{
				"type": "Repetition",
				"definition": [
					{
						"type": "Terminal",
						"name": "COMMA",
						"label": "COMMA",
						"occurrenceInParent": 1,
						"pattern": ","
					},
					{
						"type": "Terminal",
						"name": "NAME",
						"label": "NAME",
						"occurrenceInParent": 2,
						"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "dtoDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "DTO",
				"label": "DTO",
				"occurrenceInParent": 1,
				"pattern": "dto"
			},
			{
				"type": "NonTerminal",
				"name": "entityList",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "entityList",
		"definition": [
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
						"type": "Terminal",
						"name": "NAME",
						"label": "NAME",
						"occurrenceInParent": 1,
						"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
					}
				]
			},
			{
				"type": "Alternation",
				"definition": [
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "NAME",
								"label": "NAME",
								"occurrenceInParent": 2,
								"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "STAR",
								"label": "STAR",
								"occurrenceInParent": 1,
								"pattern": "*"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "ALL",
								"label": "ALL",
								"occurrenceInParent": 1,
								"pattern": "all"
							}
						]
					}
				]
			},
			{
				"type": "Terminal",
				"name": "WITH",
				"label": "WITH",
				"occurrenceInParent": 1,
				"pattern": "with"
			},
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 3,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
			}
		]
	},
	{
		"type": "Rule",
		"name": "exclusion",
		"definition": [
			{
				"type": "Terminal",
				"name": "EXCEPT",
				"label": "EXCEPT",
				"occurrenceInParent": 1,
				"pattern": "except"
			},
			{
				"type": "Terminal",
				"name": "NAME",
				"label": "NAME",
				"occurrenceInParent": 1,
				"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
			},
			{
				"type": "Repetition",
				"definition": [
					{
						"type": "Terminal",
						"name": "COMMA",
						"label": "COMMA",
						"occurrenceInParent": 1,
						"pattern": ","
					},
					{
						"type": "Terminal",
						"name": "NAME",
						"label": "NAME",
						"occurrenceInParent": 2,
						"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "paginationDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "PAGINATE",
				"label": "PAGINATE",
				"occurrenceInParent": 1,
				"pattern": "paginate"
			},
			{
				"type": "NonTerminal",
				"name": "entityList",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "serviceDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "SERVICE",
				"label": "SERVICE",
				"occurrenceInParent": 1,
				"pattern": "service"
			},
			{
				"type": "NonTerminal",
				"name": "entityList",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "microserviceDecl1",
		"definition": [
			{
				"type": "Terminal",
				"name": "MICROSERVICE",
				"label": "MICROSERVICE",
				"occurrenceInParent": 1,
				"pattern": "microservice"
			},
			{
				"type": "NonTerminal",
				"name": "entityList",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "searchEngineDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "SEARCH",
				"label": "SEARCH",
				"occurrenceInParent": 1,
				"pattern": "search"
			},
			{
				"type": "NonTerminal",
				"name": "entityList",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "noClientDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "SKIP_CLIENT",
				"label": "SKIP_CLIENT",
				"occurrenceInParent": 1,
				"pattern": "skipClient"
			},
			{
				"type": "Terminal",
				"name": "FOR",
				"label": "FOR",
				"occurrenceInParent": 1,
				"pattern": "for"
			},
			{
				"type": "NonTerminal",
				"name": "filterDef",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "noServerDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "SKIP_SERVER",
				"label": "SKIP_SERVER",
				"occurrenceInParent": 1,
				"pattern": "skipServer"
			},
			{
				"type": "Terminal",
				"name": "FOR",
				"label": "FOR",
				"occurrenceInParent": 1,
				"pattern": "for"
			},
			{
				"type": "NonTerminal",
				"name": "filterDef",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "noFluentMethod",
		"definition": [
			{
				"type": "Terminal",
				"name": "NO_FLUENT_METHOD",
				"label": "NO_FLUENT_METHOD",
				"occurrenceInParent": 1,
				"pattern": "noFluentMethod"
			},
			{
				"type": "Terminal",
				"name": "FOR",
				"label": "FOR",
				"occurrenceInParent": 1,
				"pattern": "for"
			},
			{
				"type": "NonTerminal",
				"name": "filterDef",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "filterDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "FILTER",
				"label": "FILTER",
				"occurrenceInParent": 1,
				"pattern": "filter"
			},
			{
				"type": "NonTerminal",
				"name": "filterDef",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "filterDef",
		"definition": [
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
						"type": "Terminal",
						"name": "NAME",
						"label": "NAME",
						"occurrenceInParent": 1,
						"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
					}
				]
			},
			{
				"type": "Alternation",
				"definition": [
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "NAME",
								"label": "NAME",
								"occurrenceInParent": 2,
								"pattern": "[a-zA-Z_][a-zA-Z_\\d]*"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "STAR",
								"label": "STAR",
								"occurrenceInParent": 1,
								"pattern": "*"
							}
						]
					},
					{
						"type": "Flat",
						"definition": [
							{
								"type": "Terminal",
								"name": "ALL",
								"label": "ALL",
								"occurrenceInParent": 1,
								"pattern": "all"
							}
						]
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "angularSuffixDecl",
		"definition": [
			{
				"type": "Terminal",
				"name": "ANGULAR_SUFFIX",
				"label": "ANGULAR_SUFFIX",
				"occurrenceInParent": 1,
				"pattern": "angularSuffix"
			},
			{
				"type": "NonTerminal",
				"name": "entityList",
				"occurrenceInParent": 1
			},
			{
				"type": "Option",
				"definition": [
					{
						"type": "NonTerminal",
						"name": "exclusion",
						"occurrenceInParent": 1
					}
				]
			}
		]
	},
	{
		"type": "Rule",
		"name": "comment",
		"definition": [
			{
				"type": "Option",
				"definition": [
					{
						"type": "Terminal",
						"name": "COMMENT",
						"label": "COMMENT",
						"occurrenceInParent": 1,
						"pattern": "\\/\\*[^]*?\\*\\/"
					}
				]
			}
		]
	}
]