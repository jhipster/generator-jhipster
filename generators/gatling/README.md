# Gatling sub-generator

Generates load testing simulations for entities using [Gatling](https://gatling.io/).

## Logging tips

```
LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
{
    // Log all HTTP requests
    //context.getLogger("io.gatling.http").setLevel(Level.valueOf("TRACE"));
    // Log failed HTTP requests
    //context.getLogger("io.gatling.http").setLevel(Level.valueOf("DEBUG"));
}
```
