package com.mycompany.myapp.config.apidoc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.netflix.zuul.filters.ProxyRouteLocator;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import springfox.documentation.swagger.web.SwaggerResource;
import springfox.documentation.swagger.web.SwaggerResourcesProvider;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Retrieves all registered microservices Swagger resources.
 */
@Component
@Primary
public class GatewaySwaggerResourcesProvider implements SwaggerResourcesProvider {

    private final Logger log = LoggerFactory.getLogger(GatewaySwaggerResourcesProvider.class);

    @Inject
    private ProxyRouteLocator routeLocator;

    @Inject
    private DiscoveryClient discoveryClient;

    @Override
    public List<SwaggerResource> get() {
        List<SwaggerResource> resources = new ArrayList<>();

        //Add the default swagger resource that correspond to the gateway's own swagger doc
        resources.add(swaggerResource("default", "/v2/api-docs"));

        //Add the registered microservices swagger docs as additional swagger resources
        Map<String, String> routes = routeLocator.getRoutes();
        routes.forEach((path, serviceId) -> {
            resources.add(swaggerResource(serviceId, path.replace("**","v2/api-docs")));
        });

        return resources;
    }

    private SwaggerResource swaggerResource(String name, String location) {
        SwaggerResource swaggerResource = new SwaggerResource();
        swaggerResource.setName(name);
        swaggerResource.setLocation(location);
        swaggerResource.setSwaggerVersion("2.0");
        return swaggerResource;
    }

}
