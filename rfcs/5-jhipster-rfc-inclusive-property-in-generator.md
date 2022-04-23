# JHipster-RFC-5: Use inclusive syntax to manage properties in generator

- Feature Name: Inclusive syntax to manage properties in generator
- Start Date: V8
- Issue: [jhipster/generator-jhipster#14416](https://github.com/jhipster/generator-jhipster/issues/14416)

## Summary

[summary]: #summary

This RFC to define the standard structure of the option's data model that should be used within the generator (not necessary the jdl or cli, which should only be encouraged for new ones).

## Motivation

[motivation]: #motivation

Some options are using exclusive syntax (i.e. skipClient) and some other inclusive ones (dto A): mixing both creates a lot of additional business logic in the generator,
a lot of cognitive overhead (avoid double negation in code: `if (!skipClient) {}`), and may reduce the capabilities of the framework.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

Basically, options should always be inclusive and follow this simple rules:

- If the option is not defined by the end user: we'll take a reasonable default.
- If the option is specified, we'll take the decision of the end user.

For example, let say that we want to remove the jhipster `skipClient` option in the jdl syntax by an option that would be compliant with this spec:

- A JDL `application`, defined without any `generateClient` attribute declaration will generate a frontend for that app (use of reasonable default).
- A JDL `application`, defined with any `generateClient` attribute declaration will take the end user's choice into consideration (if `generateClient: false` is set, the frontend won't be generated.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

At a technical level, the presence of the option should result in an attribute at the json object level.

i.e.: if we take the following jdl

```
application {
  config: {
    baseName: "a"
    skipClient: true
  }
}
@ReadOnly
entity E {
}

paginate * with pager except E

```

the resulting (simplified) json object used by the generator

`.yo-rc.json`:

```json
{
  "generator-jhipster": {
    "baseName": "a",
    "generateClient": true,
    "_comment_for_above": "see the change, and as it is a reasonable default, we may not have to specify it"
  }
}
```

`.jhipster/E.json`:

```json
{
  "name": "E",
  "config": {
    "queryMethods": true,
    "_comment_for_above": "reasonable default we may not have to specify it",
    "deleteMethods": false,
    "_comment_for_above": "result of the readonly option",
    "saveMethods": false,
    "_comment_for_above": "result of the readonly option",
    "generateEntityLayer": true,
    "_comment_for_above": "another reasonable default, ... as it is a reasonable default we may not have to specify it",
    "paginate": false,
    "_comment_for_above": "end user choice"
  }
}
```

## Drawbacks

[drawbacks]: #drawbacks

Blueprint with additional options will have to override objects definiton: an overridable api should be provided at the generator-core level to let the blueprint developer to add its own attributes at each level

## Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

Skip syntax could be interpreted in many ways and is not compatible with binary options

```
application {
  name: "a",
  clientFramework: angular
}
entity A {
}

skipController A // No entity HTML, No entity Component, No entity Front consumer Service, No entity Back ITest, No entity Front ITest, no entity front test: is this behavior really clear for end users?

/* Illegal syntax */
skipService A with serviceImpl // We generate with serviceClass or we do not generate at all?

```

Vs its expressive counterpart:

```
application {
name: "a",
clientFramework: angular
}

entity A {
}
forms * except A
clientServices * except A
iTests * except A
service * with serviceClass

```

## Prior art

[prior-art]: #prior-art

- Issue: [jhipster/generator-jhipster#14416](https://github.com/jhipster/generator-jhipster/issues/14416)

## Future possibilities

[future-possibilities]: #future-possibilities

- Activating layers on demand (controller, forms, tests, ...)
- Activating C,R,U,D capability on demand
- Not only generating REST, but also messageBroker consumers and producers, which will boost microservices added value
