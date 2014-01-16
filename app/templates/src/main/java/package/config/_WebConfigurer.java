package <%=packageName%>.config;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.health.HealthCheckRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.AdminServlet;
import com.codahale.metrics.servlets.HealthCheckServlet;
import com.codahale.metrics.servlets.MetricsServlet;<% if (clusteredHttpSession == 'hazelcast') { %>
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.web.SessionListener;
import com.hazelcast.web.WebFilter;<% } %>
import <%=packageName%>.web.filter.CachingHttpHeadersFilter;
import <%=packageName%>.web.filter.gzip.GZipServletFilter;
import org.atmosphere.cache.UUIDBroadcasterCache;
import org.atmosphere.cpr.AtmosphereServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.inject.Inject;
import javax.servlet.*;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;<% if (clusteredHttpSession == 'hazelcast') { %>
import java.util.Properties;<% } %>

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
@AutoConfigureAfter(CacheConfiguration.class)
public class WebConfigurer implements ServletContextInitializer {

    private final Logger log = LoggerFactory.getLogger(WebConfigurer.class);

    @Inject
    private MetricRegistry metricRegistry;

    @Inject
    private HealthCheckRegistry healthCheckRegistry;

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        log.info("Web application configuration");
        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);
        <% if (clusteredHttpSession == 'hazelcast') { %>
        initClusteredHttpSessionFilter(servletContext, disps);<% } %>
        initMetrics(servletContext, disps);
        initAtmosphereServlet(servletContext);
        if (WebApplicationContextUtils
                .getRequiredWebApplicationContext(servletContext)
                .getBean(Environment.class)
                .acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {

            initCachingHttpHeadersFilter(servletContext, disps);
        }
        initGzipFilter(servletContext, disps);

        log.debug("Web application fully configured");
    }<% if (clusteredHttpSession == 'hazelcast') { %>

    /**
     * Initializes the Clustered Http Session filter
     */
    private void initClusteredHttpSessionFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering Clustered Http Session Filter");

        disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC, DispatcherType.INCLUDE);
        servletContext.addListener(new SessionListener());

        WebFilter webFilter = new WebFilter() {
            @Override
            protected HazelcastInstance getInstance(Properties properties) throws ServletException {
                return CacheConfiguration.getHazelcastInstance();
            }
        };

        final FilterRegistration.Dynamic hazelcastWebFilter = servletContext.addFilter("hazelcastWebFilter", webFilter);

        Map<String, String> parameters = new HashMap<String, String>();
        // Name of the distributed map storing your web session objects
        parameters.put("map-name", "clustered-http-sessions");

        // How is your load -balancer configured ?
        // sticky-session means all requests of a session
        // is routed to the node where the session is first created.
        // This is excellent for performance.
        // If sticky-session is set to false, when a session is updated
        // on a node, entry for this session on all other nodes is invalidated.
        // You have to know how your load -balancer is configured before
        // setting this parameter. Default is true.
        parameters.put("sticky-session", "false");

        // Name of session id cookie
        parameters.put("cookie-name", "hazelcast.sessionId");

        // Are you debugging? Default is false.
        if (WebApplicationContextUtils
                .getRequiredWebApplicationContext(servletContext)
                .getBean(Environment.class)
                .acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
            parameters.put("debug", "false");
        } else {
            parameters.put("debug", "true");
        }

        // Do you want to shutdown HazelcastInstance during
        // web application undeploy process?
        // Default is true.
        parameters.put("shutdown-on-destroy", "true");

        hazelcastWebFilter.setInitParameters(parameters);
        hazelcastWebFilter.addMappingForUrlPatterns(disps, false, "/*");
        hazelcastWebFilter.setAsyncSupported(true);
    }<% } %>

    /**
     * Initializes the GZip filter.
     */
    private void initGzipFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering GZip Filter");

        FilterRegistration.Dynamic compressingFilter = servletContext.addFilter("gzipFilter", new GZipServletFilter());
        Map<String, String> parameters = new HashMap<String, String>();

        compressingFilter.setInitParameters(parameters);

        compressingFilter.addMappingForUrlPatterns(disps, true, "*.css");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.json");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.html");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.js");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/app/rest/*");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/metrics/*");

        compressingFilter.setAsyncSupported(true);
    }

    /**
     * Initializes the cachig HTTP Headers Filter.
     */
    private void initCachingHttpHeadersFilter(ServletContext servletContext,
                                              EnumSet<DispatcherType> disps) {
        log.debug("Registering Cachig HTTP Headers Filter");
        FilterRegistration.Dynamic cachingHttpHeadersFilter =
                servletContext.addFilter("cachingHttpHeadersFilter",
                        new CachingHttpHeadersFilter());

        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/images/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/fonts/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/styles/*");
        cachingHttpHeadersFilter.setAsyncSupported(true);
    }

    /**
     * Initializes Metrics.
     */
    private void initMetrics(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Initializing Metrics registries");
        servletContext.setAttribute(InstrumentedFilter.REGISTRY_ATTRIBUTE,
                metricRegistry);
        servletContext.setAttribute(MetricsServlet.METRICS_REGISTRY,
                metricRegistry);
        servletContext.setAttribute(HealthCheckServlet.HEALTH_CHECK_REGISTRY,
                healthCheckRegistry);

        log.debug("Registering Metrics Filter");
        FilterRegistration.Dynamic metricsFilter = servletContext.addFilter("webappMetricsFilter",
                new InstrumentedFilter());

        metricsFilter.addMappingForUrlPatterns(disps, true, "/*");
        metricsFilter.setAsyncSupported(true);

        log.debug("Registering Metrics Admin Servlet");
        ServletRegistration.Dynamic metricsAdminServlet =
                servletContext.addServlet("metricsAdminServlet", new AdminServlet());

        metricsAdminServlet.addMapping("/metrics/*");
        metricsAdminServlet.setAsyncSupported(true);
        metricsAdminServlet.setLoadOnStartup(2);
    }

    /**
     * Initializes Atmosphere.
     */
    private void initAtmosphereServlet(ServletContext servletContext) {
        log.debug("Registering Atmosphere Servlet");
        ServletRegistration.Dynamic atmosphereServlet =
                servletContext.addServlet("atmosphereServlet", new AtmosphereServlet());

        atmosphereServlet.setInitParameter("org.atmosphere.cpr.packages", "com.mycompany.myapp.web.websocket");
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcasterCacheClass", UUIDBroadcasterCache.class.getName());
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcaster.shareableThreadPool", "true");
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcaster.maxProcessingThreads", "10");
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcaster.maxAsyncWriteThreads", "10");

        atmosphereServlet.addMapping("/websocket/*");
        atmosphereServlet.setLoadOnStartup(3);
        atmosphereServlet.setAsyncSupported(true);
    }
}
