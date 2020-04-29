# The files & folders

The parsing system is located in the `dsl` folder inside `lib`.
When cloning the project and installing its dependencies you should see the following files & folders:
```
> lib
  > dsl
    > gen
      * generated_serialized_grammar.js
      * grammar.html
    > lexer
      * application_tokens.js
      * deployment_tokens.js
      * lexer_tokens.js
      * minmax_tokens.js
      * relationship_type_tokens.js
      * shared_tokens.js
      * token_creator.js
    > self_checks
      * parsing_system_checker.js
      * token_collector_visitor.js
    * api.js
    * ast_builder.js
    * exports.js
    * jdl_parser.js
    * validator.js
```

1. [The gen folder](#gen)
1. [The lexer folder](#lexer)
1. [The self_checks folder](#self_checks)
1. [The api.js file](#apijs)
1. [The jdl_parser and ast_builder files](#jdl_parser--ast_builder)
   1. [The JDL parser](#jdl-parser)
   1. [The AST Builder](#ast-builder)
1. [The validator file](#validator)

---

## gen

This folder contains the JDL grammar visualization.
Open the `grammar.html` file in your favorite browser and you'll see a visual representation of the JDL's grammar.
![A sample of the JDL grammar](images/jdl_grammar_diag.png)

The `generated_serialized_grammar.js` file is always generated:
  - installing the project
  - before making a release

---

## lexer

The `lexer` folder contains files related to the tokens.
A token is an actual keyword in the JDL, like `OneToOne` for relationships or `databaseType` for applications.
As the names suggest, each files is related to a specific thing:
  - `application_tokens` only deals with application tokens,
  - `minmax_tokens` handles the `min`, `max`, `maxbytes` etc. validation tokens,
  - `shared_tokens` deals with tokens that are shared with all the other tokens,
  - etc.

There are two exceptions for this rule: the `lexer` and the `token_creator` files.
The `lexer` file contains all the other tokens that don't have their own file yet (but will in the near future).
The `token_creator` file contains the function that creates tokens.

### Tokens

As previously stated, a token is keyword in a grammar. Here, `application` or `entity` are tokens.
They are created using the `createTokenFromConfig` function in the `token_creator` file.
This function returns a [token][token-doc] using the [create_token][create-token-doc] function from Chevrotain.

A token is simply a keyword that has:
  - a pattern: how the keyword is recognized in the grammar,
  - a category: its group in the grammar,
    - for instance, the `min` and `max` tokens all have the same category to simplify the grammar and how to parse them
  - a name: a private name used to access the token,
    - it's always the capitalized pattern with underscores
  - a label: used to access the matched content.

---

## self_checks

This folder contains internal self tests for the grammar, notably in the `parsing_system_checker` file.
This file will check that all tokens are actually used.

One can update this file to add additional checks if need be.

---

## api.js

This file handles the JDL stuff outside of the project, like the JDL editor [here][jdl-editor].
It can provide auto-completion, throw error messages, etc.

This is the file to change if you want to enhance the "JDL experience" online.

--

## jdl_parser & ast_builder

### JDL Parser

The `jdl_parser` file is where the grammar rules are actually described.
For instance, this is how an enumeration is described:
```javascript
  enumDeclaration() {
    this.RULE('enumDeclaration', () => {
      this.CONSUME(LexerTokens.ENUM);
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.LCURLY);
      this.SUBRULE(this.enumPropList);
      this.CONSUME(LexerTokens.RCURLY);
    });
  }
```

Here, we say that to parse an enumeration the parsing system will encounter:
  - the `ENUM` token, which is `enum`
  - a `NAME` token (the enum's name), which matches the following regex `/[a-zA-Z_][a-zA-Z_\-\d]*/`
    - one can find the regex in the `lexer/shared_tokens.js` file
  - a `LCURLY` token: `{`
  - here there's the subrule `enumPropList` which is basically a way of telling the parsing system that the enum props
    are defined in an other rule
  - a `RCURLY` token: `}`

Here are the two remaining rules:
```javascript
  enumPropList() {
    this.RULE('enumPropList', () => {
      this.SUBRULE(this.enumProp);
      this.MANY(() => {
        this.CONSUME(LexerTokens.COMMA);
        this.SUBRULE1(this.enumProp);
      });
    });
  }

  enumProp() {
    this.RULE('enumProp', () => {
      this.CONSUME(LexerTokens.NAME, { LABEL: 'enumPropKey' });
      this.OPTION(() => {
        this.CONSUME(LexerTokens.LPAREN);
        this.CONSUME2(LexerTokens.NAME, { LABEL: 'enumPropValue' });
        this.CONSUME(LexerTokens.RPAREN);
      });
    });
  }
```

Calling `this.SUBRULE` is like calling another function and telling the parsing system to match what's next with the
other function's content.
If we look at the two rules now:
  - we call to match the content from another rule `enumProp`:
    - to match a name, labelled `enumPropKey` (like 'FRENCH', or 'BANANA')
    - and optionally a value between parenthesises: 'FRENCH(frenchy)'
  - each enum prop is separated by a comma

The `enumPropList` rule actually says: I'll match at least one `enumProp`, or more as long as they're separated by
commas.

Details for each of these functions are in the chevrotain's doc [here][cst-parser-doc].

### AST Builder

In the top 2 of the most important files in the JDL parsing system, there is the `ast_builder`.
What makes it important is that it's the one that creates the AST from what's been matched earlier by the JDL parser.
If we take the previous example from the JDL parser:
```javascript
enumDeclaration(context) {
  const name = context.NAME[0].image;
  const values = this.visit(context.enumPropList);

  return { name, values };
}

enumPropList(context) {
  return context.enumProp.map(this.visit, this);
}

enumProp(context) {
  const prop = {
    key: context.enumPropKey[0].image
  };
  if (context.enumPropValue) {
    prop.value = context.enumPropValue[0].image;
  }
  return prop;
}
```

We can notice several things:
  - The method names are the same as in the parser
    - This is pretty important to have mirroring names so that the parsing system can associate the matching to the
      AST building phase.
  - The `enumDeclaration` method returns a name and values
    - The name is the enum's name
    - The values are obtained by "visiting" the `enumPropList` attribute of the context
      - The AST builder is a visitor (see [this resource][gof-visitor] to read more about this design pattern)
      - The context is what has been matched
      - The `visit` method comes from the `BaseCstVisitor`, [more details here][cst-visitor-doc]).

The role of the AST builder is to take what has been matched and parsed to convert it to whatver form we see fit.
Here, the AST builder builds an object which is filled with entities, applications, enums, etc.
Finally, this object will be converted to an actual JDL object.

---

## validator

Finally, the `validator` file checks the JDL content against grammatical errors.
For instance, it will throw an error if the value to the `skipClient` option is not a boolean.

[create-token-doc]: https://sap.github.io/chevrotain/documentation/6_5_0/globals.html#createtoken
[cst-parser-doc]: https://sap.github.io/chevrotain/documentation/6_5_0/classes/cstparser.html
[cst-visitor-doc]: https://sap.github.io/chevrotain/docs/guide/concrete_syntax_tree.html#cst-visitor
[gof-visitor]: https://www.gofpatterns.com/behavioral-design-patterns/behavioral-patterns/visitor-pattern.php
[jdl-editor]: https://start.jhipster.tech/jdl-studio/
[token-doc]: https://sap.github.io/chevrotain/documentation/6_5_0/interfaces/tokentype.html
