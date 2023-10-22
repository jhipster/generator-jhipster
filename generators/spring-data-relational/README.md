# SQL/spring-data-relational sub-generador

// TODO move first customizing and sub titles to app README.
## Customizing

JHipster implementation allows you to override almost every aspect of the generation process.

### Entities

Every annotation is loaded as entities properties and will be used at generation process.

```jdl
@CustomsProp1(customValue)
entity Bar {}
```

`.jhipster/Bar.json`:
```json
{
  "name": "Bar",
  "options": {
    "customsProp1": "customValue"
  }
}
```

#### Notable customizations

##### Label

```
@EntityClassHumanized("Departamento")
@EntityClassPluralHumanized("Departamentos")
entity Department {}
```

### Fields

TODO add jdl and json examples

#### Notable customizations

##### Label

TODO add humanized name example

### Relationships

#### Notable customizations

##### Label

TODO add humanized name example

## Customizing

Customizing basics can be found at [Customizing](../app/README.md#customizing)

### Notable relationships customizations

#### Eager loading relationships

JHipster UI uses only the id and `otherEntityFieldName` properties, by default only fields used by the UI will be fetched.

```jdl
relationship OneToMany {
  @RelationshipEagerLoad Bar to @RelationshipEagerLoad Foo
}
```

Related issues: (#23917)[https://github.com/jhipster/generator-jhipster/issues/23917]
