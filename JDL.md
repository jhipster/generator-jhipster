# JDL reference

JDL (JHipster Domain Language) describes applications, entities, enums, relationships, entity options and deployments in one
text file, which `jhipster jdl <file>` imports. This document lists everything the language accepts, as implemented in this
repository. For a tutorial, see the [JDL documentation](https://www.jhipster.tech/jdl/intro) on the website.

Where the pieces live:

- Lexer and grammar: `lib/jdl/core/parsing/lexer/`, `lib/jdl/core/parsing/jdl-parser.ts`.
- Syntax checks (name patterns, known options): `lib/jdl/core/parsing/validator.ts`.
- Semantic rules (cross references, value checks): `lib/jdl/core/parsing/semantic/rules.ts` and `lib/jdl-config/jdl-semantic-rules.ts`.
- Definitions (entity options, validations, field types, relationship options): `lib/jdl-config/`.
- Application and deployment options: **not** hard coded. They are the `configs` with a `jdl` entry in the `command.ts` of the
  `app` and `deployment` generators and of every generator they import (`lib/jdl-config/jhipster-jdl-config.ts`). The tables
  below are a snapshot; `jhipster describe app` and `jhipster describe --config <name>` are authoritative.

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

| Kind           | Syntax                     | Notes                                                                                                                                                                   |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name           | `[a-zA-Z_][a-zA-Z_\-0-9]*` | Keywords (`entity`, `config`, `required`, ...) may be used as names where a name is expected, e.g. as a field name.                                                     |
| Qualified name | `name.name.name`           | Used for `packageName`.                                                                                                                                                 |
| Integer        | `-?[0-9]+`                 |                                                                                                                                                                         |
| Decimal        | `-?[0-9]+.[0-9]+`          |                                                                                                                                                                         |
| Boolean        | `true`, `false`            |                                                                                                                                                                         |
| String         | `"..."`                    | Single line or multi line. `\"` does not close the string; backslashes are otherwise kept as written.                                                                   |
| Regex          | `/.../`                    | Only inside `pattern(...)`. It extends to the **last** `/` of its line, so do not put anything containing a `/` (such as a `/** comment */`) after it on the same line. |
| List           | `[a, b, c]`                | Names, comma separated; may be empty.                                                                                                                                   |
| Quoted list    | `["a", "b"]`               | Strings, comma separated; used by `routes`.                                                                                                                             |

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

A constant holds an integer or a decimal and can be used as the value of a validation: `minlength(DEFAULT_MIN_LENGTH)`.
Constants cannot be used anywhere else.

## Applications

```jdl
application {
  config {
    baseName store
    applicationType monolith
    packageName com.mycompany.store
    authenticationType jwt
    languages [en, fr]
    blueprints [generator-jhipster-foo]
    jwtSecretKey "..."
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
| `config { key value ... }`    | The application options, one per line, an optional comma after each. If several `config` blocks are given, only the last one is kept.                                                                           |
| `config(<blueprint>) { ... }` | Options of a blueprint, exported as `namespaceConfigs.<blueprint>`. Keys are not checked; values are any config value. The blueprint must be listed in `blueprints`. Only the last `config(...)` block is kept. |
| `entities <list>`             | The entities of the application: `*` or `all`, or a comma separated list, optionally followed by `except <list>`. Only the last `entities` statement is kept. Without it, the application has no entity.        |
| Option and `use` statements   | [Entity options](#entity-options) that apply to this application only. Every entity they name must belong to the application.                                                                                   |
| Documentation comments        | Allowed between config entries; ignored.                                                                                                                                                                        |

Several applications may be declared in one file; each one is written to a folder named after its `baseName`. An entity may
belong to several applications. A relationship whose entities belong to different applications is rejected.

A JDL without an `application` block imports its entities into the current application.

### Application options

Values are checked against the value kind below, against a name pattern where one is declared, and against the allowed
values when a list is given. An unknown option is an error; a deprecated one is a warning.

| Option                   | Value           | Allowed values                                                                                          |
| ------------------------ | --------------- | ------------------------------------------------------------------------------------------------------- |
| `applicationType`        | name            | `monolith`, `gateway`, `microservice`                                                                   |
| `authenticationType`     | name            | `jwt`, `oauth2`, `session`                                                                              |
| `baseName`               | name            |                                                                                                         |
| `blueprints`             | list of names   |                                                                                                         |
| `blueprint`              | name            |                                                                                                         |
| `buildTool`              | name            | `maven`, `gradle`                                                                                       |
| `cacheProvider`          | name            | `no`, `caffeine`, `ehcache`, `hazelcast`, `infinispan`, `memcached`, `redis`                            |
| `clientBundler`          | name            | `webpack`, `vite`, `esbuild`, `rsbuild`                                                                 |
| `clientFramework`        | name            | `angular`, `react`, `vue`, `no`                                                                         |
| `clientTestFramework`    | name            | `vitest`                                                                                                |
| `clientTheme`            | name            |                                                                                                         |
| `clientThemeVariant`     | name            | `primary`, `dark`, `light`                                                                              |
| `creationTimestamp`      | integer         |                                                                                                         |
| `databaseMigration`      | name            | `liquibase`, `loader`, `no`                                                                             |
| `databaseType`           | name            | `sql`, `mongodb`, `couchbase`, `cassandra`, `neo4j`, `no`                                               |
| `devDatabaseType`        | name            | `postgresql`, `mysql`, `mariadb`, `oracle`, `mssql`, `h2Disk`, `h2Memory`                               |
| `dtoSuffix`              | name            |                                                                                                         |
| `enableGradleDevelocity` | boolean         |                                                                                                         |
| `enableHibernateCache`   | boolean         |                                                                                                         |
| `enableSwaggerCodegen`   | boolean         |                                                                                                         |
| `enableTranslation`      | boolean         |                                                                                                         |
| `entitySuffix`           | name            |                                                                                                         |
| `feignClient`            | boolean         |                                                                                                         |
| `gatewayServerPort`      | integer         |                                                                                                         |
| `graalvmSupport`         | boolean         |                                                                                                         |
| `gradleDevelocityHost`   | string          |                                                                                                         |
| `incrementalChangelog`   | boolean         |                                                                                                         |
| `jhiPrefix`              | name            |                                                                                                         |
| `jhipsterVersion`        | string          | _Deprecated: it is stamped by the generator, do not set it in JDL; it will be removed in JHipster v10._ |
| `jwtSecretKey`           | string          |                                                                                                         |
| `languages`              | list of names   |                                                                                                         |
| `messageBroker`          | name            | `kafka`, `pulsar`, `no`                                                                                 |
| `microfrontend`          | boolean         |                                                                                                         |
| `microfrontends`         | list of names   |                                                                                                         |
| `nativeLanguage`         | name            |                                                                                                         |
| `nodePackageManager`     | name            |                                                                                                         |
| `packageName`            | qualified name  |                                                                                                         |
| `prodDatabaseType`       | name            | `postgresql`, `mysql`, `mariadb`, `oracle`, `mssql`                                                     |
| `reactive`               | boolean         |                                                                                                         |
| `rememberMeKey`          | string          |                                                                                                         |
| `removeNeedles`          | boolean         |                                                                                                         |
| `routes`                 | list of strings | Each `"app"`, `"app:host"` or `"app:host:port"`.                                                        |
| `searchEngine`           | name            | `no`, `elasticsearch`, `couchbase`                                                                      |
| `serverPort`             | integer         |                                                                                                         |
| `serviceDiscoveryType`   | name            | `consul`, `eureka`, `no`                                                                                |
| `skipClient`             | boolean         |                                                                                                         |
| `skipServer`             | boolean         |                                                                                                         |
| `skipUserManagement`     | boolean         |                                                                                                         |
| `syncUserWithIdp`        | boolean         |                                                                                                         |
| `testFrameworks`         | list of names   |                                                                                                         |
| `websocket`              | name            |                                                                                                         |
| `withAdminUi`            | boolean         |                                                                                                         |

Notable name patterns: `baseName` `[A-Za-z]\w*`; `packageName` segments `[a-z_][a-z0-9_]*`; `languages` and `nativeLanguage`
`[a-z]+(-[A-Za-z0-9]+)*`; `blueprints` and `blueprint` an npm package name, scoped or not.

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

The type is a field type or the name of an enum declared in the document.

| Type               | Validations                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `String`           | `required`, `unique`, `minlength`, `maxlength`, `pattern`         |
| `Integer`          | `required`, `unique`, `min`, `max`                                |
| `Long`             | `required`, `unique`, `min`, `max`                                |
| `BigDecimal`       | `required`, `unique`, `min`, `max`                                |
| `Float`            | `required`, `unique`, `min`, `max`                                |
| `Double`           | `required`, `unique`, `min`, `max`                                |
| `Boolean`          | `required`, `unique`                                              |
| `LocalDate`        | `required`, `unique`                                              |
| `LocalTime`        | `required`, `unique`                                              |
| `ZonedDateTime`    | `required`, `unique`                                              |
| `Instant`          | `required`, `unique`                                              |
| `Duration`         | `required`, `unique`                                              |
| `UUID`             | `required`, `unique`                                              |
| `Blob`             | `required`, `unique`, `minbytes`, `maxbytes`                      |
| `AnyBlob`          | `required`, `unique`, `minbytes`, `maxbytes`                      |
| `ImageBlob`        | `required`, `unique`, `minbytes`, `maxbytes`                      |
| `TextBlob`         | `required`, `unique`                                              |
| `ByteBuffer`       | none; supported by some databases only                            |
| an enum            | `required`, `unique`                                              |
| `Date`, `DateTime` | `required`, `unique`; deprecated (warning), migrated to `Instant` |

An unknown type, or a validation the type does not support, is an error.

### Validations

| Validation           | Value                                              |
| -------------------- | -------------------------------------------------- |
| `required`           | none                                               |
| `unique`             | none                                               |
| `min(<n>)`           | integer, decimal or constant                       |
| `max(<n>)`           | integer, decimal or constant                       |
| `minlength(<n>)`     | integer or constant; decimals are rejected         |
| `maxlength(<n>)`     | integer or constant; decimals are rejected         |
| `minbytes(<n>)`      | integer or constant; decimals are rejected         |
| `maxbytes(<n>)`      | integer or constant; decimals are rejected         |
| `pattern(/<regex>/)` | a regular expression, exported without the slashes |

A validation name followed by a value that is not in the list is an error (`Unknown validation`). There is no `email`
validation in JDL.

## Annotations

An annotation is `@name` or `@name(value)`, where the value is a string, an integer, a decimal, `true`, `false` or a name.
Annotations may be placed before an entity, before a field, and before either side of a relationship. The name is exported
with a lower-case first letter (`@ChangelogDate` becomes `changelogDate`); an annotation without a value is `true`.

- **Entity** annotations are exported under `annotations` in the entity JSON. When the generator loads the entity, they are
  merged into it, so they can set any entity property: `@ChangelogDate("20240101000000")`, `@skipClient`, `@dto(mapstruct)`,
  and blueprint-specific properties. The same annotation given twice keeps the last value.
- **Field** annotations are exported under the field's `options` and merged into the field when it is loaded. An annotation
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
- Both entities must be declared, unless the relationship has `with builtInEntity`, which allows a destination that is a
  built-in entity (`User`, `Authority`).

Relationship options, after `with`, are separated by commas on the same line. The only option is:

| Option          | Meaning                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| `builtInEntity` | The destination is a built-in entity; exported as `relationshipWithBuiltInEntity: true`. |

Relationship annotations are exported under `options` of the relationship JSON and merged into the relationship when it is
loaded (for instance `@OnDelete("CASCADE")`, `@OnUpdate("SET NULL")`, `@Id`). Note on which side each one lands:

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

Unary options take no value:

| Option           | Meaning                                          |
| ---------------- | ------------------------------------------------ |
| `skipClient`     | Skip the client code of the entities             |
| `skipServer`     | Skip the server code of the entities             |
| `noFluentMethod` | Generate no fluent setters                       |
| `readOnly`       | Read only entities                               |
| `filter`         | Filtering of the entities with the JPA metamodel |
| `embedded`       | Embedded entities                                |

Binary options take a value after `with` (a name matching `[A-Za-z][A-Za-z0-9-_]*`, or a string not starting with `/`):

| Option             | Values                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `dto`              | `mapstruct`, `no`                                                                              |
| `service`          | `serviceClass`, `serviceImpl`, `no`                                                            |
| `pagination`       | `pagination`, `infinite-scroll`, `no`. The keyword `paginate` is a deprecated alias (warning). |
| `search`           | `elasticsearch`, `couchbase`, `no`                                                             |
| `microservice`     | the name of the microservice                                                                   |
| `angularSuffix`    | any suffix                                                                                     |
| `clientRootFolder` | any folder                                                                                     |

A unary option given a value, a binary option given none, an unknown option or a value outside the list is an error.
`dto` and `filter` set `service` to `serviceClass` for the entities that have no `service` value.

The `use` statement sets several binary options at once by value: `use <value>, ... for <entities> [except <entities>]`. Each
value selects the option it belongs to (`mapstruct` → `dto`, `serviceImpl` → `service`, `infinite-scroll` → `pagination`,
`elasticsearch` → `search`, ...). `no`, which belongs to several options, is not accepted.

## Deployments

```jdl
deployment {
  deploymentType kubernetes
  appsFolders [gateway, store]
  dockerRepositoryName "myrepo"
  kubernetesServiceType Ingress
  ingressDomain "example.com"
  istio true
  serviceDiscoveryType consul
}
```

`deployment { key value ... }` with one option per line and an optional comma after each. Several deployments may be
declared. `deploymentType` is mandatory. With `deploymentType kubernetes` and `istio true`, `ingressDomain` is mandatory.
Options not given take the defaults of the deployment generator of that type.

| Option                        | Value         | Allowed values                                                                                 |
| ----------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `appsFolders`                 | list of names |                                                                                                |
| `clusteredDbApps`             | list of names |                                                                                                |
| `deploymentType`              | name          | `docker-compose`, `kubernetes`                                                                 |
| `directoryPath`               | string        |                                                                                                |
| `dockerPushCommand`           | string        |                                                                                                |
| `dockerRepositoryName`        | string        | a host, URL or plain name                                                                      |
| `gatewayType`                 | name          | `SpringCloudGateway`. _Deprecated: no generator reads it, it will be removed in JHipster v10._ |
| `ingressDomain`               | string        | a host or URL                                                                                  |
| `ingressType`                 | name          | `nginx`, `gke`                                                                                 |
| `istio`                       | boolean       |                                                                                                |
| `kubernetesNamespace`         | name          |                                                                                                |
| `kubernetesServiceType`       | name          | `LoadBalancer`, `NodePort`, `Ingress`                                                          |
| `kubernetesStorageClassName`  | string        |                                                                                                |
| `kubernetesUseDynamicStorage` | boolean       |                                                                                                |
| `monitoring`                  | name          | `no`, `prometheus`                                                                             |
| `registryReplicas`            | integer       | _Deprecated: no generator reads it, it will be removed in JHipster v10._                       |
| `serviceDiscoveryType`        | name          | `consul`, `eureka`, `no`                                                                       |
| `storageType`                 | name          | _Deprecated: no generator reads it, it will be removed in JHipster v10._                       |

## Errors and warnings

Parsing stops at the first lexical or grammar error. Name, option and value-kind errors are then reported together, and the
semantic rules report every remaining problem with its line and column: errors fail the import, warnings (deprecated types
and options) are logged. The semantic rules are:

| Rule                                                       | Reports                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `undeclared-relationship-entity`                           | A relationship naming an undeclared entity (without `builtInEntity`)          |
| `undeclared-application-entity`                            | An application `entities` statement naming an undeclared entity               |
| `entity-outside-application`                               | An application option naming an entity outside the application                |
| `undeclared-option-entity`                                 | A top-level option naming an undeclared entity                                |
| `duplicated-entity`, `duplicated-enum`, `duplicated-field` | A declaration repeated                                                        |
| `field-type`                                               | An unknown field type (error), a deprecated one (warning)                     |
| `validation-for-field-type`                                | A validation the field type does not support                                  |
| `decimal-validation-value`                                 | A decimal given to `minlength`, `maxlength`, `minbytes` or `maxbytes`         |
| `required-reflexive-relationship`                          | A required relationship from an entity to itself                              |
| `one-to-one-direction`                                     | A `OneToOne` relationship owned by the destination only                       |
| `option-value`                                             | An entity option value outside its list; a `use` value belonging to no option |
| `relationship-between-applications`                        | A relationship between entities of different applications                     |
| `application-option-value`                                 | An application option value outside its list                                  |
| `deployment-option-value`                                  | A deployment option value outside its list                                    |
| `namespace-config-blueprint`                               | A `config(<blueprint>)` block for a blueprint not in `blueprints`             |
| `deployment-type`                                          | A deployment without `deploymentType`                                         |
| `kubernetes-istio-ingress-domain`                          | A Kubernetes deployment with Istio and no `ingressDomain`                     |
