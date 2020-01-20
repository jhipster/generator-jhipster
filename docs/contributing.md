# Contributing to JHipster-Core

## Updating the JDL

### An explanation on the parsing system

Everything happens in the `lib/dsl` folder.

The `lexer` folder is where all "tokens", words used in the JDL are like `entity` or the left parenthesis character 
'('.
This is the place where one can add new keywords to the JDL.
To add a new keyword to the JDL, simply use the `createToken` function with the following object attributes:
  - `name`: the name you want to use for your new keyword.
  - `pattern`: how it is in the JDL:
    - If it's a string, then it's what one will have to write the keyword in the JDL to use it.
    - If it's `Lexer.NA`, it's use to mark categories.
    - If it's `Lexer.SKIPPED`, then the keyword will be skipped.
    - The [Chevrotain's doc][chevrotain-doc-token-patterns]) will give you more details.
  - `categories`: you can generally omit this one unless it's:
    - a deployment key `DEPLOYMENT_KEY`,
    - a boolean `BOOLEAN`,
    - an application configuration key `CONFIG_KEY`.
  - For more info, check the [Chevrotain doc][chevrotain-doc-token-config] about other options. 

The folder contains:
  - token files (one for application config tokens, another for relationship types, etc.)
  - an "utils" file where a single function exists: one that creates tokens from configs (chevrotain-related)

---

The `jdl_parser.js` file is where grammatical rules are defined.

Let's take an example:
```javascript
entityTableNameDeclaration() {
  this.RULE('entityTableNameDeclaration', () => {
    this.CONSUME(LexerTokens.LPAREN);
    this.CONSUME(LexerTokens.NAME);
    this.CONSUME(LexerTokens.RPAREN);
  });
}
```

This file contains other declarations like that, let's break this example down:
  - The file is a regular class, and one declares rules by adding methods to this class.
  - The method's name is pretty important here as the parser will use it to map what it found to the
    [AST][ast-definition]. More on that point later.
  - The method's body works like this: if a declaration has to have a finite set of expected characters, then the method
    should reflect that. For instance, the entity table name's declaration expects a name surrounded by a left parenthesis
    and a right one. Here, the `CONSUME` method is used to say "in the entity table name declaration I expect a left
    parenthesis, then a name and finally a right parenthesis".
    
Here's how this file works:
  - One begins by adding a new method in the class, then calls it in the `parse` method of the same class.
  - Then add this method as a "rule" in the grammar.

For instance, the `prog` method handles the "top-level" declarations (entities, applications, enums, etc.) and not nested
rules (entity table names, entity fields, etc.). This method calls several times the `SUBRULE` method: that means that
the `prog` rule can have subrules.

---

The `ast_builder.js` file mirrors the previous file in the way that it handles what has been matched by the previous file's
work and create an [AST][ast-definition] (abstract syntax tree). This tree-object will then be used to create and fill
JDL objects.

---

Finally, the `validator.js` simply validates that every token has the expected "form" (type, pattern).

[ast-definition]: https://en.wikipedia.org/wiki/Abstract_syntax_tree
[chevrotain-doc-token-config]: https://sap.github.io/chevrotain/documentation/6_5_0/interfaces/itokenconfig.html
[chevrotain-doc-token-patterns]: https://sap.github.io/chevrotain/docs/guide/custom_token_patterns.html#background
 
