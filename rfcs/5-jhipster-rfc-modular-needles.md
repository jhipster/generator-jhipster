# JHipster-RFC-5: Modular needles.

<!-- This is a RFC template based on the Rust RFC process but simplified: https://github.com/rust-lang/rfcs/ -->

- Feature Name: Modular needles.
- Start Date: 2022-05-25
- Issue: [jhipster/generator-jhipster#0000](https://github.com/jhipster/generator-jhipster/0000)

## Summary

[summary]: #summary

This RFC proposes to implement modular needles.

## Motivation

[motivation]: #motivation

JHipster 8 modular approach needs a new needle approach for a better modularity.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

JHipster 7 has lots of technology specific needles implemented at `generator-base` like:

- `addIcon`
- `addElementToMenu`
- `addExternalResourcesToRoot`
- `addElementToAdminMenu`
- `addEntityToMenu`
- `addEntityToModule`
- `addAdminToModule`
- `addAngularModule`
- `addEntityToEhcache`
- `addChangelogToLiquibase`
- `addMainSCSSStyle`
- `addWebpackConfig`
- `addMavenPluginRepository`
- Many others

Those needles should be implemented using a modular approach at the technology-specific generator.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

Needles will be implemented as a stand-alone function having the generator as first parameter.
For convenience, it will be exposed at the technology-specific generator as a class member method.

```mjs
export function aNeedle(generator, needleData) {
  if (!needles) {
    needles = generator;
    generator = null;
  }

 return createBaseNeedle(
  return createBaseNeedle(
    {
      generator,
      filePath, // File path for logging purpose
      needlesPrefix: 'needle-prefix',
    },
    needles
  );
}

export default class Generator {
  aNeedle(...args) {
    aNeedle(this, ...args);
  }
}
```

Using needles api inside a child generator:

```mjs
import Generator from './base-generator.mjs'

export default class ChildGenerator extends Generator {
  get [POST_WRITING_PRIORITY]() {
    writeNeedle() {
      this.aNeedle(data);
    }
  }
}
```

Using a non-related generator:

```mjs
import { aNeedle } from './base-generator.mjs'

export default class UnrelatedGenerator {
  get [POST_WRITING_PRIORITY]() {
    writeNeedle() {
      aNeedle(this, data);
    }
  }
}
```

Realistic example applying multiple needles in the same file:

```mjs
import { addProperty, addDependency, addDependencyToDevProfile } from 'generator-jhipster/generators/java-simple-application/generators/maven'

export default class UnrelatedGenerator {
  get [POST_WRITING_PRIORITY]() {
    writeNeedle() {
      this.editFile('pom.xml',
        addProperty(properties),
        addDependency(prodDependencies),
        addDependencyToDevProfile(devDependencies)
      )
    }
  }
}
```

## Drawbacks

[drawbacks]: #drawbacks

Needles api will not be exposed to every generator by default.
It needs to be imported to be used.

## Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

This will allow creating a modular implementation.

## Unresolved questions

[unresolved-questions]: #unresolved-questions

## Implementation

Modular needle will be implemented in JHipster 7 keeping api stability and exposing the needles at generator-base.
