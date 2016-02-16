package <%=packageName%>.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.netflix.zuul.filters.ProxyRouteLocator;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.swagger.web.SwaggerResource;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST controller for retrieving all registered microservices Swagger resources.
 */
@RestController
public class GatewaySwaggerApiResource {

    private final Logger log = LoggerFactory.getLogger(GatewaySwaggerApiResource.class);

    @Inject
    private ProxyRouteLocator routeLocator;

    @Inject
    private DiscoveryClient discoveryClient;

    /**
     * GET  /swagger-resources : get the currently registered microservices swagger resources
     * (Override the Springfox provided /swagger-resources endpoint)
     * 
     * @return the ResponseEntity with status 200 (OK) and with body the list of swagger resources
     */
    @RequestMapping(value = "/swagger-resources",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    ResponseEntity<List<SwaggerResource>> swaggerResources() {
        List<SwaggerResource> resources = new ArrayList<>();

        //Add the default swagger resource that correspond to the gateway's own swagger doc
        resources.add(swaggerResource("default", "/v2/api-docs", "2.0"));

        //Add the registered microservices swagger docs as additional swagger resources
        Map<String, String> routes = routeLocator.getRoutes();
        routes.forEach((path, serviceId) -> {
            resources.add(swaggerResource(serviceId, path.replace("**","v2/api-docs"), "2.0"));
        });
        return new ResponseEntity<>(resources, HttpStatus.OK);
    }

    private SwaggerResource swaggerResource(String name, String location, String version) {
        SwaggerResource swaggerResource = new SwaggerResource();
        swaggerResource.setName(name);
        swaggerResource.setLocation(location);
        swaggerResource.setSwaggerVersion(version);
        return swaggerResource;
    }
}
