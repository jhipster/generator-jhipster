package <%=packageName%>.web.rest;

import <%=packageName%>.web.rest.dto.RouteDTO;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.*;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.netflix.zuul.filters.ProxyRouteLocator;
import org.springframework.http.*;
import org.springframework.security.web.access.WebInvocationPrivilegeEvaluator;
import org.springframework.web.bind.annotation.*;

import com.codahale.metrics.annotation.Timed;

/**
 * REST controller for managing Gateway configuration.
 */
@RestController
@RequestMapping("/api/gateway")
public class GatewayResource {

    private final Logger log = LoggerFactory.getLogger(GatewayResource.class);

    @Inject
    private ProxyRouteLocator routeLocator;

    @Inject
    private DiscoveryClient discoveryClient;

    /**
     * GET  /routes : get the active routes.
     * 
     * @return the ResponseEntity with status 200 (OK) and with body the list of routes
     */
    @RequestMapping(value = "/routes",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<RouteDTO>> activeRoutes() {
        Map<String, String> routes = routeLocator.getRoutes();
        List<RouteDTO> routeDTOs = new ArrayList<>();
        routes.forEach((path, serviceId) -> {
            RouteDTO routeDTO = new RouteDTO();
            routeDTO.setPath(path);
            routeDTO.setServiceId(serviceId);
            routeDTO.setServiceInstances(discoveryClient.getInstances(serviceId));
            routeDTOs.add(routeDTO);
        });
        return new ResponseEntity<>(routeDTOs, HttpStatus.OK);
    }
}
