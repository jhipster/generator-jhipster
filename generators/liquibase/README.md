# SQL/spring-data-relational sub-generator

Adds support to liquibase to SQL databases and Neo4j.

## Customizing

Customizing basics can be found at [Customizing](../app/README.md#customizing)

### Notable relationships customizations

#### OnUpdate/OnDelete

```jdl
relationship ManyToOne {
  A to @OnDelete("SET NULL") @OnUpdate("CASCADE") B
}
```

Allowed values: `NO ACTION | RESTRICT | CASCADE | SET NULL | SET DEFAULT`
