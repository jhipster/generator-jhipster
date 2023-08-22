# JHipster architecture

## Yeoman basis

Internally JHipster uses [yeoman](https://yeoman.io) as core.

## File structure

- `.blueprint`          - development blueprint, used to generate and manage samples 
- `.devcontainer`       - vscode's devcontainer definitions
- `.github`             - github configuration
- `.vscode`             - vscode's configuration
- `bin`                 - jit executable and helper
- `cli`                 - (exported) cli implementation
- `generators/*`        - (exported) generators
  - `generator.m[tj]s`  - generator implementation
  - `index.m[tj]s`      - generator exports. Must re-export generator as default export.
  - `internal`          - non-exported supporting libs
  - `resources`         - supporting resources
  - `jdl`               - generator's jdl specifications
  - `support`           - (exported) exported supporting libs
  - `templates`         - templates folder
- `jdl`                 - (exported) jdl parser implementation
- `rfcs`                - (RFCs)[CONTRIBUTING.md#rfcs]
- `test`                - package tests
- `test-integration`    - CI related stuff. Samples, scripts.

## Lifecycle

- [Cli entrypoint](https://github.com/jhipster/generator-jhipster/blob/main/cli/jhipster.cjs)
- [Basic environment validation](https://github.com/jhipster/generator-jhipster/blob/main/cli/cli.mjs)
- [Cli arguments parsing and Environment bootstrap](https://github.com/jhipster/generator-jhipster/blob/main/cli/program.mjs)
  - Lookup for Generators and Blueprints
  - Build cli options and arguments definition
  - Parse options and arguments
- Run Generator (start the Environment) passing options and arguments
- Run every task from the highest precedence priority until there is no more pending task

https://github.com/jhipster/generator-jhipster/blob/main/generators/base/priorities.mjs
https://github.com/jhipster/generator-jhipster/blob/main/generators/base-application/priorities.mjs

## Blueprints

https://www.jhipster.tech/modules/extending-and-customizing/
https://www.jhipster.tech/modules/creating-a-module/
https://www.jhipster.tech/modules/creating-a-blueprint/

### Blueprint lifecycle

## Generator Hierarchy

### GeneratorBaseCore

Adds custom apis to `yeoman-generator` and customizes the behavior.

### GeneratorBase

Adds Blueprint composing apis.

### GeneratorApplication

Adds Entities related apis.

## JDL
