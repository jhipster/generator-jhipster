# JHipster Blueprints

Blueprints allows adding new features or change current features.

## Creating a Blueprint

```
jhipster generate-blueprint
```

When creating blueprints it's cleaner to have the blueprint forwarding to a custom generator and keep main generators like client/common/server with customizations.
Example [jOOQ Blueprint](https://github.com/jhipster/generator-jhipster-jooq/blob/ce48a06a2b031013383db01cc787bbe94aa2c683/generators/server/generator.mjs#L21)

## Maintaining a Blueprint

### Upgrading to a new JHipster version

#### Upgrading and syncing the generated blueprint

Each JHipster version brings updated dependencies.
You should regenerate the blueprint to update dependencies.

```
npx --package generator-jhipster@latest jhipster generate-blueprint
```

When updating from a minor JHipster version, you probably will want to ignore (press s) to every generator and test conflict.
Ignore (i option instead of s) will store the file at `.yo-resolve` so that following `generate-blueprint` executions will ignore those files by default.

From time to time generate-blueprint may generate different code.
So regenerate every file ignoring `.yo-resolve` executing `jhipster generate-blueprint --skip-yo-resolve` and check the differences.

### Blueprint dependencies

`generator-jhipster` have every dependency using an exact version.
If the blueprint uses exact versions too, duplicated dependencies with different versions will be added to `node_modules`.
For this reason try to _avoid exact version at blueprint dependencies_ and disable auto updates since dependencies will be updated every time the blueprint is regenerated using `generate-blueprint`.

### Upgrading from v7 to v8

- `entity-*` generators were dropped and the replacements are entity's specific priorities at the technology specific generator (server, angular, spring-data-relational, ...).
  Motivation can be found at https://github.com/jhipster/generator-jhipster/blob/main/rfcs/4-jhipster-rfc-entity-as-core.md.
- priorities names are static constants at the generator class.
  `get initializing() {}` -> `get [Generator.INITIALIZING]() {}`
  Motivation can be found at https://github.com/jhipster/generator-jhipster/blob/main/rfcs/3-jhipster-rfc-unambiguous-priorities.md.
- much property migration can be warned by enabling `jhipster7Migration` feature at the constructor.
- needles are not implemented in the generator base anymore.
  They are injected at source object provided at some priorities and used like https://github.com/jhipster/generator-jhipster/blob/6373c9c76e57d01c4c1451a276f0d78bfbdd2c42/generators/spring-cache/generator.mts#L97-L101
