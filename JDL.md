# JDL reference

JDL (JHipster Domain Language) describes applications, entities, enums, relationships, entity options and deployments in one
text file, which `jhipster jdl <file>` imports. This document lists everything the language accepts, as implemented in this
repository. For a tutorial, see the [JDL documentation](https://www.jhipster.tech/jdl/intro) on the website.

The language is generic: the grammar knows the structure of a document only. The option keys an application or a
deployment accepts, the entity and relationship options, the validations and the field types are **definitions** handed to
the parser, and JHipster provides its own (see [definitions](#definitions)). This document describes the language and lists
only the values the language itself depends on; for the values JHipster defines, use `jhipster describe app`,
`jhipster describe deployment` or `jhipster describe --config <name>`, or read `lib/jdl-config/`.

Where the pieces live:

- Lexer and grammar: `lib/jdl/core/parsing/lexer/`, `lib/jdl/core/parsing/jdl-parser.ts`.
- Syntax checks (name patterns, names and value kinds against the definitions): `lib/jdl/core/parsing/validator.ts`.
- Semantic rules: `lib/jdl/core/parsing/semantic/rules.ts`.
- JHipster definitions and rules: `lib/jdl-config/`.

## Files

- A JDL file ends with `.jdl` or `.jh`. Several files passed together are concatenated, separated by a newline, and parsed as
  one document.
- Whitespace, including newlines, is insignificant except where noted below.
- Statements may appear in any order, and an entity may be referenced before it is declared.

## Comments and directives

| Syntax        | Meaning                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `// text`     | Internal comment up to the end of the line; removed before parsing.                                                                          |
| `/* text */`  | Internal block comment; ignored.                                                                                                             |
| `/** text */` | Documentation comment (javadoc). Attached to the next entity, field, enum, enum value or relationship side, and exported as `documentation`. |
| `# text`      | Directive: a line starting with `#` (for instance a `#!/usr/bin/env jhipster` shebang) is ignored.                                           |

A documentation comment can also follow a field **on the same line**, in which case it documents that field (enum values
have their own rule, see [enums](#enums)):

```jdl
entity Product {
  price BigDecimal /** the price, taxes included */
}
```

`//` is removed wherever it appears on a line, even inside a string or a regular expression.

## Literals and names

| Kind           | Syntax                     | Notes                                                                                                                                                                                          |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name           | `[a-zA-Z_][a-zA-Z_\-0-9]*` | Keywords (`entity`, `config`, `required`, ...) may be used as names where a name is expected, e.g. as a field name.                                                                            |
| Qualified name | `name.name.name`           | A config value, e.g. a Java package.                                                                                                                                                           |
| Integer        | `-?[0-9]+`                 |                                                                                                                                                                                                |
| Decimal        | `-?[0-9]+.[0-9]+`          |                                                                                                                                                                                                |
| Boolean        | `true`, `false`            |                                                                                                                                                                                                |
| String         | `"..."`                    | Single line or multi line. `\"` does not close the string; backslashes are otherwise kept as written.                                                                                          |
| Regex          | `/.../`                    | Only as a validation value, e.g. `pattern(/.../)`. It extends to the **last** `/` of its line, so do not put anything containing a `/` (such as a `/** comment */`) after it on the same line. |
| List           | `[a, b, c]`                | Names, comma separated; may be empty.                                                                                                                                                          |
| Quoted list    | `["a", "b"]`               | Strings, comma separated.                                                                                                                                                                      |

Naming rules checked by the parser:

| Name of            | Must match               |
| ------------------ | ------------------------ |
| Entity             | `[A-Z][A-Za-z0-9]*`      |
| Enum               | `[A-Z][A-Za-z0-9]*`      |
| Field type         | `[A-Z][A-Za-z0-9]*`      |
| Field              | `[A-Za-z][A-Za-z0-9]*`   |
| Relationship field | `[A-Za-z][A-Za-z0-9]*`   |
| Enum value         | `[A-Z]\w*`               |
| Enum custom value  | `[A-Za-z]\w*` (unquoted) |
| Constant           | `[A-Z_]+`                |

## Top-level statements

A document is a sequence of:

- [constants](#constants)
- [`application` blocks](#applications)
- [`entity` declarations](#entities)
- [`enum` declarations](#enums)
- [`relationship` blocks](#relationships)
- [option statements and `use` statements](#entity-options)
- [`deployment` blocks](#deployments)
- documentation comments

## Constants

```jdl
DEFAULT_MIN_LENGTH = 1
MAX_PRICE = 999.99
```

A constant holds an integer or a decimal and can be used as the value of a numeric validation: `minlength(DEFAULT_MIN_LENGTH)`.
Constants cannot be used anywhere else.

## Applications

```jdl
application {
  config {
    baseName store
    packageName com.mycompany.store
    languages [en, fr]
    blueprints [generator-jhipster-foo]
  }
  config(generator-jhipster-foo) {
    someOption someValue
  }
  entities * except Tag
  dto * with mapstruct
  use serviceImpl, pagination for Product
}
```

Inside an `application` block:

| Statement                     | Meaning                                                                                                                                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config { key value ... }`    | The [application config](#application-config), one entry per line, an optional comma after each. If several `config` blocks are given, only the last one is kept.                                               |
| `config(<blueprint>) { ... }` | Options of a blueprint, exported as `namespaceConfigs.<blueprint>`. Keys are not checked; values are any config value. The blueprint must be listed in `blueprints`. Only the last `config(...)` block is kept. |
| `entities <list>`             | The entities of the application: `*` or `all`, or a comma separated list, optionally followed by `except <list>`. Only the last `entities` statement is kept. Without it, the application has no entity.        |
| Option and `use` statements   | [Entity options](#entity-options) that apply to this application only. Every entity they name must belong to the application.                                                                                   |
| Documentation comments        | Allowed between config entries; ignored.                                                                                                                                                                        |

Several applications may be declared in one file; each one is written to a folder named after its `baseName`. An entity may
belong to several applications. A relationship whose entities belong to different applications is rejected.

A JDL without an `application` block imports its entities into the current application, whose name and type come from the
importer configuration rather than from the JDL.

### Application config

Each `config` entry is `<key> <value>`, where the value is a boolean, an integer, a string, a name, a qualified name, a list or
a quoted list. The keys, the kind of value each takes, an optional pattern for its names, and an optional list of allowed
values come from the definitions: an unknown key or a value of the wrong kind is an error, a value outside the allowed list
is an error, a deprecated key is a warning. `config(<blueprint>)` entries are not checked.

The language itself relies on these keys:

| Key          | Used for                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `baseName`   | The name of the application: its output folder when several applications are declared, the key of its entities, and the application named in error messages. |
| `blueprints` | A list of blueprint names. A `config(<blueprint>)` block is only accepted for a blueprint listed here.                                                       |

## Entities

```jdl
/** A product of the catalog */
@ChangelogDate("20240101000000")
entity Product(product_table) {
  /** The name */
  name String required unique minlength(3) maxlength(50) pattern(/^[A-Z].*$/)
  price BigDecimal required min(0) max(MAX_PRICE)
  status Status
  @MyFieldOption("x")
  image ImageBlob maxbytes(1000000)
}

entity Tag
```

`[/** doc */] [@annotation ...] entity <Name> [(<table_name>)] [{ fields }]`

- The table name in parentheses is optional; it is exported as `entityTableName`.
- The body is optional: `entity Tag` declares an entity without fields.
- Fields are separated by newlines or commas.
- An entity may be declared only once, and a field only once per entity.
- Field names are exported with a lower-case first letter.

### Fields

`[/** doc */] [@annotation ...] <name> <Type> [validation ...] [/** doc on the same line */]`

The type is a field type from the definitions, or the name of an enum declared in the document. The definitions give each
field type (and enums as a whole) the validations it accepts, and may mark a type as deprecated. An unknown type or a
validation the type does not accept is an error; a deprecated type is a warning. JHipster's types are in
`lib/jdl-config/jdl-field-types-config.ts`.

### Validations

Validations follow the type, separated by spaces:

| Form              | Meaning                                                                                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `required`        | Keyword of the language, takes no value.                                                                                                                                                                                                     |
| `unique`          | Keyword of the language, takes no value.                                                                                                                                                                                                     |
| `<name>(<value>)` | A validation from the definitions. Its definition says whether it takes a number (integer, decimal or constant), an integer (integer or constant; a decimal is an error) or a regular expression `/<regex>/` (exported without the slashes). |

A name followed by a parenthesis that is not a defined validation is an error (`Unknown validation`). JHipster's
validations are in `lib/jdl-config/jdl-validation-config.ts`.

## Annotations

An annotation is `@name` or `@name(value)`, where the value is a string, an integer, a decimal, `true`, `false` or a name.
Annotations may be placed before an entity, before a field, and before either side of a relationship. The name is exported
with a lower-case first letter (`@ChangelogDate` becomes `changelogDate`); an annotation without a value is `true`.

- **Entity** annotations are exported under `annotations` in the entity JSON; JHipster merges them into the entity when it
  loads it, so they can set any entity property (e.g. `@ChangelogDate("20240101000000")`). The same annotation given twice
  keeps the last value.
- **Field** annotations are exported under the field's `options`, which JHipster merges into the field. An annotation
  repeated with different values becomes a list.
- **Relationship** annotations are described in [relationships](#relationships).

Annotations are not checked by the JDL: an unknown one is carried over as is.

## Enums

```jdl
/** Status of a product */
enum Status {
  /** in stock */ AVAILABLE (available),
  RESTOCK ("re stock")
  DISCONTINUED
}
```

- Values are separated by commas or newlines.
- A value may take a custom value in parentheses, unquoted (a name) or quoted (any text).
- A value may carry a documentation comment before it or after it. A comment between two values belongs to the first one
  unless a comma separates them: in `A /** doc */ B` it documents `A`, in `A, /** doc */ B` it documents `B`.
- An enum may be declared only once. It is exported on each field that uses it (`fieldValues`, `fieldTypeDocumentation`,
  `fieldValuesJavadocs`).

## Relationships

```jdl
relationship OneToMany {
  /** the products */ Category{product} to /** its category */ Product{category(name) required}
}

relationship ManyToOne {
  Product{owner(login)} to User with builtInEntity
  @OnDelete("CASCADE") Order to @Id Customer
}

relationship ManyToMany {
  Product{tag(name)} to Tag{product}
}
```

`relationship <OneToOne | OneToMany | ManyToOne | ManyToMany> { <body>, ... }`

A block holds one or more relationships of the same type, separated by commas or newlines. Each relationship is:

`[@annotation ...] <side> to [@annotation ...] <side> [with <option>, ...]`

and each side is:

`[/** doc */] <Entity> [{ <field>[(<displayField>)] [required] }]`

- `<field>` is the name of the relationship in that entity; `<displayField>` is the field of the other entity shown in the
  client (exported as `otherEntityField`).
- `required` makes that side mandatory. It is only allowed inside the braces.
- If neither side names its field, both do implicitly: the source gets the destination entity name and the destination the
  source entity name, each with a lower-case first letter, making the relationship bidirectional.
- If only the source names its field, the relationship is unidirectional: the destination entity gets no relationship
  (unless annotations are placed before the source, see below).
- In a `OneToOne` relationship, the source must own the relationship: naming the field on the destination only is an error.
- A required relationship from an entity to itself is an error.
- Both entities must be declared, unless the relationship has an option whose definition marks the destination as a
  built-in entity (JHipster's `builtInEntity`, for `User` and `Authority`).

Relationship options, after `with`, are names from the definitions, separated by commas on the same line; an unknown one is
an error.

Relationship annotations are exported under `options` of the relationship JSON, which JHipster merges into the relationship
(e.g. `@OnDelete("CASCADE")`). Note on which side each one lands:

- Annotations before the **source** side go to the relationship of the **destination** entity.
- Annotations before the **destination** side go to the relationship of the **source** entity.

## Entity options

Entity options apply to a set of entities. At the top level they apply to the whole document; inside an `application` block
they apply to that application only.

```jdl
dto * with mapstruct
service all with serviceImpl except Tag
pagination Product, Order with infinite-scroll
search Product with elasticsearch
readOnly Tag
skipClient Product
angularSuffix Product with mySuffix
clientRootFolder Product with "../shared"
use mapstruct, serviceImpl, pagination for * except Tag
```

The entity list is `*`, `all` (on its own), or comma-separated entity names, optionally followed by `except <names>`.
Statements naming the same option (and value) accumulate. Every entity named must be declared.

Each option is defined as either:

- **unary**: `<option> <entities> [except <entities>]`, no value;
- **binary**: `<option> <entities> with <value> [except <entities>]`, where the value is a name matching
  `[A-Za-z][A-Za-z0-9-_]*` or a string not starting with `/`. The definition may restrict the value to a list of choices.

An unknown option, a unary option given a value, a binary option given none, or a value outside the choices is an error. A
definition may also declare deprecated keywords for an option, accepted with a warning. JHipster's options are in
`lib/jdl-config/jdl-entity-config.ts`.

The `use` statement sets several binary options at once by value: `use <value>, ... for <entities> [except <entities>]`. Each
value selects the option whose choices contain it (with JHipster's options, `mapstruct` selects `dto` and `serviceImpl`
selects `service`). A value that belongs to no option, or `no`, which belongs to several, is an error.

## Deployments

```jdl
deployment {
  deploymentType docker-compose
  appsFolders [gateway, store]
  dockerRepositoryName "myrepo"
}
```

`deployment { key value ... }` with one entry per line and an optional comma after each. Several deployments may be
declared. As with the application config, the keys, their value kinds and allowed values come from the definitions.

## Definitions

The parser is built from a runtime holding these definitions (`createRuntime` in `lib/jdl/core/parsing/runtime.ts`;
JHipster's are assembled by `lib/jdl-config/jdl-runtime.ts`):

| Definition     | Provides                                                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `application`  | The application config keys: value kind, name pattern, allowed values, deprecation. JHipster collects the `jdl` entries of the `configs` of the `app` command and of every command it imports. |
| `deployment`   | The deployment keys, the same way, from the `deployment` command tree.                                                                                                                         |
| `entity`       | The entity options: unary or binary, choices, deprecated keywords.                                                                                                                             |
| `relationship` | The relationship options, and which one marks a built-in destination.                                                                                                                          |
| `validation`   | The validations with a value, and the kind of value each takes.                                                                                                                                |
| `fieldTypes`   | The field types, the validations each accepts (and those of enums), deprecations.                                                                                                              |
| `rules`        | Additional semantic rules, run after the language's own.                                                                                                                                       |

## Errors and warnings

Parsing stops at the first lexical or grammar error. Name, option and value-kind errors are then reported together, and the
semantic rules report every remaining problem with its line and column: errors fail the import, warnings (deprecated types
and options) are logged. The rules of the language are:

| Rule                                                       | Reports                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `undeclared-relationship-entity`                           | A relationship naming an undeclared entity (unless the destination is built in) |
| `undeclared-application-entity`                            | An application `entities` statement naming an undeclared entity                 |
| `entity-outside-application`                               | An application option naming an entity outside the application                  |
| `undeclared-option-entity`                                 | A top-level option naming an undeclared entity                                  |
| `duplicated-entity`, `duplicated-enum`, `duplicated-field` | A declaration repeated                                                          |
| `field-type`                                               | An unknown field type (error), a deprecated one (warning)                       |
| `validation-for-field-type`                                | A validation the field type does not support                                    |
| `decimal-validation-value`                                 | A decimal given to a validation that takes an integer                           |
| `required-reflexive-relationship`                          | A required relationship from an entity to itself                                |
| `one-to-one-direction`                                     | A `OneToOne` relationship owned by the destination only                         |
| `option-value`                                             | An entity option value outside its list; a `use` value belonging to no option   |
| `relationship-between-applications`                        | A relationship between entities of different applications                       |
| `application-option-value`                                 | An application option value outside its list                                    |
| `deployment-option-value`                                  | A deployment option value outside its list                                      |
| `namespace-config-blueprint`                               | A `config(<blueprint>)` block for a blueprint not in `blueprints`               |

Definitions may add rules; JHipster adds `deployment-type` (a deployment needs `deploymentType`) and
`kubernetes-istio-ingress-domain`.
