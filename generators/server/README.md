# server sub-generator

Server generator.

## Customizing

### Entities

#### Notable customizations

##### Layers

Every layer is generated for every Entity by default.
It's possible to disable layers.

```
@EntityDomainLayer(false)
@EntityPersistenceLayer(false)
@EntityRestLayer(false)
entity OptionalLayers {}
```
