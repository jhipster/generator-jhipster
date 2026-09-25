# JDL reference

JDL (JHipster Domain Language) describes applications, entities, enums, relationships, entity options and deployments in one
text file, which `jhipster jdl <file>` imports. This document lists everything that can be written in a JDL file. For a
tutorial, see the [JDL documentation](https://www.jhipster.tech/jdl/intro) on the website.

The application and deployment config keys, the entity and relationship options, the field types, the validations and the
built-in entities available depend on the generators in use: JHipster's own and those of the blueprints.
`jhipster describe app`, `jhipster describe deployment` and `jhipster describe --config <name>` list them.

> [!NOTE]
> The examples in this document use names that JHipster's generators accept, such as `packageName`, `dto`, `BigDecimal`,
> `minlength` or `docker-compose`. They show the syntax: whether a given example works depends on the generators in use, and
> the same statement may be rejected, be ignored, or mean something else, with other generators or blueprints.

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
| Qualified name | `name(.name)*`             | One or more names separated by dots, e.g. the Java package `com.mycompany.store`.                                                                                                              |
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

For example:

```jdl
@ChangelogDate("20240101000000")
@MyEntityOption
entity Order {
  @MyFieldOption("x")
  @MyFieldOption("y")
  total BigDecimal
}
```

is imported into `.jhipster/Order.json` (excerpt):

```json
{
  "annotations": {
    "changelogDate": "20240101000000",
    "myEntityOption": true
  },
  "fields": [
    {
      "fieldName": "total",
      // ...
      "options": { "myFieldOption": ["x", "y"] }
    }
  ]
  // ...
}
```

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

An enum has no JSON file of its own: it is bundled into every field that uses it. When several entities use the same enum,
each of their JSON files holds a copy of it, and an enum no field uses is not imported at all. For example:

```jdl
entity Product {
  status Status
}
entity Order {
  status Status
}
```

is imported into `.jhipster/Product.json` and `.jhipster/Order.json` with the same field (excerpt):

```json
{
  "fields": [
    {
      "fieldName": "status",
      "fieldType": "Status",
      "fieldValues": "AVAILABLE (available),RESTOCK (re stock),DISCONTINUED",
      "fieldTypeDocumentation": "Status of a product",
      "fieldValuesJavadocs": { "AVAILABLE": "in stock" }
    }
  ]
  // ...
}
```

## Relationships

```jdl
relationship OneToMany {
  /** the products */ Category{product} to /** its category */ Product{category(name) required}
}

relationship ManyToOne {
  Product{owner(login)} to User with builtInEntity
  Order to @OnDelete("CASCADE") Customer
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
- Both entities must be declared, unless the relationship has the [`builtInEntity`](#relationship-options) option.

### Relationship options

Relationship options follow `with`, separated by commas: `A to B with builtInEntity, otherOption`. A relationship option is
a flag, a bare name without a value; unlike [entity options](#entity-options), there is no `with <value>` form, and
`with option(value)` is an error. To give a relationship a value, use an [annotation](#relationship-annotations) instead,
such as `@OnDelete("CASCADE")`. An unknown option is an error.

`builtInEntity` is an option of the JDL itself, available whatever the generators in use. It says that the destination is a
built-in entity: an entity the generator provides, which the JDL file does not declare (for instance JHipster's `User` and
`Authority`). The source must still be declared. A generator may list its built-in entities; it then rejects
`with builtInEntity` to any other destination. Without such a list, any destination is accepted.

```jdl
relationship ManyToOne {
  Order{user(login)} to User with builtInEntity
}
```

is imported into `.jhipster/Order.json` (excerpt), `builtInEntity` becoming `relationshipWithBuiltInEntity`:

```json
{
  "relationships": [
    {
      "relationshipName": "user",
      // ...
      "relationshipWithBuiltInEntity": true
    }
  ]
  // ...
}
```

`User` is not declared, so no JSON is written for it.

Any other relationship option is added by the generators or blueprints in use, and is imported as `true` under `options`, on
both sides of the relationship. With a generator adding an `audited` option:

```jdl
relationship ManyToOne {
  Order{customer} to Customer{order} with audited
}
```

is imported into `.jhipster/Order.json` (excerpt):

```json
{
  "relationships": [
    {
      "relationshipName": "customer",
      // ...
      "options": { "audited": true }
    }
  ]
  // ...
}
```

and `.jhipster/Customer.json` (excerpt):

```json
{
  "relationships": [
    {
      "relationshipName": "order",
      // ...
      "options": { "audited": true }
    }
  ]
  // ...
}
```

If the relationship is unidirectional (`Order{customer} to Customer with audited`), only `Order` gets it.

### Relationship annotations

Relationship annotations land on the opposite side:

- Annotations before the **source** side apply to the relationship of the **destination** entity.
- Annotations before the **destination** side apply to the relationship of the **source** entity.

For example:

```jdl
relationship ManyToOne {
  @MyOption Order to @OnDelete("CASCADE") Customer
}
```

is imported into `.jhipster/Order.json` (excerpt):

```json
{
  "relationships": [
    {
      "relationshipName": "customer",
      // ...
      "options": { "onDelete": "CASCADE" }
    }
  ]
  // ...
}
```

and `.jhipster/Customer.json` (excerpt):

```json
{
  "relationships": [
    {
      "relationshipName": "order",
      // ...
      "options": { "myOption": true }
    }
  ]
  // ...
}
```

With JHipster, `onDelete` takes effect on the relationship of `Order`, which holds the foreign key; placed before `Order`, the
same annotation would land on the relationship of `Customer` and be ignored.

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

### The `use` statement

`use <value>, ... for <entities> [except <entities>]` is a shorthand for options with a value: it lists **values**, not
option names, and each value sets the option whose allowed values contain it. With JHipster's generators:

```jdl
use mapstruct, serviceImpl, infinite-scroll for Product, Order
```

is the same as:

```jdl
dto Product, Order with mapstruct
service Product, Order with serviceImpl
pagination Product, Order with infinite-scroll
```

So `use` only works with options that take a value from a fixed list. It is an error to give it:

- an option without a value, such as `readOnly` (write `readOnly Product` instead);
- an option name, such as `dto`;
- a value of an option that accepts any value, such as `microservice` or `clientRootFolder`, since the value tells no
  option;
- `no`, which is an allowed value of several options.

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
