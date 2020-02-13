# Updating the JDL

This section will focus on updating the JDL by adding some things to it.

---

## Example case 1

For this section we'll add a new option: the `embedded` option that has been added in [6220e55][embedded-option-commit]
and we'll break it down.
We'll focus first on what has been added in the parsing system then in other files.

### Parsing system additions

First of all, we add a new token the option, in the `lexer` file
```javascript
createTokenFromConfig({ name: 'EMBEDDED', pattern: 'embedded' });
```

Then, we have to make a new rule so the `jdl_parser` file has to be updated like so:
  - We create the new rule
```javascript
embeddedDeclaration() {
  this.RULE('embeddedDeclaration', () => {
    this.CONSUME(LexerTokens.EMBEDDED);
    this.SUBRULE(this.filterDef);
    this.OPTION(() => {
      this.SUBRULE(this.exclusion);
    });
  });
}
```
  - We allow users to use it anywhere in the file, like the other options (in the `prog` method)
```javascript
{ ALT: () => this.SUBRULE(this.embeddedDeclaration) }
```
  - We tell the parsing system that there's a new rule (in the `parse` method)
```javascript
this.embeddedDeclaration();
```

Once it's done, the next file to change is the `ast_builder`:
  - Because it's an unary option (unary means that the option doesn't have a value), we add a new entry to the options
```javascript
embedded: { list: [], excluded: [] },
```
  - We map the option's name to the rule's name
```javascript
embeddedDeclaration: 'embedded',
```
  - We parse it
```javascript
embeddedDeclaration(context) {
  return extractListExcluded(context, this);
}
```
  - The `extractListExcluded` method basically means that we want to extract from the context a unary option.

That's all there is to the parsing system, we'll know see what needs doing in the other files and why.

### Other code additions

First, we [add][unary-options-change] the new option to its file: `unary_options`.

Now, we have to make sure the option is exported in JSON files after parsing.
For that, first go to the `entity_parser` file and [enable the option][entity-parser-change].

The `embedded` option is a unary option and JHipster has a way to deal with them.
Each option is referenced in every entity file (in the `.jhipster` folder of any generated app).
So, we have to modify the `json_entity` file which represents an actual entity file.
[Here][json-entity-change]'s the change.

That's all there is to importing JDL files but there something left to do: take care of exporting content.
This is done in the `json_to_jdl_converter` file [that][converter-change] way.

[converter-change]: https://github.com/jhipster/jhipster-core/commit/6220e551f5dc89d68dcc8c38e3c0aa674ad47fa7#diff-ca1b24cb119850301fdf506daeca731a
[embedded-option-commit]: https://github.com/jhipster/jhipster-core/commit/6220e551f5dc89d68dcc8c38e3c0aa674ad47fa7
[entity-parser-change]: https://github.com/jhipster/jhipster-core/commit/6220e551f5dc89d68dcc8c38e3c0aa674ad47fa7#diff-0115e9468c9f771224f0297b8f67f47f
[json-entity-change]: https://github.com/jhipster/jhipster-core/commit/6220e551f5dc89d68dcc8c38e3c0aa674ad47fa7#diff-0d0c47229faaa43d31895e712b0f9098
[unary-options-change]: https://github.com/jhipster/jhipster-core/commit/6220e551f5dc89d68dcc8c38e3c0aa674ad47fa7#diff-4f4c6506236b381f7fae837ed5fef6c7
