# app sub-generator

`jhipster` command entrypoint, it composes with `common`, `languages`, `server`, and `client`.

## Customizing

JHipster implementation allows you to override almost every aspect of the generation process.

[SQL/spring-data-relational customizations](https://github.com/jhipster/generator-jhipster/blob/skip_ci-architecture/generators/spring-data-relational/README.md#sqlspring-data-relational-sub-generator)

### Application

JDL doesn't support annotations, customizations must be done through local blueprint.

`.blueprint/app/generator.mjs` (to create a local blueprint follow https://www.jhipster.tech/modules/creating-a-blueprint/#local-blueprints):

```js
get [Generator.PREPARING]() {
  return {
    customize({ application }) {
      application.baseNameHumanized = 'Custom application title';
    },
  };
}
```

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
  "annotations": {
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

##### Translation variant

Translation variant allows different translations for the entity whenever applicable.

```jdl
@EntityI18nVariant('female')
@EntityClassHumanized("Empresa")
@EntityClassPluralHumanized("Empresas")
entity Company {}
```

`female` variant is supported by `pt-br` locale.

##### Authority

Secure the entity with the authority.

```
@EntityAuthority(ROLE_ADMIN)
@EntityReadAuthority(ROLE_USER)
entity Department {}
```

##### Admin Entity

Declare the entity as an admin entity like User and Authority.
The entity is added to the admin menu and secured with ROLE_ADMIN authority.

```
@AdminEntity
entity Department {}
```

### Fields

#### Notable customizations

##### Label

```jdl
entity Company {
  @FieldNameHumanized('Company Name')
  company_name
}
```

### Relationships

#### Notable customizations

##### Label

```jdl
relationship ManyToOne {
  @RelationshipNameHumanized('Company user') Company{user} to User
}
```

##### Eager loading relationships

Appliable to SQL/spring-data-relational with partial support at MongoDb/spring-data-mongodb.
Neo4j eager loads every relationship by default.

JHipster UI uses only the id and `otherEntityFieldName` properties, by default only fields used by the UI will be fetched.

```jdl
relationship OneToMany {
  @RelationshipEagerLoad Bar to @RelationshipEagerLoad Foo
}
```

Related issues: (#23917)[https://github.com/jhipster/generator-jhipster/issues/23917]
