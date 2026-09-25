# JDL reference

JDL (JHipster Domain Language) describes applications, entities, enums, relationships, entity options and deployments in one
text file, which `jhipster jdl <file>` imports. This document lists everything that can be written in a JDL file. For a
tutorial, see the [JDL documentation](https://www.jhipster.tech/jdl/intro) on the website.

The application and deployment config keys, the entity and relationship options, the field types and the validations
available depend on the generator and on the blueprints in use. `jhipster describe app`, `jhipster describe deployment` and
`jhipster describe --config <name>` list them.

## Files

- A JDL file ends with `.jdl` or `.jh`. Several files passed together are read as one document.
- Whitespace, including newlines, is insignificant except where noted below.
- Statements may appear in any order, and an entity may be referenced before it is declared.

## Comments and directives

| Syntax        | Meaning                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `// text`     | Comment up to the end of the line.                                                                 |
| `/* text */`  | Block comment.                                                                                     |
| `/** text */` | Documentation comment, attached to the next entity, field, enum, enum value or relationship side.  |
| `# text`      | Directive: a line starting with `#` (for instance a `#!/usr/bin/env jhipster` shebang) is ignored. |

A documentation comment can also follow a field **on the same line**, in which case it documents that field (enum values
have their own rule, see [enums](#enums)):

```jdl
entity Product {
  price BigDecimal /** the price, taxes included */
}
```

`//` starts a comment wherever it appears on a line, even inside a string or a regular expression.

## Values and names

| Kind           | Syntax                     | Notes                                                                                                                                                                                          |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name           | `[a-zA-Z_][a-zA-Z_\-0-9]*` | Keywords (`entity`, `config`, `required`, ...) may be used as names, e.g. as a field name.                                                                                                     |
| Qualified name | `name.name.name`           | E.g. a Java package.                                                                                                                                                                           |
| Integer        | `-?[0-9]+`                 |                                                                                                                                                                                                |
| Decimal        | `-?[0-9]+.[0-9]+`          |                                                                                                                                                                                                |
| Boolean        | `true`, `false`            |                                                                                                                                                                                                |
| String         | `"..."`                    | May span several lines. `\"` does not close the string.                                                                                                                                        |
| Regex          | `/.../`                    | Only as a validation value, e.g. `pattern(/.../)`. It extends to the **last** `/` of its line, so do not put anything containing a `/` (such as a `/** comment */`) after it on the same line. |
| List           | `[a, b, c]`                | Names, comma separated; may be empty.                                                                                                                                                          |
| Quoted list    | `["a", "b"]`               | Strings, comma separated.                                                                                                                                                                      |

Naming rules:

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

| Statement                     | Meaning                                                                                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config { key value ... }`    | The application config, one entry per line, an optional comma after each. If several `config` blocks are given, only the last one is kept.                                                               |
| `config(<blueprint>) { ... }` | Options of a blueprint, with any keys and values. The blueprint must be listed in `blueprints`. Only the last `config(...)` block is kept.                                                               |
| `entities <list>`             | The entities of the application: `*` or `all`, or a comma separated list, optionally followed by `except <list>`. Only the last `entities` statement is kept. Without it, the application has no entity. |
| Option and `use` statements   | [Entity options](#entity-options) that apply to this application only. Every entity they name must belong to the application.                                                                            |
| Documentation comments        | Allowed between config entries; ignored.                                                                                                                                                                 |

Each `config` entry is `<key> <value>`, where the value is a boolean, an integer, a string, a name, a qualified name, a list or
a quoted list, as the key requires. An unknown key, a value of the wrong kind, or a value the key does not allow is an error.
Two keys matter to the JDL itself:

| Key          | Meaning                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `baseName`   | The name of the application; when several applications are declared, each one is generated in a folder of that name. |
| `blueprints` | A list of blueprint names. A `config(<blueprint>)` block is only accepted for a blueprint listed here.               |

Several applications may be declared in one file. An entity may belong to several applications. A relationship between
entities of different applications is an error.

A JDL without an `application` block adds its entities to the application in the current folder.

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

- The table name in parentheses is optional.
- The body is optional: `entity Tag` declares an entity without fields.
- Fields are separated by newlines or commas.
- An entity may be declared only once, and a field only once per entity.

### Fields

`[/** doc */] [@annotation ...] <name> <Type> [validation ...] [/** doc on the same line */]`

The type is one of the available field types (`String`, `Integer`, `Instant`, ...) or the name of an enum declared in the
document. An unknown type is an error.

### Validations

Validations follow the type, separated by spaces:

| Form                | Meaning                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| `required`          | The field is mandatory.                                                          |
| `unique`            | The field is unique.                                                             |
| `<name>(<number>)`  | A validation with a number, a decimal or a constant: `min(0)`, `maxlength(MAX)`. |
| `<name>(/<regex>/)` | A validation with a regular expression: `pattern(/^[A-Z]/)`.                     |

Each type accepts its own set of validations (`minlength` on a `String`, `min` on a number, ...); a validation the type does not
accept, an unknown validation, or a decimal where an integer is expected (`maxlength(1.5)`) is an error.

## Annotations

An annotation is `@name` or `@name(value)`, where the value is a string, an integer, a decimal, `true`, `false` or a name.
Annotations may be placed before an entity, before a field, and before either side of a relationship. They set a property of
that entity, field or relationship: `@ChangelogDate("20240101000000")` sets `changelogDate`, and an annotation without a value
sets its property to `true`. Blueprints may read their own annotations.

- On an entity, the same annotation given twice keeps the last value.
- On a field or a relationship, an annotation repeated with different values becomes a list.

Annotations are not checked: an unknown one is kept as is.

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
- An enum may be declared only once.

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
  client.
- `required` makes that side mandatory. It is only allowed inside the braces.
- If neither side names its field, both get one: the source is named after the destination entity and the destination after
  the source entity, with a lower-case first letter. The relationship is bidirectional.
- If only the source names its field, the relationship is unidirectional: the destination entity gets no relationship
  (unless annotations are placed before the source, see below).
- In a `OneToOne` relationship, the source must own the relationship: naming the field on the destination only is an error.
- A required relationship from an entity to itself is an error.
- Both entities must be declared. To relate to a built-in entity (`User`, `Authority`), add `with builtInEntity`.

Relationship options follow `with`, separated by commas: `builtInEntity`, or an option the generator or a blueprint adds.
An unknown option is an error.

Relationship annotations (e.g. `@OnDelete("CASCADE")`) land on the opposite side:

- Annotations before the **source** side apply to the relationship of the **destination** entity.
- Annotations before the **destination** side apply to the relationship of the **source** entity.

## Entity options

Entity options apply to a set of entities. At the top level they apply to the whole document; inside an `application` block
they apply to that application only.

```jdl
dto * with mapstruct
service all with serviceImpl except Tag
pagination Product, Order with infinite-scroll
readOnly Tag
skipClient Product
clientRootFolder Product with "../shared"
use mapstruct, serviceImpl, pagination for * except Tag
```

The entity list is `*`, `all` (on its own), or comma-separated entity names, optionally followed by `except <names>`.
Statements naming the same option accumulate. Every entity named must be declared.

An option takes either no value or one value:

- `<option> <entities> [except <entities>]`, for an option without a value, like `readOnly`;
- `<option> <entities> with <value> [except <entities>]`, for an option with a value, like `dto`. The value is a name
  (`[A-Za-z][A-Za-z0-9-_]*`) or a string not starting with `/`.

An unknown option, a value given to an option without one, a missing value, or a value the option does not allow is an
error.

The `use` statement sets several options at once by their values: `use <value>, ... for <entities> [except <entities>]`. Each
value selects the option it belongs to: `mapstruct` sets `dto`, `serviceImpl` sets `service`. A value that belongs to no
option, or `no`, which belongs to several, is an error.

## Deployments

```jdl
deployment {
  deploymentType docker-compose
  appsFolders [gateway, store]
  dockerRepositoryName "myrepo"
}
```

`deployment { key value ... }` with one entry per line and an optional comma after each. Several deployments may be
declared. As with the application config, an unknown key, a value of the wrong kind, or a value the key does not allow is an
error.
