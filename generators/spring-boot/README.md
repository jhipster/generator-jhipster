# spring-boot sub-generator

Spring Boot generator.

## Customizing

### Entities

#### Notable customizations

##### Layers

Customize @PreAuthorize annotations at Rest layer.
Calculated using (@EntityAuthority)[../app/README.md#Authority] by default.

```
@EntitySpringPreAuthorize("hasAuthority('ROLE_CUSTOM')")
@EntitySpringReadPreAuthorize("hasAuthority('ROLE_CUSTOM_READ')")
entity CustomPreAuthorize {}
```
