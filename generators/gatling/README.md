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
