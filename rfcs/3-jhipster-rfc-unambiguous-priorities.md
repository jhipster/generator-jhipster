# JHipster-RFC-3: Unambiguous priorities API

<!-- This is a RFC template based on the Rust RFC process but simplified: https://github.com/rust-lang/rfcs/ -->

- Feature Name: Unambiguous priorities API.
- Start Date: 2021-11-20
- Issue: [jhipster/generator-jhipster#0000](https://github.com/jhipster/generator-jhipster/0000)

## Summary

[summary]: #summary

This RFC proposes to change priorities declaration to a more unambiguous way. Making it easier to understand and allow the generator class to be implemented with a more traditional notation.

## Motivation

[motivation]: #motivation

Priorities are currently implemented as a getter with a non `_` prefixed name, and any new function with a non `_` prefixed name will be queued as a task at `default` priority. Javascript standard is that `_` prefixed name is private method, and non `_` prefixed name are class members instead of tasks. We should try to follow Javascript standards.

JHipter workflow is clear and each priorities has it's purpose. This makes tasks outside priorities useless and its drawbacks overcome its benefits. We don't need to queue any tasks outside our declared priorities.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

Priorities will be implemented using constants as name, declaring it like `get [INITIALIZING_PRIORITY]() {}`. The constant `INITIALIZING_PRIORITY` will have a `#` prefixed value like `#initializing`. `initializing` will be available to be an ordinary class member.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

JHipster uses Yeoman's traditional priorities:

```js
  get [INITIALIZING_PRIORITY]() {
    return {
      initializingTask() {
        this.sayHello();
      }
    }
  }

  _sayHello() {
    console.log('hello');
  }

  aTaskQueuedAtDefaultPriority() {
    console.log('I am been executed, why? I am a default priority task.');
  }
```

The result is that developers may be confused with the notation. And the API doesn't follow standards.

While this works, an unambiguous notation would improve understanding the workflow and improve the API.

```js
  get [INITIALIZING_PRIORITY]() {
    return {
      initializingTask() {
        this.sayHello();
      }
    }
  }

  sayHello() {
    console.log('hello');
  }

  anOrdinaryClassMember() {
    console.log('I am not been executed, why? I am just and ordinary function.');
  }
```

## Drawbacks

[drawbacks]: #drawbacks

?

## Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

Our modular generators are already implemented using the new notation.

This is a breaking change. The traditional generators can switch to use constants, but they must not use the `#` prefix at JHipster 7.

Blueprints will have to adopt the same pattern.

## Unresolved questions

[unresolved-questions]: #unresolved-questions

?

## Future possibilities

[future-possibilities]: #future-possibilities

?
