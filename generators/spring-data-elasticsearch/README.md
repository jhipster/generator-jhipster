# spring-data-elasticsearch sub-generator

Elasticsearch for Spring generator.

## Customizing

### Entities

#### Notable customizations

##### Search Layer

Disable the search service generation.

```
@EntitySearchLayer(false)
entity OptionalLayers {}
```
