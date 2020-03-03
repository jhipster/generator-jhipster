# Adding an option to the JDL

This section details how to add an (entity) option to the JDL.

---

## Case study

As an example, say the new option to add is a `binary` option named `myNewOption`. 

_Note: binary means that the option has a value. For example, `dto` has `mapstruct` whereas the `embedded` option has
no value and is a unary option._

---

## Parsing system additions

First of all, we have to add a new token to the option file, in the `lib/dsl/lexer/option_tokens.js`:
```
{ name: 'MY_NEW_OPTION', pattern: 'myNewOption', type: 'binary' }
```
Here we can see that:
  - we can access the new token `MY_NEW_OPTION` from the token list,
  - `myNewOption` is how to use it in the JDL,
  - `binary` simply means that it's a binary option. 

Once it's done, the next file to change is the `lib/dsl/ast_builder.js` file.
Because it's an option, we add a new entry to the options in the `prog` method.
```
myNewOption: {}
```

That's all there is to the parsing system, we'll know see what needs doing in the other files and why.

---

## Other code additions
   
First, we the new option to its file: `lib/core/jhipster/binary_options.js`.
We have to set:
  - the option,
  - its value(s) if applicable.

We also have to make sure the option is exported in JSON files after parsing.
For that, first go to the `Lib/parsers/entity_parser.js` file and add the option in the `setEntityNamesOptions` function.

The `myNewOption` option is a binary option and JHipster has a way to deal with them.
Each option is referenced in every entity file (in the `.jhipster` folder of any generated app).
So, we have to modify the `lib/core/jhipster/json_entity.js` file which represents an actual entity file.

---

## Tests

This is the most important part. If the tests are launched at this point, there'd be some failing tests. This is normal
and expected.

To test that the option is added to the JDL, simply add the new option at the top of the `test/spec/grammargrammar.spec.js`
file and the tests will fail or succeed depending on what has been coded.

Next, we should edit the `test/test_files/annotations_and_options.jdl` sample file and add our new option: both as an annotation and as
a regular option (they're the same thing). This implies adding tests in the `lib/parsers/document_parser.js` file too.
This file's role is to convert what has been parsed by the parsing system to a JDLObject.

We should also update the tests for the `entity_parser` file which has been changed.

Failing tests are expected, and fixing them is also part of the game.

And that's how you add an option to the JDL.
