package <%=packageName%>.config;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.MetricsServlet;<% if (clusteredHttpSession == 'hazelcast') { %>
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.web.SessionListener;
import com.hazelcast.web.WebFilter;<% } %>
import <%=packageName%>.web.filter.CachingHttpHeadersFilter;
import <%=packageName%>.web.filter.StaticResourcesProductionFilter;
import <%=packageName%>.web.filter.gzip.GZipServletFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.context.embedded.ConfigurableEmbeddedServletContainer;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.boot.context.embedded.MimeMappings;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;<% if (clusteredHttpSession == 'hazelcast') { %>
import org.springframework.web.context.support.WebApplicationContextUtils;<% } %>

import javax.inject.Inject;
import javax.servlet.*;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;<% if (clusteredHttpSession == 'hazelcast') { %>
import java.util.Properties;<% } %>

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
@AutoConfigureAfter(CacheConfiguration.class)
public class WebConfigurer implements ServletContextInitializer, EmbeddedServletContainerCustomizer {

    private final Logger log = LoggerFactory.getLogger(WebConfigurer.class);

    @Inject
    private Environment env;

    @Autowired(required = false)
    private MetricRegistry metricRegistry;

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        log.info("Web application configuration, using profiles: {}", Arrays.toString(env.getActiveProfiles()));
        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);<% if (clusteredHttpSession == 'hazelcast') { %>
        initClusteredHttpSessionFilter(servletContext, disps);<% } %>
        if (!env.acceptsProfiles(Constants.SPRING_PROFILE_FAST)) {
            initMetrics(servletContext, disps);
        }
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
            initCachingHttpHeadersFilter(servletContext, disps);
            initStaticResourcesProductionFilter(servletContext, disps);
        }
        initGzipFilter(servletContext, disps);<% if (devDatabaseType == 'h2Memory') { %>
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_DEVELOPMENT)) {
            initH2Console(servletContext);
        }<% } %>
        log.info("Web application fully configured");
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

        FilterRegistration.Dynamic hazelcastWebFilter = servletContext.addFilter("hazelcastWebFilter", webFilter);
        Map<String, String> parameters = new HashMap<>();
        // Name of the distributed map storing your web session objects
        parameters.put("map-name", "clustered-http-sessions");

        // How is your load-balancer configured?
        // Setting "sticky-session" to "true" means all requests of a session
        // are routed to the node where the session is first created.
        // This is excellent for performance.
        // If "sticky-session" is set to "false", then when a session is updated
        // on a node, entries for this session on all other nodes are invalidated.
        // You have to know how your load-balancer is configured before
        // setting this parameter. Default is true.
        parameters.put("sticky-session", "false");

        // Name of session id cookie
        parameters.put("cookie-name", "hazelcast.sessionId");

        // Are you debugging? Default is false.
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
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
     * Set up Mime types.
     */
    @Override
    public void customize(ConfigurableEmbeddedServletContainer container) {
        MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
        // IE issue, see https://github.com/jhipster/generator-jhipster/pull/711
        mappings.add("html", "text/html;charset=utf-8");
        // CloudFoundry issue, see https://github.com/cloudfoundry/gorouter/issues/64
        mappings.add("json", "text/html;charset=utf-8");
        container.setMimeMappings(mappings);
    }

    /**
     * Initializes the GZip filter.
     */
    private void initGzipFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering GZip Filter");
        FilterRegistration.Dynamic compressingFilter = servletContext.addFilter("gzipFilter", new GZipServletFilter());
        Map<String, String> parameters = new HashMap<>();
        compressingFilter.setInitParameters(parameters);
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.css");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.json");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.html");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.js");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/api/*");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/metrics/*");
        compressingFilter.setAsyncSupported(true);
    }

    /**
     * Initializes the static resources production Filter.
     */
    private void initStaticResourcesProductionFilter(ServletContext servletContext,
                                                     EnumSet<DispatcherType> disps) {

        log.debug("Registering static resources production Filter");
        FilterRegistration.Dynamic staticResourcesProductionFilter =
                servletContext.addFilter("staticResourcesProductionFilter",
                        new StaticResourcesProductionFilter());

        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/index.html");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/assets/*");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
        staticResourcesProductionFilter.setAsyncSupported(true);
    }

    /**
     * Initializes the cachig HTTP Headers Filter.
     */
    private void initCachingHttpHeadersFilter(ServletContext servletContext,
                                              EnumSet<DispatcherType> disps) {
        log.debug("Registering Caching HTTP Headers Filter");
        FilterRegistration.Dynamic cachingHttpHeadersFilter =
                servletContext.addFilter("cachingHttpHeadersFilter",
                        new CachingHttpHeadersFilter());

        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/assets/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
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

        log.debug("Registering Metrics Filter");
        FilterRegistration.Dynamic metricsFilter = servletContext.addFilter("webappMetricsFilter",
                new InstrumentedFilter());

        metricsFilter.addMappingForUrlPatterns(disps, true, "/*");
        metricsFilter.setAsyncSupported(true);

        log.debug("Registering Metrics Servlet");
        ServletRegistration.Dynamic metricsAdminServlet =
                servletContext.addServlet("metricsServlet", new MetricsServlet());

        metricsAdminServlet.addMapping("/metrics/metrics/*");
        metricsAdminServlet.setAsyncSupported(true);
        metricsAdminServlet.setLoadOnStartup(2);
    }<% if (devDatabaseType == 'h2Memory') { %>

    /**
     * Initializes H2 console
     */
    private void initH2Console(ServletContext servletContext) {
        log.debug("Initialize H2 console");
        ServletRegistration.Dynamic h2ConsoleServlet = servletContext.addServlet("H2Console", new org.h2.server.web.WebServlet());
        h2ConsoleServlet.addMapping("/console/*");
        h2ConsoleServlet.setInitParameter("-properties", "src/main/resources");
        h2ConsoleServlet.setLoadOnStartup(1);
    }<% } %>
}
