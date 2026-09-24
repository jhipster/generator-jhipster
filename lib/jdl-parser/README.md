# JDL parser

This package parses and validates JDL in memory. Its only runtime dependency is
Chevrotain. It does not read files, log, resolve generators or import JHipster
configuration. The generator adapter provides the installed version's definitions.

```ts
import { createRuntime, parse } from '@jhipster/jdl-parser';
import { getDefaultJDLDefinitions } from 'generator-jhipster/jdl';

const runtime = createRuntime(getDefaultJDLDefinitions());
const { ast, diagnostics } = parse('entity Book { title String required }', runtime);
```

`parse` returns recoverable AST nodes and all lexical, syntax and semantic
diagnostics. Each diagnostic has a stable `ruleId`, `severity`, `message` and
`range`. Each AST declaration has `location`; declaration occurrence arrays
retain duplicate names for diagnostics. Ranges use zero-based UTF-16 offsets,
one-based lines and columns, and an exclusive end. End-of-input diagnostics have
a finite, zero-width range. A runtime can be reused for sequential parses.

`parseOrThrow` is the generator compatibility API. It rejects invalid input and
returns the historical AST shape without location or declaration metadata.
`getCst` exposes strict CST parsing for grammar consumers.

`createRuntime(definitions)` requires explicit application, deployment, entity
and relationship definitions. Definitions may supply identifier patterns, name
validation, field types and validation names. Regular expressions remain native
`RegExp` objects; plain JSON serialization does not preserve them. Applications
transferring definitions between processes must preserve their source and flags.

`getDefaultJDLDefinitions({ getGeneratorMeta, blueprintNamespaces })` composes
selected blueprint command definitions through the generator's dependency
resolver. Neither that resolver nor its filesystem dependencies belongs here.

Build this independently with `npm install` and `npm run build` in this
directory. The package is private pending the project's package naming and
publication decision. The generator also exports the module at
`generator-jhipster/jdl-parser`.
